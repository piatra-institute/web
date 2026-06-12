import { CONTRONYMS, keywordScore, type ContronymKey } from './logic';
import type { CalibrationResult } from '@/components/CalibrationPanel';


export interface CalibrationCase {
    key: ContronymKey;
    /** the sentence the keyword scorer reads, with context erased from the controls. */
    text: string;
    /** human-assigned contextual polarity for the sentence, -100..100. */
    humanScore: number;
}


/**
 * One strong example per contronym, plus one near-ambiguous case. The model
 * reads only the sentence text (no frame, no manual pull); the human label is
 * the target. Both are rescaled to a 0..100 "pull toward the second sense"
 * axis so the relative error in CalibrationPanel stays well defined.
 */
export const CALIBRATION_CASES: CalibrationCase[] = [
    { key: 'sanction', text: 'The ministry sanctioned the new import license.', humanScore: -80 },
    { key: 'sanction', text: 'The regulator sanctioned the company for repeated violations.', humanScore: 85 },
    { key: 'screen', text: 'The festival screened the documentary at noon.', humanScore: -88 },
    { key: 'screen', text: 'The hedge screened the garden from the road.', humanScore: 86 },
    { key: 'dust', text: 'She dusted the shelves before dinner.', humanScore: -90 },
    { key: 'dust', text: 'He dusted the cake with sugar.', humanScore: 84 },
    { key: 'cleave', text: 'The axe cleaved the log in two.', humanScore: -90 },
    { key: 'cleave', text: 'She cleaved to the old doctrine.', humanScore: 88 },
    { key: 'fast', text: 'The rope held fast in the storm.', humanScore: 90 },
    { key: 'seed', text: 'She seeded the peppers before roasting them.', humanScore: 86 },
];


/** map -100..100 polarity onto a 0..100 "pull toward the second sense" axis. */
export function toBnessScale(score: number): number {
    return Number(((score + 100) / 2).toFixed(1));
}


export function buildCalibration(): CalibrationResult[] {
    return CALIBRATION_CASES.map((c) => {
        const word = CONTRONYMS[c.key];
        return {
            name: word.label,
            description: c.text,
            predicted: toBnessScale(keywordScore(c.text, word)),
            expected: toBnessScale(c.humanScore),
            source: 'human-assigned contextual polarity, lexical-liar ideation dataset',
        };
    });
}
