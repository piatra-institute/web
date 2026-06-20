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

// honesty: execute calibration.ts headlessly (child process) and decide whether
// its predicted values are genuinely computed (reproduced) vs hardcoded.
function runCalibration(dir) {
    const file = path.join(dir, 'calibration.ts');
    if (!exists(file)) return { status: 'na', fit: null };
    if (!DO_CALIBRATION) return { status: 'skipped', fit: null };
    const res = spawnSync('node', [path.join(OUT_DIR, 'run-calibration.cjs'), file], {
        cwd: ROOT, encoding: 'utf8', timeout: 30000, maxBuffer: 8 * 1024 * 1024,
    });
    let parsed;
    try { parsed = JSON.parse((res.stdout || '').trim()); } catch { parsed = { status: 'error', message: 'unparseable output' }; }

    // a fabricated calibration hardcodes predicted to match expected; a genuine
    // one computes it. detect literals in source.
    const src = read(file);
    const totalPred = (src.match(/predicted:/g) || []).length;
    const litPred = (src.match(/predicted:\s*-?[0-9]/g) || []).length;
    const hardcoded = totalPred > 0 && litPred === totalPred;

    let status;
    if (parsed.status === 'na') status = 'na';
    else if (parsed.status === 'error') status = 'unverified';
    else status = hardcoded ? 'hardcoded' : 'verified';

    return {
        status,
        n: parsed.n || 0,
        fit: parsed.status === 'ok' ? { mean: parsed.mean, worst: parsed.worst } : null,
        message: parsed.message || null,
    };
}

// heuristic flags for cosmetic dishonesty (not gating; surfaced for review).
function honestyFlags(source) {
    const flags = [];
    if (/function\s+amplify\b|\bamplify\s*\(/.test(source)) flags.push('metric amplification (amplify())');
    return flags;
}

// honesty is a GATE, not a deduction: a failed check caps the headline score so
// polish can never buy back fabrication. A dead citation or a hardcoded
// calibration fails; not-auto-verifiable (na) and a deliberately poor fit do not.
function finalize(r) {
    let citations = 'unchecked';
    if (DO_LINKS) {
        const hasCite = r.citations.length > 0;
        // only a true 404/410 counts as dead; publisher 403s and transient errors do not gate.
        const dead = (r.brokenCitations || []).filter((b) => b.status === 404 || b.status === 410);
        citations = dead.length ? 'fail' : (hasCite ? 'pass' : 'na');
    }
    const calStatus = r.calibration ? r.calibration.status : 'na';
    const fail = citations === 'fail' || calStatus === 'hardcoded';
    r.honesty = {
        calibration: calStatus,
        fit: r.calibration?.fit || null,
        citations,
        flags: r.honestyWarnings || [],
        verdict: fail ? 'fail' : 'ok',
    };
    r.headline = fail ? Math.min(r.score, 40) : r.score;
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
    const raw = read(path.join(PG_ROOT, 'data.ts'));
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
    add('viewer', 'PlaygroundViewer', 'structure', 4, playgroundTsx.includes('PlaygroundViewer'));
    add('playground-file', 'playground.tsx', 'structure', 3, !!playgroundTsx);
    const settings = has('components/Settings/index.tsx');
    const viewer = has('components/Viewer/index.tsx');
    add('settings-viewer', 'Settings + Viewer split', 'structure', 4, (settings ? 0.5 : 0) + (viewer ? 0.5 : 0),
        [settings ? '' : 'no Settings', viewer ? '' : 'no Viewer'].filter(Boolean).join(', '));
    const hasLogic = has('logic') || has('logic.ts') || has('logic/index.ts');
    add('logic', 'logic/ module', 'structure', 3, hasLogic);

    // --- Scientific infrastructure (25) — template maturity ---
    add('assumptions', 'assumptions.ts', 'infra', 7, has('assumptions.ts'));
    add('calibration', 'calibration.ts', 'infra', 7, has('calibration.ts'));
    add('versions', 'versions.ts', 'infra', 4, has('versions.ts'));
    add('research', 'research companion', 'infra', 7, has('research/content.md'));

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
        calibration, honestyWarnings,
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
        verified: results.filter((r) => r.honesty.calibration === 'verified').length,
        notAutoVerifiable: results.filter((r) => ['na', 'skipped'].includes(r.honesty.calibration)).length,
        failed: results.filter((r) => r.honesty.verdict === 'fail').length,
        flagged: results.filter((r) => r.honesty.flags.length > 0).length,
    };
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
    L.push(`  honesty: ${honestyCounts.verified} calibration verified · ${honestyCounts.notAutoVerifiable} not auto-verifiable · ${honestyCounts.failed} failed${DO_LINKS ? '' : ' · (citations unchecked, run --links)'}`);
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
    md.push('Honesty is a gate, not a deduction: a failed check caps the headline score so polish cannot buy back fabrication. Calibration is executed headlessly; **verified** means the displayed `predicted` values are genuinely computed by the engine, not hardcoded to match `expected`. Fit (predicted vs expected error) is reported but never gates, because an honest playground may deliberately show a poorly-fitting model (e.g. lexical-liar).');
    md.push('');
    md.push(`- calibration verified (reproduces): **${honestyCounts.verified}**`);
    md.push(`- not auto-verifiable (no calibration, or prediction computed in-component): ${honestyCounts.notAutoVerifiable}`);
    md.push(`- failed (dead citation or hardcoded calibration): ${honestyCounts.failed}`);
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

    if (unregistered.length || ghosts.length) {
        md.push('## Data integrity');
        md.push('');
        if (unregistered.length) md.push(`- **Unregistered** (folder exists, not in data.ts): ${unregistered.map((s) => `\`${s}\``).join(', ')}`);
        if (ghosts.length) md.push(`- **Ghost entries** (in data.ts, no folder): ${ghosts.map((s) => `\`${s}\``).join(', ')}`);
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
        if (r.honesty.verdict === 'fail') return 'FAIL';
        const c = r.honesty.calibration;
        if (c === 'verified') return r.honesty.fit ? `cal ✓ (fit ${(r.honesty.fit.worst * 100).toFixed(0)}%)` : 'cal ✓';
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
        eras, models, honestyCounts, unattributed, unregistered, ghosts, results,
    }, null, 2));
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
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
