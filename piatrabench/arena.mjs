#!/usr/bin/env node
/**
 * PiatraBench arena (Layer 2/3): the quality layer.
 *
 * Reads manual pairwise verdicts from piatrabench/runs/verdicts.jsonl (recorded
 * by judging two same-seed playgrounds blind, per piatrabench/runs/JUDGE.md) and
 * turns them into a per-axis rating per agent+model bundle via Bradley-Terry.
 *
 * Conformance (scorer.mjs) only gates eligibility; this is what ranks models on
 * intelligence, quality, prompt-following, and creativity.
 *
 *   node piatrabench/arena.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'piatrabench');
const RUNS = path.join(OUT, 'runs');
const AXES = ['fidelity', 'depth', 'design', 'creativity', 'instruction'];

const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };

// map each run folder -> its agent+model bundle label (from meta.json)
function runBundles() {
    const map = {};
    let entries;
    try { entries = fs.readdirSync(RUNS, { withFileTypes: true }); } catch { return map; }
    for (const e of entries) {
        if (!e.isDirectory() || e.name.startsWith('.')) continue;
        let meta = {};
        try { meta = JSON.parse(read(path.join(RUNS, e.name, 'meta.json')) || '{}'); } catch { /* ignore */ }
        map[e.name] = meta.model && meta.agent ? `${meta.agent} (${meta.model})`
            : (meta.model || meta.agent || e.name);
    }
    return map;
}

function loadVerdicts() {
    const raw = read(path.join(RUNS, 'verdicts.jsonl'));
    const out = [];
    for (const line of raw.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('//')) continue;
        try { out.push(JSON.parse(t)); } catch { console.error('  ! skipping unparseable verdict line:', t.slice(0, 70)); }
    }
    return out;
}

const norm = (v) => {
    const s = String(v).toLowerCase();
    if (s === 'a') return 'a';
    if (s === 'b') return 'b';
    return 'tie';
};

// Bradley-Terry strengths from a list of games [{a,b,result:'a'|'b'|'tie'}].
// Ties count as half a win to each side. Geometric mean of positive strengths
// is normalised to 1, so a strength of 1 is an "average" competitor.
function bradleyTerry(games) {
    const ids = [...new Set(games.flatMap((g) => [g.a, g.b]))];
    if (!ids.length) return {};
    const W = Object.fromEntries(ids.map((i) => [i, 0]));
    const N = Object.fromEntries(ids.map((i) => [i, Object.fromEntries(ids.map((j) => [j, 0]))]));
    for (const g of games) {
        N[g.a][g.b]++; N[g.b][g.a]++;
        if (g.result === 'a') W[g.a] += 1;
        else if (g.result === 'b') W[g.b] += 1;
        else { W[g.a] += 0.5; W[g.b] += 0.5; }
    }
    let p = Object.fromEntries(ids.map((i) => [i, 1]));
    for (let it = 0; it < 200; it++) {
        const np = {};
        for (const i of ids) {
            let denom = 0;
            for (const j of ids) {
                if (j === i) continue;
                const nij = N[i][j];
                if (nij) denom += nij / (p[i] + p[j]);
            }
            np[i] = denom > 0 ? W[i] / denom : 0;
        }
        const pos = ids.map((i) => np[i]).filter((x) => x > 0);
        const gm = pos.length ? Math.exp(pos.reduce((s, x) => s + Math.log(x), 0) / pos.length) : 1;
        for (const i of ids) p[i] = gm > 0 ? np[i] / gm : np[i];
    }
    return p;
}

// strength -> 0..100 index: expected score against an average (strength 1)
// opponent. 50 is average, >50 beats the field, <50 loses to it.
const ratingOf = (p) => (p == null ? null : Math.round((100 * p) / (p + 1)));

function tally(games, bundle) {
    let w = 0, t = 0, l = 0;
    for (const g of games) {
        if (g.a === bundle) { if (g.result === 'a') w++; else if (g.result === 'b') l++; else t++; }
        else if (g.b === bundle) { if (g.result === 'b') w++; else if (g.result === 'a') l++; else t++; }
    }
    return { w, t, l };
}

// ---------------------------------------------------------------------------
const labelOf = runBundles();
const verdicts = loadVerdicts();
const resolve = (x) => labelOf[x] || x; // accept run folder or a bare bundle label

