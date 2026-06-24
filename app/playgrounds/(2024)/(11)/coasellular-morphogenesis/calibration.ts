import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    type DeterministicTransaction,
    neighbourPairCount,
    totalPointValue,
    applyTransactions,
    cumulativeTransactionEnergy,
    energyPerTransaction,
} from './logic';


/**
 * Calibration for the coasellular morphogenesis model.
 *
 * The live grid is stochastic (random starting energies, random adjustment
 * signs), so it cannot be calibrated point for point. Instead we verify the
 * model's deterministic structural claims, the parts that hold for every random
 * draw. Each `predicted` is COMPUTED from the logic module; nothing is
 * hardcoded. The targets are the values these invariants must take if the model
 * really implements Coasean bargaining over conserved endowments.
 */


// A small deterministic transaction sequence over a 9-point endowment. The signs
// alternate so the redistribution is non-trivial; conservation must still hold.
const ENDOWMENT = [4, 1, 7, 2, 5, 3, 6, 0, 8];
const TRANSACTIONS: DeterministicTransaction[] = [
    { give: 0, take: 1, sign: 1 },
    { give: 2, take: 3, sign: -1 },
    { give: 4, take: 5, sign: 1 },
    { give: 6, take: 7, sign: 1 },
    { give: 8, take: 0, sign: -1 },
];


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Value conservation: bargaining redistributes but never destroys value.
    {
        const before = totalPointValue(ENDOWMENT);
        const after = totalPointValue(applyTransactions(ENDOWMENT, TRANSACTIONS));
        results.push({
            name: 'value conservation under bargaining',
            description:
                'total point value across the grid after a sequence of transactions, each moving one unit from one paired cell to the other.',
            predicted: after,
            expected: before,
            source: 'Coase 1960: with bargaining, endowments are reallocated without net loss; sum_i value_i is invariant by the transaction rule.',
        });
    }

    // 2. Neighbour pair count for a 3x3 grid: deterministic from the geometry.
    {
        const rows = 3;
        const cols = 3;
        // interior vertical edges: rows*(cols-1)=6; interior horizontal edges: (rows-1)*cols=6
        const predicted = neighbourPairCount(rows, cols);
        results.push({
            name: 'transacting pairs · 3x3 grid',
            description:
                'number of adjacent cell pairs that can transact across shared boundaries in a 3-by-3 tissue.',
            predicted,
            expected: 12,
            source: 'grid adjacency: rows*(cols-1) horizontal pairs + (rows-1)*cols vertical pairs = 6 + 6.',
        });
    }

    // 3. Neighbour pair count for a 2x2 grid (the playground default).
    {
        const predicted = neighbourPairCount(2, 2);
        results.push({
            name: 'transacting pairs · 2x2 grid',
            description:
                'adjacent transacting pairs in the default 2-by-2 tissue: two horizontal, two vertical.',
            predicted,
            expected: 4,
            source: 'grid adjacency: 2*(2-1) + (2-1)*2 = 2 + 2.',
        });
    }

    // 4. Energy injected per transaction at unit cost. Both circles of a pair
    //    move their energy by cost*sign with the SAME sign, so a transaction
    //    spends 2*cost, not zero: bargaining is not free.
    {
        const cost = 1;
        const predicted = energyPerTransaction(cost);
        results.push({
            name: 'transaction friction · unit cost',
            description:
                'energy the grid spends to execute a single transaction when the transaction cost is 1.',
            predicted,
            expected: 2,
            source: 'transactPoints moves both cells\' energy by cost*sign with equal sign: net |dE| = 2*cost per pair.',
        });
    }

    // 5. Cumulative transaction energy to clear every pair of a 3x3 grid at cost 2.
    {
        const cost = 2;
        const pairs = neighbourPairCount(3, 3);
        const predicted = cumulativeTransactionEnergy(pairs, cost);
        results.push({
            name: 'cumulative friction · 3x3 at cost 2',
            description:
                'total energy to run one transaction across every adjacent pair of a 3-by-3 tissue at transaction cost 2.',
            predicted,
            // 12 pairs * 2*cost = 12 * 4
            expected: 48,
            source: 'linearity of cost: pairs * (2*cost) = 12 * 4; rising friction is what suppresses Coasean bargaining.',
        });
    }

    return results;
}
