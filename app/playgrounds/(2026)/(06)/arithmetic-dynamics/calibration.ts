import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    TEMPLATE_KEYS,
    TEMPLATE_LABELS,
    makeTemplates,
    relaxRecovery,
    templateIndex,
    type TemplateKey,
} from './logic';


// `expected` values are external targets (full regeneration = 100% after Levin's
// associative-memory account), independent of the relaxation code that produces
// `predicted`, so this is declared a validation. The rigid-scar case is a genuine
// non-trivial miss, reported honestly. See CLAUDE.md.
export const calibrationMeta = { kind: 'validation' as const };


interface RegenCase {
    name: string;
    template: TemplateKey;
    memory: number;
    diffusion: number;
    gain: number;
    description: string;
}


/**
 * Each case seeds a stored morphology, lesions it, and relaxes the noise-free
 * dynamics. "Regeneration fidelity" is the lesioned recovery as a percentage of
 * the intact recovery (the same form with no injury). The literature target is
 * 100%: a healthy associative memory repairs small damage back to its target
 * morphology. The rigid case is included deliberately to show where local
 * coupling is too weak to erase the scar.
 */
const REGEN_CASES: RegenCase[] = [
    {
        name: 'recover · single axis',
        template: 'single-axis',
        memory: 1.3,
        diffusion: 0.3,
        gain: 1.6,
        description: 'strong memory, moderate diffusion: a lesioned single-axis form is rebuilt.',
    },
    {
        name: 'recover · tri-lobed',
        template: 'tri-lobed',
        memory: 1.3,
        diffusion: 0.3,
        gain: 1.6,
        description: 'the same retrieval regime applied to a higher-order three-lobed target.',
    },
    {
        name: 'recover · bifurcated',
        template: 'bifurcated-axis',
        memory: 1.3,
        diffusion: 0.3,
        gain: 1.6,
        description: 'a two-headed target; lower absolute overlap, but the lesion is still repaired.',
    },
    {
        name: 'fluid · single axis',
        template: 'single-axis',
        memory: 1.2,
        diffusion: 1.1,
        gain: 1.6,
        description: 'strong diffusion smooths the injury and fills it back in.',
    },
    {
        name: 'fluid · tri-lobed',
        template: 'tri-lobed',
        memory: 1.2,
        diffusion: 1.1,
        gain: 1.6,
        description: 'high diffusion blurs fine structure, so repair is slightly incomplete.',
    },
    {
        name: 'rigid · single axis (scar)',
        template: 'single-axis',
        memory: 2.2,
        diffusion: 0.06,
        gain: 2.6,
        description: 'low diffusion: the lesion leaves a frozen scar the memory cannot smooth out.',
    },
];


export function buildCalibration(): CalibrationResult[] {
    const patterns = makeTemplates();
    return REGEN_CASES.map((c) => {
        const k = templateIndex(c.template);
        const p = { memory: c.memory, diffusion: c.diffusion, gain: c.gain };
        const intact = relaxRecovery(patterns, k, p, { lesion: false });
        const lesioned = relaxRecovery(patterns, k, p, { lesion: true });
        const fidelity = intact > 0 ? (lesioned / intact) * 100 : 0;
        return {
            name: c.name,
            description: c.description,
            predicted: Number(fidelity.toFixed(1)),
            expected: 100,
            source: 'orthogonalised Hopfield retrieval; full-repair target after Levin (planarian anatomical homeostasis)',
        };
    });
}


export const CALIBRATION_TEMPLATE_LABELS = TEMPLATE_KEYS.map((k) => TEMPLATE_LABELS[k]);
