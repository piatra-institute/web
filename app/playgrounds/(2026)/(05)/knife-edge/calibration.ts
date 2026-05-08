export interface CalibrationCase {
    name: string;
    description: string;
    expectedTau: number;
    expectedRegime: 'subcritical' | 'critical' | 'supercritical';
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'cortical avalanches (waking cortex)',
        description:
            'Cortical slice and in vivo recordings: avalanche-size distributions follow a power law with τ ≈ 1.5; branching ratio σ ≈ 1.04.',
        expectedTau: -1.5,
        expectedRegime: 'critical',
        source: 'Beggs & Plenz, 2003, J. Neuroscience 23(35):11167',
    },
    {
        name: 'propofol-anaesthetised cortex',
        description:
            'Under propofol or xenon, the avalanche distribution loses its power-law tail; dynamics shift toward subcritical exponential decay.',
        expectedTau: -2.4,
        expectedRegime: 'subcritical',
        source: 'Maschke et al., 2024, Communications Biology, Anesthetics shift cortical critical dynamics',
    },
    {
        name: 'ketamine dissociative state',
        description:
            'Ketamine preserves dream-like consciousness and keeps dynamics near criticality despite altered phenomenology.',
        expectedTau: -1.55,
        expectedRegime: 'critical',
        source: 'Maschke et al., 2024, same study',
    },
    {
        name: '2D bond percolation at p_c',
        description:
            'Cluster-size distribution at the percolation threshold p_c ≈ 0.5 follows a power law with τ ≈ 187/91 ≈ 2.05.',
        expectedTau: -2.05,
        expectedRegime: 'critical',
        source: 'Stauffer & Aharony, 1994, Introduction to Percolation Theory',
    },
    {
        name: 'epileptic seizure onset',
        description:
            'Pre-seizure cortical recordings show drift toward supercriticality: amplified responses, oversynchronisation, runaway recruitment.',
        expectedTau: -1.1,
        expectedRegime: 'supercritical',
        source: 'Hobbs et al., 2010, J. Clinical Neurophysiology, Critical dynamics in cortical activity',
    },
    {
        name: 'self-organised sandpile (BTW model)',
        description:
            'Bak-Tang-Wiesenfeld model is a canonical self-organised-critical system; avalanche τ ≈ 1.0 in 2D (mean-field gives 3/2).',
        expectedTau: -1.5,
        expectedRegime: 'critical',
        source: 'Bak, Tang & Wiesenfeld, 1987, Physical Review Letters 59:381',
    },
];
