#!/usr/bin/env node
/**
 * PiatraBench — Layer 0 deterministic scorer.
 *
 * Walks every playground under app/playgrounds, scores it against the current
 * template (CLAUDE.md), attributes `tsc` diagnostics per-playground, and writes
 * a human report (report.md) + machine report (report.json).
 *
 * No model calls, no dependencies. This is the floor every other layer
 * (LLM-judge rubric, Elo arena, model leaderboard) hangs off.
 *
 *   node piatrabench/scorer.mjs            # full run, includes tsc build check
 *   node piatrabench/scorer.mjs --no-build # skip tsc (instant)
 *   node piatrabench/scorer.mjs --links    # also resolve external citations (slow, network)
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PG_ROOT = path.join(ROOT, 'app', 'playgrounds');
const OUT_DIR = path.join(ROOT, 'piatrabench');

const ARGS = new Set(process.argv.slice(2));
const DO_BUILD = !ARGS.has('--no-build');
const DO_LINKS = ARGS.has('--links');
const DO_CALIBRATION = !ARGS.has('--no-calibration');
const DO_RUNS = ARGS.has('--runs');
const RUNS_DIR = path.join(OUT_DIR, 'runs');

// ---------------------------------------------------------------------------
// Classification enums (from data/classification, per CLAUDE.md)
// ---------------------------------------------------------------------------
const TOPICS = new Set([
    'mathematics', 'physics', 'chemistry', 'biology', 'neuroscience',
    'computer-science', 'economics', 'political-science', 'psychology',
    'sociology', 'philosophy', 'aesthetics',
]);
const OPERATIONS = new Set([
    'landscape', 'threshold', 'symmetry', 'morphogenesis', 'anatomy', 'tension',
]);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

// ---------------------------------------------------------------------------
// small fs helpers
// ---------------------------------------------------------------------------
const exists = (p) => { try { fs.accessSync(p); return true; } catch { return false; } };
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };

// model attribution: the generating model self-declared in versions.ts (llm field).
function normalizeModel(raw) {
    if (!raw) return null;
    const key = raw.toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!key) return null;
    const label = key.split(' ')
        .map((w) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');
    return { key, label };
}
function extractModel(dir) {
    const v = read(path.join(dir, 'versions.ts'));
    if (!v) return null;
    const m = v.match(/llm:\s*['"`]([^'"`]+)['"`]/);
    return m ? normalizeModel(m[1]) : null;
}

function aggregateModels(results) {
    const groups = {};
    for (const r of results) {
        if (!r.modelKey) continue;
        const g = (groups[r.modelKey] ??= {
            key: r.modelKey, label: r.model, n: 0, sum: 0,
            cat: { build: [], meta: [], structure: [], infra: [], style: [] }, best: null,
        });
        g.n++; g.sum += r.headline;
        for (const k of Object.keys(g.cat)) if (r.catPct[k] != null) g.cat[k].push(r.catPct[k]);
        if (!g.best || r.headline > g.best.score) g.best = { slug: r.slug, name: r.name, score: r.headline };
    }
    const mean = (a) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : null);
    return Object.values(groups).map((g) => ({
        key: g.key, label: g.label, n: g.n,
        mean: Math.round((g.sum / g.n) * 10) / 10,
        meanByCat: Object.fromEntries(Object.entries(g.cat).map(([k, v]) => [k, mean(v)])),
        best: g.best,
    })).sort((a, b) => b.mean - a.mean);
}

// honesty gate on calibration FIT: only errors above this (100%) gate. Far looser
// than the 0.35 display band, so an honest-but-imperfect model is never punished;
// only an undeclared blowup (e.g. a rigged or broken calibration) trips it.
const FIT_GATE = 1.0;

// strip comments before source analysis so a `// predicted: ...` note or a big
// header block never registers as a real value. The `[^:]` guard keeps `://` in
// URLs (which live in `source` strings) from being mistaken for a line comment.
function stripComments(s) {
    return s
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

// identifiers imported from ./logic — a proxy for "predicted actually runs the model".
function logicImports(src) {
    const ids = new Set();
    const re = /import\s*(?:type\s+)?(?:\{([^}]*)\}|\*\s*as\s+([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*))\s*from\s*['"`]\.\/logic/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        if (m[1]) for (const part of m[1].split(',')) {
            const name = part.trim().split(/\s+as\s+/).pop().trim();
            if (name) ids.add(name);
        }
        if (m[2]) ids.add(m[2]);
        if (m[3]) ids.add(m[3]);
    }
    return ids;
}

// module-scope `const X = <numeric literal>` — the laundering vehicle: a literal
// stashed in a const and then wrapped so `predicted:` no longer starts with a digit.
function numericConsts(src) {
    const set = new Set();
    const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*-?\d+(?:\.\d+)?(?:e-?\d+)?\s*;?/g;
    let m;
    while ((m = re.exec(src)) !== null) set.add(m[1]);
    return set;
}

// for each `key:` in src, the object-property RHS expression (balanced through
// parens/brackets/strings, ending at the top-level comma/semicolon/closing brace),
// normalized to single spaces. Type annotations (`let predicted: number`, interface
// fields) are skipped so they are never mistaken for a value.
function extractRhs(src, key) {
    const out = [];
    const re = new RegExp(`\\b${key}\\s*:`, 'g');
    let m;
    while ((m = re.exec(src)) !== null) {
        // skip declarations: `let/const/var/readonly predicted: number`
        if (/(?:let|const|var|readonly)\s+$/.test(src.slice(Math.max(0, m.index - 12), m.index))) continue;
        let i = re.lastIndex;
        while (i < src.length && /\s/.test(src[i])) i++;
        const start = i;
        let depth = 0, inStr = false, q = '', esc = false;
        for (; i < src.length; i++) {
            const c = src[i];
            if (inStr) {
                if (esc) { esc = false; continue; }
                if (c === '\\') { esc = true; continue; }
                if (c === q) inStr = false;
                continue;
            }
            if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
            if (c === '(' || c === '[' || c === '{') depth++;
            else if (c === ')' || c === ']' || c === '}') { if (depth === 0) break; depth--; }
            else if ((c === ',' || c === ';') && depth === 0) break;
        }
        const text = src.slice(start, i).trim().replace(/\s+/g, ' ');
        // skip bare TS primitive type annotations (interface/type fields)
        if (/^(?:number|string|boolean)\b/.test(text)) continue;
        out.push({ pos: m.index, text });
    }
    return out;
}

function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// a `predicted` RHS that is a bare numeric literal, or a numeric-literal const wrapped
// in round*/Number/toFixed — i.e. no genuine computation. A call into ./logic is never
// literalish (that IS the computation), so real model output is safe.
function isLiteralish(text, numConsts, logicIds) {
    for (const id of logicIds) if (new RegExp(`\\b${escapeReg(id)}\\b`).test(text)) return false;
    let t = text.trim()
        .replace(/\bNumber\s*\(/g, '(')
        .replace(/\.toFixed\s*\([^)]*\)/g, '')
        .replace(/\bround\d*\s*\(/gi, '(')
        .trim();
    while (t.startsWith('(') && t.endsWith(')')) t = t.slice(1, -1).trim();
    if (/^-?\d+(?:\.\d+)?(?:e-?\d+)?$/.test(t)) return true;
    if (/^[A-Za-z_$][\w$]*$/.test(t) && numConsts.has(t)) return true;
    return false;
}

// honesty: execute calibration.ts headlessly (child process), then judge it on three
// axes — is `predicted` genuinely computed (not hardcoded/laundered), is it independent
// of `expected` (not circular), and does the declared fit hold (not miscalibrated)?
function runCalibration(dir) {
    const file = path.join(dir, 'calibration.ts');
    if (!exists(file)) return { status: 'na', fit: null, kind: null };
    if (!DO_CALIBRATION) return { status: 'skipped', fit: null, kind: null };
    const res = spawnSync('node', [path.join(OUT_DIR, 'run-calibration.cjs'), file], {
        cwd: ROOT, encoding: 'utf8', timeout: 30000, maxBuffer: 8 * 1024 * 1024,
    });
    let parsed;
    try { parsed = JSON.parse((res.stdout || '').trim()); } catch { parsed = { status: 'error', message: 'unparseable output' }; }

    // --- source-level analysis (comments stripped) ---
    const src = stripComments(read(file));
    const logicIds = logicImports(src);
    const importsLogic = /from\s+['"`]\.\/logic/.test(src);
    const numConsts = numericConsts(src);
    const preds = extractRhs(src, 'predicted');
    const exps = extractRhs(src, 'expected');

    // laundering: every `predicted` is a literal or a wrapped numeric-literal const.
    const predLit = preds.filter((p) => isLiteralish(p.text, numConsts, logicIds)).length;
    const hardcoded = preds.length > 0 && predLit === preds.length;

    // circularity: pair each `predicted` with its neighbouring `expected` by source
    // position and flag an identical expression on both sides — a self-comparison that
    // checks nothing. A shared ./logic callee with DIFFERENT args is deliberately NOT
    // flagged: that is an invariance/symmetry test (e.g. chladni S(x,y;m,n) == S(x,y;n,m)),
    // a legitimate and encouraged calibration pattern.
    const marks = [...preds.map((p) => ({ ...p, k: 'p' })), ...exps.map((e) => ({ ...e, k: 'e' }))]
        .sort((a, b) => a.pos - b.pos);
    let circularExact = false;
    for (let i = 0; i < marks.length - 1; i++) {
        const a = marks[i], b = marks[i + 1];
        if (a.k === b.k) continue;
        const p = a.k === 'p' ? a : b;
        const e = a.k === 'e' ? a : b;
        if (p.text && /[A-Za-z_$]/.test(p.text) && p.text === e.text) { circularExact = true; break; }
    }

    const worstGating = (typeof parsed.worstGating === 'number') ? parsed.worstGating : null;
    const kind = parsed.kind || null;

    let status;
    if (parsed.status === 'na') status = 'na';
    else if (parsed.status === 'error') status = 'unverified';
    else if (hardcoded) status = 'hardcoded';
    else if (circularExact) status = 'circular-exact';
    else if (kind === 'showcase' || worstGating == null) status = 'showcase';
    else if (kind === 'validation' && importsLogic && worstGating <= FIT_GATE) status = 'validated';
    else if (worstGating > FIT_GATE) status = 'miscalibrated';
    else status = 'reproduces';

    return {
        status,
        n: parsed.n || 0,
        kind,
        fit: parsed.status === 'ok' ? { mean: parsed.mean, worst: parsed.worst, worstGating } : null,
        message: parsed.message || null,
    };
}

// heuristic flags for cosmetic dishonesty (not gating; surfaced for review).
function honestyFlags(source) {
    const flags = [];
    if (/function\s+amplify\b|\bamplify\s*\(/.test(source)) flags.push('metric amplification (amplify())');
    return flags;
}

// honesty is a GATE, not a deduction: a failing check caps the headline score so
// polish can never buy back fabrication. Gating calibration states are hardcoded,
// circular-exact (predicted === expected), and miscalibrated (an undeclared fit
// blowup or a claimed validation that misses); a dead citation gates too. A stub
// (placeholder playground) caps separately. `showcase`, `reproduces`, `validated`,
// and not-auto-verifiable (`na`) never gate.
function finalize(r) {
    let citations = 'unchecked';
    if (DO_LINKS) {
        const hasCite = r.citations.length > 0;
        // only a true 404/410 counts as dead; publisher 403s and transient errors do not gate.
        const dead = (r.brokenCitations || []).filter((b) => b.status === 404 || b.status === 410);
        citations = dead.length ? 'fail' : (hasCite ? 'pass' : 'na');
    }
    const calStatus = r.calibration ? r.calibration.status : 'na';
    const GATING_CAL = ['hardcoded', 'circular-exact', 'miscalibrated'];
    const honestyFail = citations === 'fail' || GATING_CAL.includes(calStatus);
    r.stubbed = r.stub === true;
    r.honesty = {
        calibration: calStatus,
        kind: r.calibration?.kind || null,
        fit: r.calibration?.fit || null,
        citations,
        flags: r.honestyWarnings || [],
        verdict: honestyFail ? 'fail' : 'ok',
    };
    r.headline = (honestyFail || r.stubbed) ? Math.min(r.score, 40) : r.score;
}

function walk(dir, { skip = [] } = {}) {
    const out = [];
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
        if (skip.includes(e.name) || e.name.startsWith('.')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(full, { skip }));
        else out.push(full);
    }
    return out;
}

// ---------------------------------------------------------------------------
// parse data.ts registry (string-aware bracket scan, then eval the literal)
// ---------------------------------------------------------------------------
function parseRegistry() {
    return parseRegistryFrom(path.join(PG_ROOT, 'data.ts'));
}

function parseRegistryFrom(file) {
    const raw = read(file);
    const eq = raw.indexOf('= [');
    if (eq < 0) return [];
    const start = raw.indexOf('[', eq);
    let depth = 0, inStr = false, q = '', esc = false, end = -1;
    for (let i = start; i < raw.length; i++) {
        const c = raw[i];
        if (inStr) {
            if (esc) { esc = false; continue; }
            if (c === '\\') { esc = true; continue; }
            if (c === q) inStr = false;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
        if (c === '[') depth++;
        else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) return [];
    const literal = raw.slice(start, end + 1);
    try {
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${literal});`)();
    } catch (err) {
        console.error('Could not parse data.ts registry:', err.message);
        return [];
    }
}

// ---------------------------------------------------------------------------
// discover playgrounds
// ---------------------------------------------------------------------------
function discover() {
    const pages = walk(PG_ROOT).filter((f) =>
        f.endsWith(`${path.sep}page.tsx`) && !f.includes(`${path.sep}research${path.sep}`));
    const pgs = [];
    for (const page of pages) {
        const dir = path.dirname(page);
        const rel = path.relative(ROOT, dir);
        const slug = path.basename(dir);
        const ym = rel.match(/\((\d{4})\)[/\\]\((\d{2})\)/);
        const year = ym ? +ym[1] : null;
        const month = ym ? +ym[2] : null;
        const pathDate = ym ? `${MONTHS[month - 1]} ${year}` : null;
        // only real playgrounds live under a (YYYY)/(MM) route group; this skips
        // the app/playgrounds/page.tsx index itself.
        if (!ym) continue;
        pgs.push({ slug, dir, rel, year, month, pathDate, era: year ? `${year}` : 'unknown' });
    }
    return pgs.sort((a, b) => (a.year - b.year) || (a.month - b.month) || a.slug.localeCompare(b.slug));
}

// ---------------------------------------------------------------------------
// tsc build check (one run, attribute diagnostics to playground dirs)
// ---------------------------------------------------------------------------
function runBuild(pgs) {
    if (!DO_BUILD) return { ran: false, byDir: new Map() };
    const bin = path.join(ROOT, 'node_modules', '.bin', 'tsc');
    const res = spawnSync(bin, ['--noEmit', '-p', 'tsconfig.json'], {
        cwd: ROOT, encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024,
    });
    if (res.error) {
        console.error('tsc could not run:', res.error.message);
        return { ran: false, byDir: new Map() };
    }
    const text = `${res.stdout || ''}\n${res.stderr || ''}`;
    const re = /^(.+?\.tsx?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.*)$/gm;
    const byDir = new Map();
    let m;
    while ((m = re.exec(text)) !== null) {
        const file = m[1].replace(/^\.\//, '');
        const pg = pgs.find((p) => file.startsWith(p.rel + path.sep) || file.startsWith(p.rel + '/'));
        if (!pg) continue;
        if (!byDir.has(pg.rel)) byDir.set(pg.rel, []);
        if (byDir.get(pg.rel).length < 5) {
            byDir.get(pg.rel).push(`${file.split('/').pop()}: ${m[4]} ${m[5]}`.slice(0, 140));
        }
    }
    return { ran: true, byDir };
}

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------
const EM_DASH = '—';

function gatherSource(dir) {
    // user-facing source: .ts/.tsx/.md the playground renders, excluding raw
    // ideation prototypes and PLAYGROUND.md (internal notes, never rendered).
    const files = walk(dir, { skip: ['ideation', 'node_modules', '.next'] })
        .filter((f) => /\.(tsx?|md)$/.test(f) && path.basename(f) !== 'PLAYGROUND.md');
    return files.map((f) => ({ f, rel: path.relative(dir, f), text: read(f) }));
}

function scorePlayground(pg, registryBySlug, build) {
    const f = (rel) => path.join(pg.dir, rel);
    const has = (rel) => exists(f(rel));
    const reg = registryBySlug.get(pg.slug) || null;

    const playgroundTsx = read(f('playground.tsx'));
    const pageTsx = read(f('page.tsx'));
    const src = gatherSource(pg.dir);
    const code = src.filter((s) => /\.tsx?$/.test(s.f));
    const codeAndMd = src;
    const joinedCode = code.map((s) => s.text).join('\n');

    // substance helpers: is a module actually imported anywhere in the rendered tree,
    // and is a panel component actually mounted? (catches orphan infra files.)
    const usesModule = (name) => new RegExp(`from\\s+['"\`]\\./${name}(?:['"\`/])`).test(joinedCode);
    const rendersComponent = (C) => joinedCode.includes(`<${C}`);
    // stub: a placeholder playground that renders "coming soon" rather than a real
    // visualization. Comments are stripped so a stray note never trips it.
    const stub = /coming soon|will be visualized here|under construction|not yet implemented/i.test(stripComments(playgroundTsx));

    const checks = [];
    const add = (id, label, category, weight, value, detail = '') => {
        // value: true|false|number(0..1)
        const ratio = value === true ? 1 : value === false ? 0 : value;
        checks.push({ id, label, category, weight, ratio, detail, applicable: true });
    };
    const addNA = (id, label, category, weight, detail) =>
        checks.push({ id, label, category, weight, ratio: 0, detail, applicable: false });

    // --- Build & types (25) ---
    if (build.ran) {
        const errs = build.byDir.get(pg.rel) || [];
        add('build', 'tsc clean', 'build', 20, errs.length === 0,
            errs.length ? `${errs.length}+ error(s): ${errs[0]}` : '');
    } else {
        addNA('build', 'tsc clean', 'build', 20, 'build check skipped');
    }
    const anyHits = (joinedCode.match(/:\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>/g) || []).length;
    add('no-any', 'no `any`', 'build', 5, anyHits === 0, anyHits ? `${anyHits} occurrence(s)` : '');

    // --- Registration & metadata (15) ---
    add('registered', 'in data.ts', 'meta', 5, !!reg, reg ? '' : 'not registered');
    if (reg) {
        const topicsOk = Array.isArray(reg.topics) && reg.topics.length >= 1 &&
            reg.topics.length <= 3 && reg.topics.every((t) => TOPICS.has(t));
        const opsOk = Array.isArray(reg.operations) && reg.operations.length >= 1 &&
            reg.operations.length <= 2 && reg.operations.every((o) => OPERATIONS.has(o));
        add('classification', 'valid topics/operations', 'meta', 4, (topicsOk ? 0.5 : 0) + (opsOk ? 0.5 : 0),
            [topicsOk ? '' : 'bad topics', opsOk ? '' : 'bad operations'].filter(Boolean).join(', '));
        const dateOk = reg.date === pg.pathDate;
        add('date-path', 'date matches path', 'meta', 2, dateOk,
            dateOk ? '' : `registry "${reg.date}" vs path "${pg.pathDate}"`);
    } else {
        add('classification', 'valid topics/operations', 'meta', 4, false, 'no registry entry');
        add('date-path', 'date matches path', 'meta', 2, false, 'no registry entry');
    }
    const ogOk = exists(path.join(ROOT, 'public', 'assets-playgrounds', 'og', `${pg.slug}.png`));
    add('og', 'OG image present', 'meta', 2, ogOk, ogOk ? '' : 'missing og png');
    add('default-og', 'defaultOpenGraph used', 'meta', 2, pageTsx.includes('defaultOpenGraph'));

    // --- Structure (20) ---
    add('layout', 'PlaygroundLayout', 'structure', 6, playgroundTsx.includes('PlaygroundLayout'));
    // a real visualization: the shared PlaygroundViewer wrapper OR a domain-named
    // viewer component (crystallographic-groups' Wallpaper2D/, halley-window's Fractal/, ...),
    // imported either relatively (./components/X) or via the playground-local alias
    // (@/app/playgrounds/.../components/X). Shared UI under @/components/ does not count.
    const rendersViewer = playgroundTsx.includes('PlaygroundViewer')
        || /from\s+['"](?:\.\/|@\/app\/playgrounds\/[^'"]*\/)components\/(?!Settings\b)/.test(playgroundTsx);
    add('viewer', 'renders a viewer', 'structure', 4, rendersViewer,
        rendersViewer ? '' : 'no PlaygroundViewer or domain viewer component');
    add('playground-file', 'playground.tsx', 'structure', 3, !!playgroundTsx);
    // component subdirs with an index.tsx (Settings plus at least one visualizer,
    // whatever it is named).
    let componentDirs = [];
    try {
        componentDirs = fs.readdirSync(f('components'), { withFileTypes: true })
            .filter((e) => e.isDirectory() && exists(path.join(f('components'), e.name, 'index.tsx')))
            .map((e) => e.name);
    } catch { /* no components dir */ }
    const settings = has('components/Settings/index.tsx');
    const viewerLike = componentDirs.some((d) => d !== 'Settings');
    add('settings-viewer', 'Settings + viewer split', 'structure', 4, (settings ? 0.5 : 0) + (viewerLike ? 0.5 : 0),
        [settings ? '' : 'no Settings', viewerLike ? '' : 'no viewer component'].filter(Boolean).join(', '));
    const hasLogic = has('logic') || has('logic.ts') || has('logic/index.ts');
    add('logic', 'logic/ module', 'structure', 3, hasLogic);

    // --- Scientific infrastructure (25) — the file must exist AND be wired into the
    // rendered tree AND carry the expected shape. Existence alone is the orphan-file
    // gaming shape; these sub-scores fold into the same weights (subtotal still 25).
    const aExists = has('assumptions.ts');
    const aSrc = read(f('assumptions.ts'));
    const aWired = usesModule('assumptions') || rendersComponent('AssumptionPanel');
    const aShape = aExists && /confidence:\s*['"`](?:established|contested|speculative)['"`]/.test(aSrc)
        && /falsifiability:/.test(aSrc) && /citation:/.test(aSrc);
    add('assumptions', 'assumptions.ts', 'infra', 7,
        (aExists ? 0.5 : 0) + (aWired ? 0.2 : 0) + (aShape ? 0.3 : 0),
        !aExists ? 'missing' : [aWired ? '' : 'not rendered/wired', aShape ? '' : 'thin shape'].filter(Boolean).join(', '));

    const cExists = has('calibration.ts');
    const cWired = usesModule('calibration') || rendersComponent('CalibrationPanel');
    add('calibration', 'calibration.ts', 'infra', 7,
        (cExists ? 0.6 : 0) + (cWired ? 0.4 : 0),
        !cExists ? 'missing' : (cWired ? '' : 'not rendered/wired'));

    const vExists = has('versions.ts');
    const vSrc = read(f('versions.ts'));
    const vWired = usesModule('versions') || rendersComponent('VersionSelector') || rendersComponent('ModelChangelog');
    const vShape = vExists && /llm:/.test(vSrc) && /date:/.test(vSrc);
    add('versions', 'versions.ts', 'infra', 4,
        (vExists ? 0.5 : 0) + (vWired ? 0.2 : 0) + (vShape ? 0.3 : 0),
        !vExists ? 'missing' : [vWired ? '' : 'not rendered/wired', vShape ? '' : 'thin shape'].filter(Boolean).join(', '));

    const rExists = has('research/content.md');
    const rLinked = /researchUrl/.test(playgroundTsx);
    add('research', 'research companion', 'infra', 7,
        (rExists ? 0.7 : 0) + (rLinked ? 0.3 : 0),
        !rExists ? 'missing' : (rLinked ? '' : 'not linked (no researchUrl)'));

    // --- Style / house rules (15) ---
    const emFiles = codeAndMd.filter((s) => s.text.includes(EM_DASH)).map((s) => s.rel);
    add('no-emdash', 'no em-dashes', 'style', 6, emFiles.length === 0,
        emFiles.length ? `in ${emFiles.slice(0, 3).join(', ')}` : '');
    const outroFont = /font-serif|font-sans/.test(playgroundTsx);
    add('outro-font', 'no font-serif/sans', 'style', 4, !outroFont, outroFont ? 'font-serif/sans present' : '');
    add('palette', 'lime palette', 'style', 5, /lime-/.test(joinedCode));

    // --- informational (not scored) ---
    const roundedHits = (joinedCode.match(/className="[^"]*\brounded\b/g) || []).length;
    const warnings = [];
    if (roundedHits > 0) warnings.push(`${roundedHits} \`rounded\` className(s) — verify none are on main containers/buttons`);

    // citations (extracted always; resolved only with --links). Static extraction
    // from source is noisy, so we are conservative: skip template literals (real
    // code, not URLs), drop text-fragment noise, and balance trailing parens so
    // DOIs like 10.1016/0167-2681(82)90011-7 are not truncated.
    const urls = new Set();
    for (const s of codeAndMd) {
        for (const m of s.text.matchAll(/https?:\/\/[^\s"'`<>]+/g)) {
            let u = m[0];
            if (u.includes('${') || u.includes('`')) continue; // template literal in source
            u = u.split('#:~:text=')[0];
            u = u.replace(/\\/g, ''); // source escaping (\( \)), never part of the real URL
            u = u.replace(/[.,;]+$/, '');
            while (u.endsWith(')') && (u.split(')').length - 1) > (u.split('(').length - 1)) u = u.slice(0, -1);
            if (u.length > 10) urls.add(u);
        }
    }
    const citations = [...urls].filter((u) =>
        !u.includes('piatra.institute') && !u.includes('schema.org') && !u.includes('w3.org'));

    // score
    const applicable = checks.filter((c) => c.applicable);
    const totalW = applicable.reduce((a, c) => a + c.weight, 0);
    const earned = applicable.reduce((a, c) => a + c.weight * c.ratio, 0);
    const score = totalW ? Math.round((earned / totalW) * 1000) / 10 : 0;

    const byCat = {};
    for (const c of applicable) {
        byCat[c.category] ??= { earned: 0, total: 0 };
        byCat[c.category].earned += c.weight * c.ratio;
        byCat[c.category].total += c.weight;
    }
    const catPct = {};
    for (const k of ['build', 'meta', 'structure', 'infra', 'style']) {
        const c = byCat[k];
        catPct[k] = c && c.total ? Math.round((c.earned / c.total) * 100) : null;
    }
    const model = extractModel(pg.dir);
    const calibration = runCalibration(pg.dir);
    const honestyWarnings = honestyFlags(joinedCode);

    const infraCount = ['assumptions.ts', 'calibration.ts', 'versions.ts', 'research/content.md']
        .filter((p) => has(p)).length;

    const failed = checks.filter((c) => c.applicable && c.ratio < 1)
        .map((c) => ({ id: c.id, label: c.label, lost: Math.round(c.weight * (1 - c.ratio) * 10) / 10, detail: c.detail }))
        .sort((a, b) => b.lost - a.lost);

    return {
        slug: pg.slug, rel: pg.rel, link: `/playgrounds/${pg.slug}`,
        date: reg?.date || pg.pathDate, era: pg.era,
        year: pg.year, month: pg.month, name: reg?.name || pg.slug,
        model: model?.label || null, modelKey: model?.key || null,
        score, byCat, catPct, checks, failed, warnings, infraCount, citations,
        calibration, honestyWarnings, stub,
    };
}

// ---------------------------------------------------------------------------
// optional: resolve citations
// ---------------------------------------------------------------------------
async function checkLinks(results) {
    const all = new Map(); // url -> status
    const urls = [...new Set(results.flatMap((r) => r.citations))];
    let i = 0;
    const worker = async () => {
        while (i < urls.length) {
            const url = urls[i++];
            try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 12000);
                let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
                if (res.status >= 400 || res.status === 405) {
                    res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
                }
                clearTimeout(t);
                all.set(url, res.status);
            } catch (e) {
                all.set(url, e.name === 'AbortError' ? 'timeout' : 'error');
            }
        }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    for (const r of results) {
        // a non-2xx is "not OK"; only 404/410 are treated as genuinely dead by
        // the gate. 403/401/429 are publisher anti-bot, 5xx/timeout are transient.
        r.brokenCitations = r.citations
            .map((u) => ({ url: u, status: all.get(u) }))
            .filter((x) => !(typeof x.status === 'number' && x.status >= 200 && x.status < 300));
    }
    return all;
}

// ---------------------------------------------------------------------------
// reporting
// ---------------------------------------------------------------------------
const bar = (n, width = 20) => {
    const filled = Math.round((n / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
};

function buildReports(results, registry, pgs, build) {
    const n = results.length;
    const avg = Math.round((results.reduce((a, r) => a + r.headline, 0) / n) * 10) / 10;
    const sorted = [...results].sort((a, b) => a.headline - b.headline);
    const models = aggregateModels(results);
    const unattributed = results.filter((r) => !r.modelKey).length;
    const honestyCounts = {
        validated: results.filter((r) => r.honesty.calibration === 'validated').length,
        reproduces: results.filter((r) => r.honesty.calibration === 'reproduces').length,
        showcase: results.filter((r) => r.honesty.calibration === 'showcase').length,
        miscalibrated: results.filter((r) => r.honesty.calibration === 'miscalibrated').length,
        notAutoVerifiable: results.filter((r) => ['na', 'skipped'].includes(r.honesty.calibration)).length,
        failed: results.filter((r) => r.honesty.verdict === 'fail').length,
        stubbed: results.filter((r) => r.stubbed).length,
        flagged: results.filter((r) => r.honesty.flags.length > 0).length,
    };
    const stubs = results.filter((r) => r.stubbed).map((r) => r.slug);
    const fitted = results.filter((r) => r.honesty.fit).sort((a, b) => b.honesty.fit.worst - a.honesty.fit.worst);

    // spec drift by era
    const eras = {};
    for (const r of results) {
        eras[r.era] ??= { n: 0, score: 0, infra: 0 };
        eras[r.era].n++; eras[r.era].score += r.score; eras[r.era].infra += r.infraCount;
    }

    // data integrity
    const discoveredSlugs = new Set(pgs.map((p) => p.slug));
    const registrySlugs = registry.map((e) => (e.link || '').replace('/playgrounds/', '')).filter(Boolean);
    const unregistered = pgs.filter((p) => !registrySlugs.includes(p.slug)).map((p) => p.slug);
    const ghosts = registrySlugs.filter((s) => !discoveredSlugs.has(s));

    // ---- console ----
    const L = [];
    L.push('');
    L.push('  PiatraBench · Layer 0 (deterministic conformance)');
    L.push(`  ${n} playgrounds · mean ${avg}/100 · build ${build.ran ? 'on' : 'skipped'}${DO_LINKS ? ' · links checked' : ''}`);
    L.push('');
    L.push('  spec drift by era      avg   infra/4   n');
    for (const era of Object.keys(eras).sort()) {
        const e = eras[era];
        const a = (e.score / e.n).toFixed(1).padStart(5);
        const inf = (e.infra / e.n).toFixed(1);
        L.push(`    ${era}                ${a}     ${inf}     ${e.n}`);
    }
    L.push('');
    L.push('  model leaderboard            mean   n');
    for (const m of models) {
        L.push(`    ${m.label.padEnd(24)} ${m.mean.toFixed(1).padStart(5)}   ${m.n}`);
    }
    L.push(`    ${'(unattributed)'.padEnd(24)}     -   ${unattributed}`);
    L.push('');
    L.push('  most outdated (lowest headline score):');
    for (const r of sorted.slice(0, 20)) {
        const tag = r.honesty.verdict === 'fail' ? ' ⚠ honesty' : '';
        L.push(`    ${String(r.headline).padStart(5)}  ${bar(r.headline)}  ${r.slug}  (${r.date || '?'})${tag}`);
    }
    const perfect = results.filter((r) => r.headline >= 99).length;
    L.push('');
    L.push(`  ${perfect} at >=99/100 · ${results.filter((r) => r.headline >= 90).length} at >=90 · ${results.filter((r) => r.headline < 60).length} below 60`);
    L.push(`  honesty: ${honestyCounts.validated} validated · ${honestyCounts.reproduces} reproduces · ${honestyCounts.showcase} showcase · ${honestyCounts.notAutoVerifiable} not auto-verifiable · ${honestyCounts.failed} failed${DO_LINKS ? '' : ' · (citations unchecked, run --links)'}`);
    if (stubs.length) L.push(`  ! stub playgrounds (capped): ${stubs.join(', ')}`);
    if (unregistered.length) L.push(`  ! unregistered in data.ts: ${unregistered.join(', ')}`);
    if (ghosts.length) L.push(`  ! registry entries with no folder: ${ghosts.join(', ')}`);
    L.push('');
    L.push(`  full report: piatrabench/report.md`);
    L.push('');
    console.log(L.join('\n'));

    // ---- markdown ----
    const md = [];
    md.push('# PiatraBench — Layer 0 report');
    md.push('');
    md.push(`Deterministic conformance of all playgrounds to the current template (CLAUDE.md). No model judgement.`);
    md.push('');
    md.push(`- Generated: ${new Date().toISOString()}`);
    md.push(`- Playgrounds: **${n}**`);
    md.push(`- Mean score: **${avg}/100**`);
    md.push(`- Build check: ${build.ran ? 'enabled (tsc --noEmit, attributed per-playground)' : 'skipped'}`);
    md.push(`- Citation resolution: ${DO_LINKS ? 'enabled' : 'disabled (run with --links)'}`);
    md.push('');
    md.push('Scoring categories (weights): build & types 25, registration & metadata 15, structure 20, scientific infrastructure 25, style & house rules 15. Infra weight is deliberately high because it is the main thing that "needs updating" in older playgrounds; the era column shows that older work predates that part of the template.');
    md.push('');
    md.push('## Spec drift by era');
    md.push('');
    md.push('| era | playgrounds | mean score | mean infra (/4) |');
    md.push('| --- | --- | --- | --- |');
    for (const era of Object.keys(eras).sort()) {
        const e = eras[era];
        md.push(`| ${era} | ${e.n} | ${(e.score / e.n).toFixed(1)} | ${(e.infra / e.n).toFixed(1)} |`);
    }
    md.push('');
    md.push('## Model leaderboard');
    md.push('');
    md.push('Mean Layer 0 conformance per generating model (from each playground\'s versions.ts). Deterministic quality only; subjective judge and Elo scores are future layers. Models are self-declared and the corpus is currently almost entirely Claude, so this compares Claude versions more than vendors.');
    md.push('');
    md.push('| model | playgrounds | mean score | build | meta | structure | infra | style | best |');
    md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    const cm = (v) => (v == null ? '–' : `${v}%`);
    for (const m of models) {
        md.push(`| ${m.label} | ${m.n} | **${m.mean}** | ${cm(m.meanByCat.build)} | ${cm(m.meanByCat.meta)} | ${cm(m.meanByCat.structure)} | ${cm(m.meanByCat.infra)} | ${cm(m.meanByCat.style)} | ${m.best.slug} (${m.best.score}) |`);
    }
    md.push(`| _(unattributed)_ | ${unattributed} | – | | | | | | |`);
    md.push('');

    md.push('## Honesty');
    md.push('');
    md.push('Honesty is a gate, not a deduction: a failing check caps the headline score so polish cannot buy back fabrication. Calibration is executed headlessly and graded on three axes — is `predicted` genuinely computed (not a hardcoded or laundered literal), is it independent of `expected` (not circular), and does the declared fit hold. Calibrations declare their kind via `calibrationMeta` (see CLAUDE.md): **reproduction** (default; `expected` are derived identities), **validation** (`expected` from external/literature targets), or **showcase** (a deliberately poor model, exempt from fit-gating).');
    md.push('');
    md.push(`- **validated** (computed, independent, fits an external target): **${honestyCounts.validated}**`);
    md.push(`- **reproduces** (computed and independent; self-consistency target): ${honestyCounts.reproduces}`);
    md.push(`- **showcase** (intentionally poor fit, declared): ${honestyCounts.showcase}`);
    md.push(`- not auto-verifiable (no calibration, or prediction computed in-component): ${honestyCounts.notAutoVerifiable}`);
    md.push(`- **failed** (dead citation, hardcoded, self-identical, or miscalibrated fit, all capped): ${honestyCounts.failed}`);
    md.push(`- stub playgrounds (placeholder, capped): ${honestyCounts.stubbed}`);
    md.push(`- flagged for review: ${honestyCounts.flagged}`);
    md.push(`- citations: ${DO_LINKS ? 'resolved over the network' : 'not checked (run with --links)'}`);
    md.push('');
    if (fitted.length) {
        md.push('Calibration fit, where `predicted` is verifiable (high error is not necessarily dishonest):');
        md.push('');
        md.push('| playground | pairs | mean error | worst error |');
        md.push('| --- | --- | --- | --- |');
        for (const r of fitted) {
            md.push(`| ${r.slug} | ${r.calibration.n} | ${(r.honesty.fit.mean * 100).toFixed(1)}% | ${(r.honesty.fit.worst * 100).toFixed(1)}% |`);
        }
        md.push('');
    }
    const failed = results.filter((r) => r.honesty.verdict === 'fail');
    if (failed.length) {
        md.push('Honesty failures (headline capped):');
        for (const r of failed) md.push(`- **${r.slug}**: calibration ${r.honesty.calibration}, citations ${r.honesty.citations}`);
        md.push('');
    }
    const flaggedList = results.filter((r) => r.honesty.flags.length);
    if (flaggedList.length) {
        md.push('Flagged for review:');
        for (const r of flaggedList) md.push(`- **${r.slug}**: ${r.honesty.flags.join('; ')}`);
        md.push('');
    }

    if (unregistered.length || ghosts.length || stubs.length) {
        md.push('## Data integrity');
        md.push('');
        if (unregistered.length) md.push(`- **Unregistered** (folder exists, not in data.ts): ${unregistered.map((s) => `\`${s}\``).join(', ')}`);
        if (ghosts.length) md.push(`- **Ghost entries** (in data.ts, no folder): ${ghosts.map((s) => `\`${s}\``).join(', ')}`);
        if (stubs.length) md.push(`- **Stubs** (placeholder playground, headline capped): ${stubs.map((s) => `\`${s}\``).join(', ')}`);
        md.push('');
    }

    md.push('## Needs updating');
    md.push('');
    md.push('Sorted by ascending conformance. "Top losses" are the highest-weight failing checks — the fastest points to recover.');
    md.push('');
    for (const r of sorted) {
        if (r.headline >= 99 && r.failed.length === 0 && r.honesty.verdict === 'ok') continue;
        const losses = r.failed.slice(0, 6).map((x) => `${x.label}${x.detail ? ` (${x.detail})` : ''}`).join('; ');
        const honFail = r.honesty.verdict === 'fail' ? ` · ⚠ HONESTY: calibration ${r.honesty.calibration}, citations ${r.honesty.citations}` : '';
        md.push(`- **${r.slug}** — ${r.headline}/100 · ${r.date || '?'}${losses ? ` · ${losses}` : ''}${honFail}${r.warnings.length ? ` · ${r.warnings.join('; ')}` : ''}`);
    }
    md.push('');
    if (DO_LINKS) {
        const withBroken = results.filter((r) => r.brokenCitations && r.brokenCitations.length);
        md.push('## Broken citations');
        md.push('');
        if (!withBroken.length) md.push('None — every external citation resolved.');
        for (const r of withBroken) {
            md.push(`- **${r.slug}**: ${r.brokenCitations.map((b) => `${b.url} → ${b.status}`).join('; ')}`);
        }
        md.push('');
    }
    md.push('## Full scorecard');
    md.push('');
    md.push('| playground | score | honesty | build | meta | structure | infra | style | date |');
    md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    const pct = (c) => c && c.total ? `${Math.round((c.earned / c.total) * 100)}%` : '–';
    const honCell = (r) => {
        if (r.stubbed) return 'STUB';
        if (r.honesty.verdict === 'fail') return r.honesty.calibration === 'miscalibrated' ? 'FAIL (fit)' : 'FAIL';
        const c = r.honesty.calibration;
        const fit = r.honesty.fit ? ` (fit ${(r.honesty.fit.worst * 100).toFixed(0)}%)` : '';
        if (c === 'validated') return `cal ✓✓${fit}`;
        if (c === 'reproduces') return `cal ✓${fit}`;
        if (c === 'showcase') return 'cal ~ (showcase)';
        if (c === 'unverified') return 'cal ?';
        return '–';
    };
    for (const r of [...results].sort((a, b) => b.headline - a.headline)) {
        md.push(`| ${r.slug} | ${r.headline} | ${honCell(r)} | ${pct(r.byCat.build)} | ${pct(r.byCat.meta)} | ${pct(r.byCat.structure)} | ${pct(r.byCat.infra)} | ${pct(r.byCat.style)} | ${r.date || '?'} |`);
    }
    md.push('');

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md.join('\n'));
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify({
        generated: new Date().toISOString(), n, avg, build: build.ran, links: DO_LINKS,
        eras, models, honestyCounts, unattributed, unregistered, ghosts, stubs, results,
    }, null, 2));
}

// ---------------------------------------------------------------------------
// runs mode (--runs): score artifacts a coding agent produced from a frozen
// seed, one per piatrabench/runs/<label>/output. Reuses scorePlayground so a
// run is graded on the exact same rubric + honesty gate as the live corpus.
// See piatrabench/runs/README.md for the manual build protocol.
// ---------------------------------------------------------------------------
function findPgDir(outDir) {
    const page = walk(outDir).find((f) =>
        f.endsWith(`${path.sep}page.tsx`) && !f.includes(`${path.sep}research${path.sep}`));
    return page ? path.dirname(page) : outDir;
}

function discoverRuns() {
    let entries;
    try { entries = fs.readdirSync(RUNS_DIR, { withFileTypes: true }); } catch { return []; }
    const runs = [];
    for (const e of entries) {
        if (!e.isDirectory() || e.name.startsWith('.')) continue;
        const dir = path.join(RUNS_DIR, e.name);
        if (!exists(path.join(dir, 'output'))) continue;
        runs.push({ label: e.name, dir, outDir: path.join(dir, 'output') });
    }
    return runs.sort((a, b) => a.label.localeCompare(b.label));
}

function scoreRun(run) {
    let meta;
    try { meta = JSON.parse(read(path.join(run.dir, 'meta.json')) || '{}'); } catch { meta = {}; }
    const pgDir = findPgDir(run.outDir);
    if (!exists(path.join(pgDir, 'page.tsx'))) {
        console.error(`  ! ${run.label}: no page.tsx under output/, skipping`);
        return null;
    }
    const slug = meta.slug || path.basename(pgDir);
    const dateStr = meta.date || null;
    let year = null, month = null;
    if (dateStr) {
        const mm = dateStr.match(/(\w+)\s+(\d{4})/);
        if (mm) { const mi = MONTHS.indexOf(mm[1]); if (mi >= 0) month = mi + 1; year = +mm[2]; }
    }
    const pg = {
        slug, dir: pgDir, rel: path.relative(ROOT, pgDir),
        year, month, pathDate: dateStr, era: year ? `${year}` : 'unknown',
    };
    const reg = parseRegistryFrom(path.join(run.dir, 'data.ts'));
    const regBySlug = new Map(reg.map((x) => [(x.link || '').replace('/playgrounds/', ''), x]));

    // build & types come from the recorded worktree typecheck — tsc needs full
    // repo context that a copied output folder lacks. No build block in meta.json
    // means the build check is excluded for this run (and it won't be comparable).
    const build = { ran: false, byDir: new Map() };
    if (meta.build && meta.build.ran !== false) {
        build.ran = true;
        if (meta.build.tscClean === false) {
            build.byDir.set(pg.rel, [`recorded: ${meta.build.errors || '1'}+ tsc error(s)`]);
        }
    }

    const r = scorePlayground(pg, regBySlug, build);

    // attribution: the bundle you ran (agent + model) is authoritative here, not
    // the playground's own versions.ts self-report.
    const label = meta.model && meta.agent ? `${meta.agent} (${meta.model})`
        : (meta.model || meta.agent || r.model);
    if (label) { r.model = label; r.modelKey = label.toLowerCase(); }
    r.agent = meta.agent || null;
    r.seed = meta.seed || null;
    r.run = meta.run ?? null;
    r.label = run.label;
    r.wallClockMin = meta.wallClockMin ?? null;
    r.cost = meta.cost ?? null;
    return r;
}

function runReports(results) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const n = results.length;
    if (!n) {
        console.log('\n  No runs under piatrabench/runs/<label>/output. See piatrabench/runs/README.md.\n');
        fs.writeFileSync(path.join(OUT_DIR, 'runs-report.json'),
            JSON.stringify({ generated: new Date().toISOString(), mode: 'runs', n: 0, bundles: [], results: [] }, null, 2));
        return;
    }
    const avg = Math.round((results.reduce((a, r) => a + r.headline, 0) / n) * 10) / 10;
    const bundles = aggregateModels(results); // groups by modelKey == agent+model bundle
    const sorted = [...results].sort((a, b) => b.headline - a.headline);

    const L = [];
    L.push('');
    L.push('  PiatraBench · runs (same-seed, per agent+model bundle)');
    L.push(`  ${n} run(s) · mean ${avg}/100${DO_LINKS ? ' · links checked' : ''}`);
    L.push('');
    L.push('  bundle leaderboard               mean   n');
    for (const b of bundles) L.push(`    ${b.label.padEnd(28)} ${b.mean.toFixed(1).padStart(5)}   ${b.n}`);
    L.push('');
    L.push('  runs:');
    for (const r of sorted) {
        const tag = r.honesty.verdict === 'fail' ? ' ⚠ honesty' : '';
        const wc = r.wallClockMin != null ? ` ${r.wallClockMin}m` : '';
        L.push(`    ${String(r.headline).padStart(5)}  ${bar(r.headline)}  ${r.label}${wc}${tag}`);
    }
    L.push('');
    L.push('  full report: piatrabench/runs-report.md');
    L.push('');
    console.log(L.join('\n'));

    const cm = (v) => (v == null ? '–' : `${v}%`);
    const honCell = (r) => r.stubbed ? 'STUB'
        : r.honesty.verdict === 'fail' ? 'FAIL'
            : r.honesty.calibration === 'validated' ? 'cal ✓✓'
                : r.honesty.calibration === 'reproduces' ? 'cal ✓'
                    : r.honesty.calibration === 'showcase' ? 'cal ~'
                        : r.honesty.calibration === 'unverified' ? 'cal ?' : '–';

    const md = [];
    md.push('# PiatraBench — runs report');
    md.push('');
    md.push('Same-seed builds scored per agent+model bundle. Each entry is the deterministic Layer 0 score plus the honesty gate, run on the artifact a coding agent produced from a frozen seed. This measures the **model + its coding harness** as a bundle, not the model in isolation. Build & types are sourced from each run\'s recorded `meta.json` (tsc is run once in the build worktree, where it has full repo context); OG images are a post-build human step and are uniformly absent here, so run scores sit a couple of points below corpus scores and should be compared run-to-run.');
    md.push('');
    md.push(`- Generated: ${new Date().toISOString()}`);
    md.push(`- Runs: **${n}** · mean **${avg}/100**`);
    md.push('');
    md.push('## Bundle leaderboard');
    md.push('');
    md.push('| bundle | runs | mean | build | meta | structure | infra | style | best |');
    md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const b of bundles) {
        md.push(`| ${b.label} | ${b.n} | **${b.mean}** | ${cm(b.meanByCat.build)} | ${cm(b.meanByCat.meta)} | ${cm(b.meanByCat.structure)} | ${cm(b.meanByCat.infra)} | ${cm(b.meanByCat.style)} | ${b.best.slug} (${b.best.score}) |`);
    }
    md.push('');
    md.push('## Runs');
    md.push('');
    md.push('| run | seed | bundle | score | honesty | wall-clock | cost |');
    md.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const r of sorted) {
        md.push(`| ${r.label} | ${r.seed || '?'} | ${r.model || '?'} | ${r.headline} | ${honCell(r)} | ${r.wallClockMin != null ? r.wallClockMin + 'm' : '–'} | ${r.cost != null ? r.cost : '–'} |`);
    }
    md.push('');
    fs.writeFileSync(path.join(OUT_DIR, 'runs-report.md'), md.join('\n'));
    fs.writeFileSync(path.join(OUT_DIR, 'runs-report.json'), JSON.stringify({
        generated: new Date().toISOString(), mode: 'runs', n, avg, links: DO_LINKS, bundles, results,
    }, null, 2));
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
if (DO_RUNS) {
    const runs = discoverRuns();
    console.log(`Discovered ${runs.length} run(s) under piatrabench/runs.`);
    const runResults = runs.map(scoreRun).filter(Boolean);
    if (DO_LINKS) { console.log('Resolving citations…'); await checkLinks(runResults); }
    runResults.forEach(finalize);
    runReports(runResults);
    process.exit(0);
}

const registry = parseRegistry();
const registryBySlug = new Map(registry.map((e) => [(e.link || '').replace('/playgrounds/', ''), e]));
const pgs = discover();
console.log(`Discovered ${pgs.length} playgrounds. ${DO_BUILD ? 'Running tsc (one pass)…' : 'Skipping build.'}`);
const build = runBuild(pgs);
console.log(DO_CALIBRATION ? 'Scoring + executing calibrations…' : 'Scoring…');
const results = pgs.map((pg) => scorePlayground(pg, registryBySlug, build));
if (DO_LINKS) { console.log('Resolving citations…'); await checkLinks(results); }
results.forEach(finalize);
buildReports(results, registry, pgs, build);
