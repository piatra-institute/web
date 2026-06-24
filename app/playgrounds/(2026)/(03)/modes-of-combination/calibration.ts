import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    type Field,
    products,
    modes,
    FIELDS,
    computeMatrix,
    modeCount,
    filterProducts,
    nearbyConstructions,
} from './logic';


/**
 * This playground is a deterministic atlas, not a stochastic simulation, so its
 * calibration checks structural counting invariants rather than empirical fits.
 *
 * Every `predicted` value is produced by an actual logic function (modeCount,
 * filterProducts, computeMatrix, nearbyConstructions). Every `expected` value is
 * derived independently from the raw `products` array, so a match confirms two
 * separate code paths agree on the same combinatorial fact. These are exact
 * integers with no tolerance band: an honest counting atlas should reproduce
 * them with zero error.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. modeCount and filterProducts are two independent traversals of the same
    //    data; for any mode they must agree. We check the largest mode, gluing.
    const gluingFiltered = filterProducts({
        search: '',
        selectedField: 'All',
        selectedMode: 'gluing',
        sortBy: 'name',
        preset: 'overview',
    }).length;
    const gluingDirect = modeCount('gluing');
    results.push({
        name: 'gluing count (filter vs modeCount)',
        description: 'filterProducts and modeCount independently agree on the size of the gluing mode.',
        predicted: gluingFiltered,
        expected: gluingDirect,
        source: 'internal consistency of two independent counting paths over the same atlas',
    });

    // 2. Mode-tag conservation: summing modeCount over every mode must equal the
    //    total number of mode tags written across all products (each product
    //    contributes one tag per listed mode, regardless of how many fields it
    //    spans).
    const sumModeCounts = modes.reduce((acc, m) => acc + modeCount(m.key), 0);
    const totalModeTags = products.reduce((acc, p) => acc + p.mode.length, 0);
    results.push({
        name: 'mode-tag conservation',
        description: 'Sum of modeCount over all modes equals the total mode tags listed across constructions.',
        predicted: sumModeCounts,
        expected: totalModeTags,
        source: 'combinatorial identity: counting tags by mode equals counting tags by construction',
    });

    // 3. Field x mode matrix conservation: every nonempty (field, mode) cell
    //    counts a product once per field it belongs to, so the grand total of
    //    cells equals the sum over products of mode.length * field.length.
    const sumCells = computeMatrix().reduce(
        (acc, row) => acc + row.cells.reduce((x, c) => x + c.count, 0),
        0,
    );
    const fieldModeIncidences = products.reduce(
        (acc, p) => acc + p.mode.length * p.field.length,
        0,
    );
    results.push({
        name: 'matrix incidence conservation',
        description: 'Grand total of the field x mode matrix equals the sum of mode.length times field.length.',
        predicted: sumCells,
        expected: fieldModeIncidences,
        source: 'double-counting identity for the field x mode incidence matrix',
    });

    // 4. Field filter completeness: filtering by a single field returns exactly
    //    the constructions that list that field, for group theory the broadest.
    const groupFiltered = filterProducts({
        search: '',
        selectedField: 'Group theory',
        selectedMode: 'all',
        sortBy: 'name',
        preset: 'overview',
    }).length;
    const groupMembers = products.filter((p) => p.field.includes('Group theory' as Field)).length;
    results.push({
        name: 'group theory field filter',
        description: 'The group theory field filter returns every construction that lists group theory.',
        predicted: groupFiltered,
        expected: groupMembers,
        source: 'set membership: filter output equals direct field-membership count',
    });

    // 5. Nearby cap: nearbyConstructions slices to at most 8 neighbours. The
    //    wreath product shares modes or fields with far more than 8 others, so
    //    the cap binds and the result is exactly 8.
    const wreath = products.find((p) => p.id === 'wreath-product');
    const wreathNeighbours = wreath ? nearbyConstructions(wreath).length : 0;
    const eligible = wreath
        ? products.filter(
              (p) =>
                  p.id !== wreath.id &&
                  (p.mode.some((m) => wreath.mode.includes(m)) ||
                      p.field.some((f) => wreath.field.includes(f))),
          ).length
        : 0;
    results.push({
        name: 'nearby cap (wreath product)',
        description: 'nearbyConstructions caps neighbours at 8 when the eligible pool exceeds the cap.',
        predicted: wreathNeighbours,
        expected: Math.min(8, eligible),
        source: 'cap invariant: min(8, eligible-neighbour pool size)',
    });

    return results;
}
