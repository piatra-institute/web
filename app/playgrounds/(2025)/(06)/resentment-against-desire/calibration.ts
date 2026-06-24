import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    calculateResentment,
    predictDecision,
    calculateProposerShare,
    isAtTippingPoint,
    TOTAL_PIE,
} from './logic';


/**
 * Calibration of the deterministic core of the resentment-versus-desire model.
 *
 * The model has one stochastic part (generateOffer, which samples an offer from
 * a biased pool) that is deliberately left out of the calibration. Everything
 * below is computed by calling the actual logic functions, never hardcoded to
 * match the expected target.
 *
 * The "expected" targets come from the model's own stated rules and from the
 * empirical regularities of the 1982 ultimatum-game literature:
 *  - resentment is a linear ramp of unfairness, capped at 100;
 *  - a fair or generous split provokes no resentment;
 *  - acceptance is decided by the sign of desire minus resentment;
 *  - the offer plus what the proposer keeps must sum to the whole pie.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            // resentment at an insulting 1-coin offer: (5 - 1) * 25 = 100, capped.
            name: 'resentment · insulting 1-coin offer',
            description:
                'a 1-coin split out of 10 is maximally unfair, so resentment saturates at the 100 ceiling.',
            predicted: calculateResentment(1),
            expected: 100,
            source: 'model rule resentment = min((5 - offer) * 25, 100); ultimatum-game responders treat near-zero offers as insults',
        },
        {
            // resentment at a 3-coin offer: (5 - 3) * 25 = 50.
            name: 'resentment · 3-coin offer',
            description:
                'a 30 percent split is unfair but not extreme, landing resentment at the midpoint of its range.',
            predicted: calculateResentment(3),
            expected: 50,
            source: 'model rule resentment = (5 - offer) * 25 for offers below the fair split of 5',
        },
        {
            // a fair 5-coin offer provokes no resentment.
            name: 'resentment · fair 5-coin split',
            description:
                'an even split removes the unfairness signal entirely, so resentment is zero.',
            predicted: calculateResentment(5),
            expected: 0,
            source: 'model rule: offers at or above the fair split of 5 produce no resentment',
        },
        {
            // conservation: offer + proposer share = whole pie, here at a 4-coin offer.
            name: 'conservation · pie sums to ten',
            description:
                'whatever the responder is offered plus whatever the proposer keeps must equal the full pie of ten coins.',
            predicted: 4 + calculateProposerShare(4),
            expected: TOTAL_PIE,
            source: 'accounting identity of a fixed-pie split: offer + kept = total',
        },
        {
            // decision boundary: low desire (20) facing a 2-coin offer.
            // resentment(2) = 75; desire 20 < 75, so the model rejects.
            // boolean encoded as reject -> 1.
            name: 'decision · low desire rejects very unfair offer',
            description:
                'with weak desire and a very unfair 2-coin offer, resentment dominates and the model predicts rejection.',
            predicted: predictDecision(20, calculateResentment(2)) === 'reject' ? 1 : 0,
            expected: 1,
            source: 'model rule: accept when desire >= resentment; here desire 20 < resentment 75',
        },
        {
            // tipping point: desire 50 against a 3-coin offer gives resentment 50,
            // so |desire - resentment| = 0 < 5 and resentment > 0 -> at the edge.
            name: 'tipping point · desire meets resentment',
            description:
                'when desire equals resentment the responder sits exactly on the accept/reject knife-edge.',
            predicted: isAtTippingPoint(50, calculateResentment(3)) ? 1 : 0,
            expected: 1,
            source: 'model rule: a tipping point holds when resentment > 0 and |desire - resentment| < 5',
        },
    ];
}
