import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    generateRandomSplits,
    generateVoronoi,
    computeStats,
    polygonArea,
    type Polygon,
} from './logic';


const UNIT_SQUARE: Polygon = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
];

function totalArea(polys: Polygon[]): number {
    return polys.reduce((acc, p) => acc + Math.abs(polygonArea(p)), 0);
}


/**
 * These cases verify the deterministic, closed-form skeleton of the mosaic
 * generators. The full playground is stochastic (a seeded PRNG drives where each
 * cut lands), so we do not calibrate fuzzy ensemble averages. Instead each case
 * targets a property that geometry guarantees exactly, independent of the random
 * draw:
 *
 *   - the unit square has area 1 (shoelace baseline);
 *   - splitting a convex cell never creates or destroys area, so a fragmented
 *     unit square still has total area 1 (mass conservation);
 *   - each binary split turns one cell into two, so S splits yield S+1 cells
 *     (cell-count bookkeeping);
 *   - a Voronoi diagram of N sites clipped to the unit square tiles it: N cells,
 *     total area 1;
 *   - iterated convex bisection drives the mean side count to exactly 4 in this
 *     implementation, the 2D "Platonic quadrangle" attractor of the source paper.
 *
 * predicted values are COMPUTED by running the same logic functions the live
 * playground uses; expected values are the geometric ground truth. The avg-sides
 * attractor (4) is reported as an empirical limit, not a hand-set constant: it is
 * read off computeStats after 400 real splits.
 */
export function buildCalibration(): CalibrationResult[] {
    // 1. Shoelace area of the unit square.
    const squareArea = polygonArea(UNIT_SQUARE);

    // 2. Area conservation: fragment the square with 200 random splits, sum areas.
    const split200 = generateRandomSplits({
        splits: 200,
        seed: 1337,
        angleBias: 0.15,
        minArea: 0.0001,
        storeEvery: 0,
    });
    const conservedArea = totalArea(split200.polys);

    // 3. Cell-count bookkeeping: S binary splits give S + 1 cells (min area large
    //    enough that no candidate split is rejected, so the count is exact).
    const split150 = generateRandomSplits({
        splits: 150,
        seed: 7,
        angleBias: 0,
        minArea: 1e-6,
        storeEvery: 0,
    });
    const cellCount = split150.polys.length;

    // 4. Voronoi tiling: N sites clipped to the unit square give N cells that
    //    partition it, so total area is 1.
    const vor = generateVoronoi({ sites: 80, seed: 1337 });
    const voronoiCells = vor.polys.length;
    const voronoiArea = totalArea(vor.polys);

    // 5. Quadrangle attractor: iterated convex bisection drives mean sides to 4.
    const split400 = generateRandomSplits({
        splits: 400,
        seed: 42,
        angleBias: 0,
        minArea: 1e-6,
        storeEvery: 0,
    });
    const meanSides = computeStats(split400.polys).avgSides;

    return [
        {
            name: 'unit square · shoelace area',
            description:
                'the seed region is the unit square; the shoelace formula returns its area. baseline for every conservation check below.',
            predicted: Number(squareArea.toFixed(4)),
            expected: 1,
            source: 'elementary planar geometry (Gauss shoelace formula)',
        },
        {
            name: 'mass conservation · 200 splits',
            description:
                'a convex bisection partitions a cell into two pieces whose areas sum to the parent, so a fragmented unit square still covers area 1.',
            predicted: Number(conservedArea.toFixed(4)),
            expected: 1,
            source: 'additivity of area under partition (Domokos et al. 2020, mosaic assumption: no gaps or overlaps)',
        },
        {
            name: 'cell count · 150 splits → 151',
            description:
                'each accepted split replaces one cell with two, incrementing the count by exactly one; with no rejected splits, S steps yield S+1 cells.',
            predicted: cellCount,
            expected: 151,
            source: 'binary-tree leaf count for a sequence of bisections',
        },
        {
            name: 'voronoi tiling · 80 sites',
            description:
                'a Voronoi diagram of 80 seed points clipped to the unit square produces 80 cells that tile it; total area equals 1 (reported here as the cell count).',
            predicted: voronoiCells,
            expected: 80,
            source: 'Voronoi partition of a bounded convex domain (one cell per site)',
        },
        {
            name: 'voronoi area · 80 sites',
            description:
                'the same 80-cell Voronoi mosaic conserves area: summing the clipped cell areas returns the area of the unit square.',
            predicted: Number(voronoiArea.toFixed(4)),
            expected: 1,
            source: 'Voronoi cells partition the domain without gaps or overlaps',
        },
        {
            name: 'quadrangle attractor · ⟨n⟩ → 4',
            description:
                'iterated random convex bisection drives the mean side count to 4: every cut adds one edge to each of two children, and the population mean converges to the 2D "Platonic quadrangle".',
            predicted: Number(meanSides.toFixed(2)),
            expected: 4,
            source: 'Domokos, Jerolmack, Kun, Török 2020, PNAS: 2D fracture mosaics average four sides',
        },
    ];
}
