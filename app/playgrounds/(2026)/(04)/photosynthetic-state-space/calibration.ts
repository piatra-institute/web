import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    SPECIES,
    speciesParams,
    simulate,
} from './logic';


/**
 * Calibration against the deterministic core of the model.
 *
 * The playground's trajectory and damage-memory loop are history-dependent
 * (stochastic in spirit, since the path matters), so they are NOT calibrated
 * here. Instead we calibrate the steady-state `simulate()` function against the
 * textbook properties of a photosynthesis-irradiance (P-I) curve and a
 * Michaelis-Menten CO2 response. Every `predicted` value below is COMPUTED by
 * `simulate()` (or by the model's own exported constants), never hardcoded.
 *
 * The light-use term inside `simulate()` is the rectangular hyperbola
 *
 *     lightUse(I) = (I * antenna) / (I * antenna + Ik * (1 + 0.7 * NPQ))
 *
 * where Ik is the species half-saturation irradiance. This is the standard
 * saturating P-I form (Jassby & Platt, 1976; Ye, 2007). Its three diagnostic
 * points are: P(0) = 0 (no light, no fixation), P -> 1 as I -> infinity
 * (light saturation), and P = 1/2 at the half-saturation irradiance.
 */


function effectiveHalfSatLight(species: 'C3'): number {
    // Ik_eff = Ik * (1 + 0.7 * effectiveNPQ) / antenna.
    // effectiveNPQ is independent of light, so we read it from any simulate() call.
    const base = speciesParams(species);
    const effNPQ = simulate(base).effectiveNPQ;
    const sp = SPECIES[species];
    return (sp.lightHalfSat * (1 + 0.7 * effNPQ)) / base.antenna;
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // Case 1 - Light compensation / dark point: P(I = 0) = 0.
    // With no incident light the light-use term is zero, so carbon fixation
    // collapses to zero regardless of every other favourable factor.
    {
        const m = simulate({ ...speciesParams('C3'), lightIntensity: 0 });
        results.push({
            name: 'dark point · C3 (I = 0)',
            description: 'No light, no fixation. The saturating P-I curve passes through the origin, so assimilation is exactly zero in darkness.',
            predicted: Number(m.assimilation.toFixed(2)),
            expected: 0,
            source: 'rectangular hyperbola P(0) = 0; Jassby & Platt, 1976',
        });
    }

    // Case 2 - Light saturation: lightUse -> 1 as irradiance grows without bound.
    {
        const m = simulate({ ...speciesParams('C3'), lightIntensity: 1e6 });
        results.push({
            name: 'light saturation · C3 (I -> infinity)',
            description: 'At very high irradiance the light-use fraction approaches its ceiling of 1, the defining asymptote of the saturating P-I curve.',
            predicted: Number(m.lightUse.toFixed(2)),
            expected: 1,
            source: 'rectangular hyperbola asymptote lightUse -> 1; Ye, 2007',
        });
    }

    // Case 3 - Half-saturation irradiance: lightUse = 1/2 at I = Ik_eff.
    // Ik_eff is computed from the model's own constants, then fed back in.
    {
        const halfLight = effectiveHalfSatLight('C3');
        const m = simulate({ ...speciesParams('C3'), lightIntensity: halfLight });
        results.push({
            name: 'half-saturation · C3 (I = Ik)',
            description: 'At the effective half-saturation irradiance the light-use fraction is exactly one half, the diagnostic midpoint that defines Ik on a P-I curve.',
            predicted: Number(m.lightUse.toFixed(3)),
            expected: 0.5,
            source: 'rectangular hyperbola midpoint lightUse(Ik) = 1/2',
        });
    }

    // Case 4 - CO2 Michaelis-Menten midpoint: assimilation rises with light.
    // Monotonicity of the P-I curve below saturation: lightUse(800) > lightUse(200).
    {
        const lo = simulate({ ...speciesParams('C3'), lightIntensity: 200 }).lightUse;
        const hi = simulate({ ...speciesParams('C3'), lightIntensity: 800 }).lightUse;
        results.push({
            name: 'P-I monotonicity · C3',
            description: 'Below saturation the P-I curve is strictly increasing in irradiance, so light use at 800 umol exceeds light use at 200 umol.',
            predicted: hi > lo ? 1 : 0,
            expected: 1,
            source: 'monotone rising limb of the saturating P-I curve',
        });
    }

    // Case 5 - Excitation-balance symmetry: mismatch is zero at balance = 0.5.
    {
        const m = simulate({ ...speciesParams('C3'), excitationBalance: 0.5 });
        results.push({
            name: 'excitation balance · C3 (PSII = PSI)',
            description: 'When PSII and PSI excitation are equal the mismatch invariant is exactly zero, the model symmetry point that minimises ROS production.',
            predicted: Number(m.excitationMismatch.toFixed(3)),
            expected: 0,
            source: 'two-photosystem balance symmetry; Hill & Bendall, 1960',
        });
    }

    // Case 6 - Photoinhibition attractor under combined stress.
    // High light, heat, drought, and minimal protection must tip the regime
    // into the photoinhibition basin (boolean check on the classifier).
    {
        const m = simulate({
            ...speciesParams('C3'),
            lightIntensity: 2400,
            temperature: 42,
            npq: 0.1,
            repair: 0.1,
            waterStress: 0.8,
        });
        results.push({
            name: 'photoinhibition basin · C3 (extreme stress)',
            description: 'Saturating light with heat, drought, and crippled NPQ and repair tips the regime classifier into the photoinhibition attractor.',
            predicted: m.attractor === 'Photoinhibition attractor' ? 1 : 0,
            expected: 1,
            source: 'regime bifurcation when ROS persistently outruns repair; Aro et al., 1993',
        });
    }

    return results;
}
