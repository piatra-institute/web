export type CaseKey =
    | 'ergoregion'
    | 'positive'
    | 'negative'
    | 'schwarzschild'
    | 'extremal'
    | 'polar';

export const CASE_KEYS: CaseKey[] = [
    'ergoregion',
    'positive',
    'negative',
    'schwarzschild',
    'extremal',
    'polar',
];

export interface CaseProfile {
    a: number;
    E: number;
    L: number;
    Q: number;
}

export interface KerrCase {
    key: CaseKey;
    label: string;
    subtitle: string;
    gloss: string;
    profile: CaseProfile;
    expectedAllowedSpan: number;
    expectedRegimeIndex: number;
    source: string;
}

export const CASES: Record<CaseKey, KerrCase> = {
    ergoregion: {
        key: 'ergoregion',
        label: 'figure-like ergoregion',
        subtitle: 'the signature E = 0 photon, trapped across both horizons.',
        gloss:
            'this is the case in the original Carter-Penrose diagram. the photon has zero conserved energy at infinity but positive local energy inside the ergoregion. its allowed radial range straddles the outer and inner horizons, so it crosses both as it falls in. it cannot escape to infinity (E = 0) and it never reaches the ring singularity (R has a positive turning point at r_min).',
        profile: { a: 0.86, E: 0, L: -2.0, Q: 1.5 },
        expectedAllowedSpan: 1.787,
        expectedRegimeIndex: 2,
        source: 'after Carter, global structure of the Kerr family of gravitational fields (1968); Penrose, gravitational collapse: the role of general relativity (1969).',
    },
    positive: {
        key: 'positive',
        label: 'positive-energy comparison',
        subtitle: 'an ordinary infalling or escaping photon.',
        gloss:
            'with E > 0 the same a, L, Q parameters give a very different orbit: the photon either escapes to infinity or plunges into the black hole, depending on the turning structure of R(r). the unbounded interval is the diagnostic of escape.',
        profile: { a: 0.86, E: 0.65, L: -2.0, Q: 1.5 },
        expectedAllowedSpan: 3.7,
        expectedRegimeIndex: 0,
        source: 'standard Kerr null geodesic literature; Chandrasekhar, the mathematical theory of black holes (1983), chapter 7.',
    },
    negative: {
        key: 'negative',
        label: 'negative-energy ergoregion',
        subtitle: 'Penrose-process flavour, allowed only inside the ergoregion.',
        gloss:
            'an E < 0 trajectory is forbidden outside the ergoregion but possible inside it, because the time-translation Killing vector is spacelike there. this is the orbit fragment that, in the Penrose process, falls in and reduces the black hole\'s mass while a sibling escapes with more energy than the parent.',
        profile: { a: 0.86, E: -0.25, L: -1.5, Q: 0.8 },
        expectedAllowedSpan: 1.5,
        expectedRegimeIndex: 2,
        source: 'after Penrose, gravitational collapse: the role of general relativity (1969); Penrose and Floyd, extraction of rotational energy from a black hole (1971).',
    },
    schwarzschild: {
        key: 'schwarzschild',
        label: 'Schwarzschild limit',
        subtitle: 'a -> 0; horizons collapse to r = 2M and r = 0.',
        gloss:
            'as the spin a goes to zero the Kerr geometry degenerates to Schwarzschild. the outer horizon moves to r = 2M and the inner horizon falls onto r = 0. the Carter constant Q stops being needed for separability in the same way, but R(r) still has a clean root structure that the playground can check.',
        profile: { a: 0.01, E: 0.6, L: 3, Q: 0.5 },
        expectedAllowedSpan: 3.8,
        expectedRegimeIndex: 0,
        source: 'Schwarzschild, on the gravitational field of a point mass according to Einstein\'s theory (1916); Chandrasekhar (1983) chapter 3.',
    },
    extremal: {
        key: 'extremal',
        label: 'near-extremal',
        subtitle: 'spin a -> M; the two horizons nearly coincide.',
        gloss:
            'pushing a toward M makes r+ and r- collapse onto each other; the between-horizons region M_II becomes vanishingly thin. the radial potential changes shape, and certain photon orbits that would have been trapped in a moderate-spin geometry become marginally bound in the extremal limit.',
        profile: { a: 0.98, E: 0.5, L: 2, Q: 0.5 },
        expectedAllowedSpan: 1.3,
        expectedRegimeIndex: 2,
        source: 'after Bardeen, Kerr metric black holes (1970); Chandrasekhar (1983) chapter 7.',
    },
    polar: {
        key: 'polar',
        label: 'polar plunge',
        subtitle: 'L = 0 with large Q; off-equatorial motion only.',
        gloss:
            'setting the axial angular momentum L to zero with a substantial Carter constant Q forces the photon\'s motion away from the equatorial plane. R(r) becomes Q-dominated; the playground uses this case to isolate the role of the Carter constant in shaping the radial potential.',
        profile: { a: 0.5, E: 0.9, L: 0, Q: 4 },
        expectedAllowedSpan: 3.7,
        expectedRegimeIndex: 0,
        source: 'after Carter, Hamilton-Jacobi and Schrodinger separable solutions of Einstein\'s equations (1968); standard treatment in Frolov and Novikov, black hole physics (1998).',
    },
};
