import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DEFAULT_PARAMS,
    acceptanceProbability,
    careMetrics,
    expectedFlows,
    potentialPairs,
    type Params,
} from './logic';


// This is a `reproduction` calibration: every `expected` is an analytic identity,
// a closed-form the engine should satisfy exactly, or a literature anchor the code
// is supposed to encode (the 1.4-litter / 3-kitten reproduction rate from Nutter
// et al. 2004). Agreement confirms the simulation math implements what the model
// claims, which is the only honest check for a system that is explicitly a
// hypothesis generator, not a fitted predictor. See CLAUDE.md.
export const calibrationMeta = { kind: 'reproduction' as const };


function base(overrides: Partial<Params>): Params {
    return { ...DEFAULT_PARAMS, interventionMonth: 0, ...overrides };
}

function r3(x: number): number {
    return Number(x.toFixed(3));
}


export function buildCalibration(): CalibrationResult[] {
    // 1. An empty household has zero care load, so rho = 0 exactly.
    const emptyRho = careMetrics(0, base({ initialCats: 0 })).rho;

    // 2. With no organization and no external support, effective capacity equals
    //    baseline capacity: 5 * (1 + 0.20*0 + 0.15*0) = 5.
    const capNoOrg = careMetrics(5, base({ organization: 0, externalSupport: 0, baselineCapacity: 5 })).effectiveCapacity;

    // 3. The acceptance logistic is centered on benefit = perceived cost, where it
    //    must return exactly 0.5 (sigmoid of zero).
    const acceptMid = acceptanceProbability(0.6, 0.6);

    // 4. Fertile females = n * 0.5 * (1 - sterilized share): 10 * 0.5 * (1-0.8) = 1.
    const fertile = expectedFlows(10, base({ sterilizedShare: 0.8 }), 0, 0).fertileFemales;

    // 5. Literature anchor (Nutter et al. 2004): 1.4 litters/year * 3 kittens/litter
    //    = 4.2 surviving kittens per fertile female per year at full survival and
    //    unit reproduction intensity.
    const kittens = expectedFlows(10, base({ reproductionScale: 1, kittenSurvival: 1 }), 0, 0)
        .annualSurvivingKittensPerFertileFemale;

    // 6. Complete sterilization removes all births regardless of population.
    const birthsSterile = expectedFlows(40, base({ sterilizedShare: 1 }), 0, 0).birthExpected;

    // 7. Individual-monitoring combinatorics: 120 cats imply 120*119/2 = 7140
    //    potential pairwise relationships, the load argument behind the model's
    //    super-linear monitoring term.
    const pairs120 = potentialPairs(120);

    return [
        {
            name: 'empty household · rho',
            description: 'zero cats means zero care load, so the load ratio is exactly zero.',
            predicted: r3(emptyRho),
            expected: 0,
            source: 'model identity: load(0) = 0 => rho = 0',
        },
        {
            name: 'bare capacity · no organization',
            description: 'with organization and support at zero, effective capacity collapses to the baseline.',
            predicted: r3(capNoOrg),
            expected: 5,
            source: 'closed form: 5 * (1 + 0.20*0 + 0.15*0) = 5',
        },
        {
            name: 'acceptance at indifference',
            description: 'when benefit equals perceived cost, the logistic acceptance probability is one half.',
            predicted: r3(acceptMid),
            expected: 0.5,
            source: 'logistic identity: sigmoid(0) = 0.5',
        },
        {
            name: 'fertile females · 10 cats, 80% fixed',
            description: 'half the cats are female and a fifth remain intact.',
            predicted: r3(fertile),
            expected: 1,
            source: 'closed form: 10 * 0.5 * (1 - 0.8) = 1',
        },
        {
            name: 'reproduction anchor · kittens/female/year',
            description: 'surviving kittens per fertile female per year at unit intensity and full survival.',
            predicted: r3(kittens),
            expected: 4.2,
            source: 'Nutter, Levine & Stoskopf 2004 (JAVMA): 1.4 litters/yr * 3 kittens/litter',
        },
        {
            name: 'full sterilization · births',
            description: 'a fully sterilized population produces no births at any count.',
            predicted: r3(birthsSterile),
            expected: 0,
            source: 'model identity: fertile females = 0 => births = 0',
        },
        {
            name: 'relationship load · 120 cats',
            description: 'pairwise relationships a caregiver would in principle have to monitor at 120 cats.',
            predicted: r3(pairs120),
            expected: 7140,
            source: 'combinatorial closed form: n(n-1)/2 with n = 120',
        },
    ];
}
