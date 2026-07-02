/**
 * Headless calibration runner (CJS). Spawned once per playground by the scorer:
 *
 *   node piatrabench/run-calibration.cjs <abs-path-to-calibration.ts>
 *
 * Sets up an on-the-fly TypeScript require hook (via the already-present
 * `typescript` package) plus the `@/` path alias, requires the calibration
 * module, and introspects its exports for numeric predicted/expected pairs.
 * Prints a single JSON line. Runs in a child process so a throw or hang in one
 * playground's logic cannot take down the whole scorer.
 *
 * It only VERIFIES what is genuinely verifiable: calibrations that expose
 * computed `predicted` against a `expected` target. Calibrations that store
 * params + an expected band (prediction computed elsewhere) yield no pairs and
 * are reported status "na" — not auto-verifiable, never a false accusation.
 */

const Module = require('module');
const path = require('path');
const fs = require('fs');

const ROOT = process.cwd();
const TOLERANCE = 0.35; // matches CalibrationPanel's own "bad" threshold (>35% error)

let ts;
try {
    ts = require('typescript');
} catch {
    process.stdout.write(JSON.stringify({ status: 'error', message: 'typescript not available' }));
    process.exit(0);
}

// resolve `@/x` -> <root>/x before normal resolution
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
    let req = request;
    if (req === '@') req = ROOT;
    else if (req.startsWith('@/')) req = path.join(ROOT, req.slice(2));
    return origResolve.call(this, req, parent, isMain, options);
};

// transpile .ts/.tsx per file to CommonJS (types erased, no type-check)
function compileTs(module, filename) {
    const src = fs.readFileSync(filename, 'utf8');
    const out = ts.transpileModule(src, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
            jsx: ts.JsxEmit.ReactJSX,
            isolatedModules: true,
        },
        fileName: filename,
    });
    module._compile(out.outputText, filename);
}
Module._extensions['.ts'] = compileTs;
Module._extensions['.tsx'] = compileTs;

const target = process.argv[2];
if (!target) {
    process.stdout.write(JSON.stringify({ status: 'error', message: 'no target' }));
    process.exit(0);
}

function collect(arr, into) {
    if (!Array.isArray(arr)) return;
    for (const it of arr) {
        if (it && typeof it === 'object'
            && typeof it.predicted === 'number' && Number.isFinite(it.predicted)
            && typeof it.expected === 'number' && Number.isFinite(it.expected)) {
            into.push({
                name: String(it.name ?? ''),
                predicted: it.predicted,
                expected: it.expected,
                tolerance: (typeof it.tolerance === 'number' && Number.isFinite(it.tolerance)) ? it.tolerance : null,
                showcase: it.showcase === true,
            });
        }
    }
}

try {
    const mod = require(target);

    // optional file-level declaration of what the calibration is (see CLAUDE.md):
    //   reproduction (default) — expected are derived identities / independent recomputations
    //   validation            — expected come from external empirical/literature targets
    //   showcase              — the model is deliberately poor; fit is not a pass/fail
    const KINDS = ['reproduction', 'validation', 'showcase'];
    const rawKind = mod.calibrationMeta && mod.calibrationMeta.kind;
    const kind = KINDS.includes(rawKind) ? rawKind : null;
    const fileShowcase = kind === 'showcase';

    const pairs = [];
    for (const [key, val] of Object.entries(mod)) {
        if (Array.isArray(val)) collect(val, pairs);
        else if (typeof val === 'function' && val.length === 0 && /calibrat|build/i.test(key)) {
            try { collect(val(), pairs); } catch { /* ignore one bad builder */ }
        }
    }

    // de-duplicate identical (name, predicted, expected) tuples
    const seen = new Set();
    const unique = pairs.filter((p) => {
        const k = `${p.name}|${p.predicted}|${p.expected}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });

    const results = unique.map((p) => {
        const absExp = Math.abs(p.expected);
        const error = absExp < 1e-9 ? Math.abs(p.predicted) : Math.abs(p.predicted - p.expected) / absExp;
        const tol = p.tolerance != null ? p.tolerance : TOLERANCE;
        const showcase = fileShowcase || p.showcase;
        return { name: p.name, predicted: p.predicted, expected: p.expected, error, withinTol: error <= tol, showcase };
    });

    // `status` is about EXECUTION/reproduction only: did the code run and yield
    // computed predicted/expected pairs? Overall fit is still reported, but the
    // gate now judges `worstGating` — the worst error over cases NOT flagged as an
    // intentional showcase — so a deliberately poor model (lexical-liar) is exempt
    // while an undeclared blowup is not. null worstGating = every case is a showcase.
    const status = results.length === 0 ? 'na' : 'ok';
    const worst = results.reduce((m, r) => Math.max(m, r.error), 0);
    const mean = results.length ? results.reduce((s, r) => s + r.error, 0) / results.length : 0;
    const gating = results.filter((r) => !r.showcase);
    const worstGating = gating.length ? gating.reduce((m, r) => Math.max(m, r.error), 0) : null;
    const nShowcase = results.filter((r) => r.showcase).length;
    process.stdout.write(JSON.stringify({ status, n: results.length, mean, worst, worstGating, kind, nShowcase, results }));
} catch (err) {
    process.stdout.write(JSON.stringify({ status: 'error', message: String(err && err.message || err).slice(0, 200) }));
}
process.exit(0);
