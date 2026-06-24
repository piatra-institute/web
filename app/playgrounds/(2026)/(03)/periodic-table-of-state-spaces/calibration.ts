import type { CalibrationResult } from '@/components/CalibrationPanel';

import { STATE_SPACES, SAMPLE_CASES, rankSpaces } from './logic';


/**
 * The model is a deterministic nearest-neighbour classifier over a 10-axis
 * score space. Each sample case carries a hand-built dimension profile and a
 * set of declared state-space "types" (the cells a domain expert would tag it
 * with). The verifiable claim is purely deterministic: when the classifier
 * ranks all 30 state spaces by Euclidean distance to a case's profile, the
 * top-ranked cell should be one of the cells a human already assigned to that
 * case. predicted = 1 when the rank-1 cell is in the declared type set, else 0.
 *
 * This is a falsifiable consistency check on the score matrix, not a claim that
 * the typology is "true". A case whose top match falls outside its tags would
 * mean the numeric profile contradicts the qualitative classification.
 */
const CALIBRATION_CASE_NAMES: string[] = [
    'Classical Mechanics',
    'Quantum Mechanics',
    'Weather Forecasting',
    'Financial Markets',
    'Psychotherapy',
];


export function buildCalibration(): CalibrationResult[] {
    return CALIBRATION_CASE_NAMES.map((caseName) => {
        const sample = SAMPLE_CASES.find((c) => c.name === caseName);
        if (!sample) {
            return {
                name: caseName,
                description: 'missing sample case',
                predicted: 0,
                expected: 1,
                source: 'sample case not found in cases.ts',
            };
        }

        const ranked = rankSpaces(sample.profile, STATE_SPACES);
        const top = ranked[0];
        const inTagSet = sample.types.includes(top.space.id) ? 1 : 0;

        return {
            name: sample.name,
            description: `nearest cell is ${top.space.name} (${top.space.id}); declared cells: ${sample.types.join(', ')}.`,
            predicted: inTagSet,
            expected: 1,
            source: 'deterministic Euclidean nearest-neighbour over the 10-axis score matrix; declared cells from cases.ts',
        };
    });
}