// per-axis games + a pooled "overall" set (all axes together)
const axisGames = Object.fromEntries(AXES.map((ax) => [ax, []]));
const overall = [];
for (const v of verdicts) {
    const a = resolve(v.a);
    const b = resolve(v.b);
    if (!a || !b || a === b) continue;
    const ax = v.axes || {};
    for (const k of AXES) {
        if (ax[k] == null) continue;
        const game = { a, b, result: norm(ax[k]) };
        axisGames[k].push(game);
        overall.push({ a, b, result: game.result });
    }
}

const bundles = [...new Set(overall.flatMap((g) => [g.a, g.b]))];

if (!verdicts.length || !bundles.length) {
    console.log('\n  No verdicts yet. Judge some pairs per piatrabench/runs/JUDGE.md,');
    console.log('  record them in piatrabench/runs/verdicts.jsonl, then rerun.\n');
    fs.writeFileSync(path.join(OUT, 'arena-report.json'),
        JSON.stringify({ generated: new Date().toISOString(), n: verdicts.length, bundles: [] }, null, 2));
    process.exit(0);
}

const axisStrength = Object.fromEntries(AXES.map((ax) => [ax, bradleyTerry(axisGames[ax])]));
const overallStrength = bradleyTerry(overall);

const rows = bundles.map((b) => {
    const rec = tally(overall, b);
    return {
        bundle: b,
        overall: ratingOf(overallStrength[b]),
        axes: Object.fromEntries(AXES.map((ax) => [ax, ratingOf(axisStrength[ax][b])])),
        comparisons: rec.w + rec.t + rec.l,
        record: rec,
    };
}).sort((x, y) => (y.overall ?? -1) - (x.overall ?? -1));

const totalPairs = verdicts.length;

// ---- console ----
const cell = (v) => (v == null ? '  -' : String(v).padStart(3));
const L = [];
L.push('');
L.push('  PiatraBench · arena (pairwise quality, Bradley-Terry rating; 50 = average)');
L.push(`  ${totalPairs} verdict(s) over ${bundles.length} bundle(s)`);
L.push('');
L.push(`  ${'bundle'.padEnd(28)} over  fid  dep  des  cre  ins   n`);
for (const r of rows) {
    L.push(`  ${r.bundle.padEnd(28)} ${cell(r.overall)}  ${cell(r.axes.fidelity)}  ${cell(r.axes.depth)}  ${cell(r.axes.design)}  ${cell(r.axes.creativity)}  ${cell(r.axes.instruction)}  ${String(r.comparisons).padStart(2)}`);
}
L.push('');
L.push('  full report: piatrabench/arena-report.md');
L.push('');
console.log(L.join('\n'));

// ---- markdown ----
const md = [];
md.push('# PiatraBench — arena report');
md.push('');
md.push('Pairwise quality ratings from blind, same-seed judging (see `piatrabench/runs/JUDGE.md`). Each axis is a Bradley-Terry rating on a 0 to 100 scale where **50 is an average competitor**, above 50 beats the field, below 50 loses to it. This is the subjective quality layer; conformance (the scorer) only decides who is eligible to enter.');
md.push('');
md.push(`- Generated: ${new Date().toISOString()}`);
md.push(`- Verdicts: **${totalPairs}** · bundles: **${bundles.length}**`);
md.push('');
md.push('| bundle | overall | fidelity | depth | design | creativity | instruction | comparisons | W-T-L |');
md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const m = (v) => (v == null ? '–' : v);
for (const r of rows) {
    md.push(`| ${r.bundle} | **${m(r.overall)}** | ${m(r.axes.fidelity)} | ${m(r.axes.depth)} | ${m(r.axes.design)} | ${m(r.axes.creativity)} | ${m(r.axes.instruction)} | ${r.comparisons} | ${r.record.w}-${r.record.t}-${r.record.l} |`);
}
md.push('');
md.push('Ratings from few verdicts are provisional: a handful of comparisons is noisy, and an LLM judge measures perceived quality along these axes, not a ground truth. Add more verdicts (more judges, pairs, and seeds) to stabilise it, and spot-check the judge against your own read on a few pairs.');
md.push('');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'arena-report.md'), md.join('\n'));
fs.writeFileSync(path.join(OUT, 'arena-report.json'), JSON.stringify({
    generated: new Date().toISOString(), n: totalPairs, axes: AXES, bundles: rows,
}, null, 2));
