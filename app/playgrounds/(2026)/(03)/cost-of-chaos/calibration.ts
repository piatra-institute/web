import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    makeEdges,
    computeChaosStats,
    getRamseyNumber,
} from './logic';


/**
 * Calibration for the Ramsey / cost-of-chaos model.
 *
 * Every `predicted` value is computed by the playground's own logic functions
 * (getRamseyNumber, makeEdges, computeChaosStats). The `expected` values are
 * exact combinatorial or graph-theoretic facts that do not depend on this code:
 * known small Ramsey numbers, the edge count of a complete graph K_n, and the
 * number of triangles C(n,3) when only one color is available.
 *
 * The adversarial coloring is a deterministic function of its seed, so the cases
 * that use it pin a fixed seed. Note the deliberately honest case below: the
 * greedy adversarial heuristic is NOT optimal, so at n = 5 (which is below the
 * Ramsey threshold R(3,3) = 6, where a zero-clique 2-coloring provably exists)
 * the heuristic still leaves one monochromatic triangle. We calibrate against
 * what the heuristic actually does, not against the unattained optimum.
 */

const SEED = 7;

function choose(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
    return Math.round(r);
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Known Ramsey number R(3,3) = 6, read from the model's registry.
    {
        const r = getRamseyNumber(3, 3);
        results.push({
            name: 'R(3,3) registry lookup',
            description:
                'the smallest n such that every 2-coloring of K_n forces a monochromatic triangle.',
            predicted: r ?? 0,
            expected: 6,
            source: 'Greenwood and Gleason 1955; the party problem, R(3,3) = 6.',
        });
    }

    // 2. Known Ramsey number R(4,4) = 18.
    {
        const r = getRamseyNumber(4, 4);
        results.push({
            name: 'R(4,4) registry lookup',
            description:
                'every 2-coloring of K_18 forces a monochromatic K_4; K_17 admits a coloring that avoids one.',
            predicted: r ?? 0,
            expected: 18,
            source: 'Greenwood and Gleason 1955, R(4,4) = 18.',
        });
    }

    // 3. Edge count of the complete graph K_6 = C(6,2) = 15.
    {
        const edges = makeEdges(6, 2, 'distance', SEED);
        const stats = computeChaosStats(6, edges, 2, 3);
        results.push({
            name: 'complete graph K_6 edge count',
            description:
                'the total number of pairwise relations in a 6-vertex system is C(6,2).',
            predicted: stats.totalEdges,
            expected: choose(6, 2),
            source: 'combinatorial identity |E(K_n)| = n(n-1)/2.',
        });
    }

    // 4. With a single color every triangle is monochromatic: C(6,3) = 20.
    {
        const edges = makeEdges(6, 1, 'distance', SEED);
        const stats = computeChaosStats(6, edges, 1, 3);
        results.push({
            name: 'mono triangles with one color (n=6)',
            description:
                'when only one color exists, every 3-subset is a monochromatic clique, so the count equals C(6,3).',
            predicted: stats.cliquesFound,
            expected: choose(6, 3),
            source: 'pigeonhole limit: a 1-coloring of K_n yields C(n,3) monochromatic triangles.',
        });
    }

    // 5. Structure is forced at the Ramsey threshold. At n = 6 = R(3,3) the
    //    adversarial heuristic cannot avoid a monochromatic triangle, so the
    //    forced flag is true (encoded as 1). This is a hard theorem, not a
    //    property of the heuristic: no 2-coloring of K_6 avoids a mono triangle.
    {
        const edges = makeEdges(6, 2, 'adversarial', SEED);
        const stats = computeChaosStats(6, edges, 2, 3);
        results.push({
            name: 'structure forced at threshold (n=6)',
            description:
                'at n = R(3,3) = 6 even the adversarial coloring fails: at least one monochromatic triangle is unavoidable.',
            predicted: stats.structureForced && stats.cliquesFound >= 1 ? 1 : 0,
            expected: 1,
            source: 'Ramsey 1930 / Greenwood-Gleason: every 2-coloring of K_6 contains a mono triangle.',
        });
    }

    // 6. HONEST CASE: the greedy adversarial heuristic is suboptimal. At n = 5,
    //    below the threshold, an optimal coloring with ZERO monochromatic
    //    triangles exists, but the greedy heuristic at the default seed still
    //    leaves exactly one. We calibrate against the heuristic's true output
    //    (1), not the unreachable optimum (0). This documents that the model
    //    measures heuristic resistance, not the combinatorial optimum.
    {
        const edges = makeEdges(5, 2, 'adversarial', SEED);
        const stats = computeChaosStats(5, edges, 2, 3);
        results.push({
            name: 'greedy is suboptimal below threshold (n=5)',
            description:
                'n = 5 < R(3,3) so a zero-clique 2-coloring exists, yet the greedy adversarial heuristic at the default seed leaves one monochromatic triangle.',
            predicted: stats.cliquesFound,
            expected: 1,
            source: 'measured heuristic output; greedy clique-avoidance is not guaranteed optimal.',
        });
    }

    return results;
}
