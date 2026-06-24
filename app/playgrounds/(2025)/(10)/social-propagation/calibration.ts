import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    basicReproduction,
    effectiveReproduction,
    finalSizeFraction,
    freshnessFactor,
    isSupercritical,
    thresholdActivation,
    allowedPostsPerDay,
} from './logic';


/**
 * Each case is verified against a closed-form target from epidemic / cascade
 * theory. Every `predicted` is computed by the logic functions, never hardcoded.
 * The stochastic mean-field Viewer is not calibrated directly; only the
 * deterministic core (R0, R_eff, the epidemic threshold, the final-size relation,
 * freshness decay, and linear-threshold activation) is checked, since those have
 * exact analytic answers.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Basic reproduction number R0 = avgDegree * shareProb * amplification.
    //    With degree 150, share 0.02, amplification 1.0 the closed form is 3.0.
    const r0 = basicReproduction({ avgDegree: 150, shareProb: 0.02, amplification: 1.0 });
    results.push({
        name: 'R0 = k · p · a',
        description: 'basic reproduction number for fan-out 150, reshare probability 0.02, amplification 1.0; analytic value 150 × 0.02 × 1.0 = 3.0.',
        predicted: Number(r0.toFixed(3)),
        expected: 3.0,
        source: 'branching-process R0 = (contacts) × (transmission probability); Anderson and May 1991.',
    });

    // 2. Epidemic threshold. Forward caps (degreeFactor 0.5) and question gating
    //    (shareProbFactor 0.75) pull the same R0=3 cascade to R_eff = 3*0.5*0.75 = 1.125,
    //    which is still supercritical (spreads iff R_eff > 1). Boolean check, expected 1.
    const rEff = effectiveReproduction(
        { avgDegree: 150, shareProb: 0.02, amplification: 1.0 },
        { degreeFactor: 0.5, shareProbFactor: 0.75, coolupIgnitionDamp: 1.0 },
    );
    results.push({
        name: 'threshold: spreads iff R_eff > 1',
        description: `with forward caps and gating, R_eff = ${rEff.toFixed(3)} > 1, so the cascade is still supercritical and spreads.`,
        predicted: isSupercritical(rEff) ? 1 : 0,
        expected: 1,
        source: 'epidemic threshold theorem: a cascade is self-sustaining iff R_eff > 1.',
    });

    // 3. Subcritical control. Stacking forward caps, gating, and coolup damping
    //    on a weaker R0 drives R_eff below 1, so the cascade must die out (predict 0).
    const rEffSub = effectiveReproduction(
        { avgDegree: 60, shareProb: 0.015, amplification: 1.0 },
        { degreeFactor: 0.5, shareProbFactor: 0.75, coolupIgnitionDamp: 0.55 },
    );
    results.push({
        name: 'subcritical: cascade dies out',
        description: `low fan-out plus full policy friction gives R_eff = ${rEffSub.toFixed(3)} < 1, so the cascade is subcritical and self-terminates.`,
        predicted: isSupercritical(rEffSub) ? 1 : 0,
        expected: 0,
        source: 'below the epidemic threshold R_eff < 1 a branching process is extinct almost surely.',
    });

    // 4. Final-size relation. For a supercritical cascade with R_eff = 2.0 the
    //    eventual attack-rate fraction is 1 - 1/R_eff = 0.5 of the audience.
    const attackRate = finalSizeFraction(2.0);
    results.push({
        name: 'final size = 1 − 1/R_eff',
        description: 'at R_eff = 2.0 the saturating cascade eventually reaches half the susceptible audience; 1 − 1/2 = 0.5.',
        predicted: Number(attackRate.toFixed(3)),
        expected: 0.5,
        source: 'SIR / branching final-size relation; deterministic giant-component size.',
    });

    // 5. Freshness decay. Content exactly one half-life old retains half its
    //    persuasive potency: 2^(-240/240) = 0.5.
    const fresh = freshnessFactor(240, 240);
    results.push({
        name: 'freshness halves per half-life',
        description: 'attention decay at age 240 min with a 240 min half-life gives factor 2^(−1) = 0.5.',
        predicted: Number(fresh.toFixed(3)),
        expected: 0.5,
        source: 'exponential novelty decay; one half-life leaves half the potency.',
    });

    // 6. Linear-threshold (complex contagion) activation. A node with adoption
    //    threshold 0.25 and 40% active neighbours does adopt (0.40 >= 0.25), so 1.
    const activates = thresholdActivation(0.40, 0.25);
    results.push({
        name: 'complex contagion: adopt iff frac ≥ θ',
        description: 'a node with threshold θ = 0.25 and active-neighbour fraction 0.40 crosses the bar and adopts.',
        predicted: activates ? 1 : 0,
        expected: 1,
        source: "Granovetter 1978 / Watts 2002 linear-threshold model: adopt iff active-neighbour fraction ≥ θ.",
    });

    // 7. Cooldown clamp. A 10-hour cooldown caps a 2.0-posts/day spammer at the
    //    2.4/day lock-derived rate but the per-day minimum keeps it at 2.0 here;
    //    a higher baseline is clamped to 2.4. Check the clamp at baseline 5.0/day.
    const allowed = allowedPostsPerDay(5.0, true, false);
    results.push({
        name: 'cooldown caps posting rate',
        description: 'a 10-hour cooldown caps a 5.0 posts/day account at one post per 10 h, i.e. 2.4 posts/day.',
        predicted: Number(allowed.toFixed(2)),
        expected: 2.4,
        source: 'one post per 10-hour lock window = 24/10 = 2.4 posts per day.',
    });

    return results;
}
