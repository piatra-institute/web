export interface CalibrationCase {
    name: string;
    description: string;
    expectedRegime: 'stable' | 'contested' | 'fragile';
    expectedViability: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'Milgram obedience',
        description:
            'Experimenter coerces participant to administer shocks. High domination and harm; agency erosion under institutional weight.',
        expectedRegime: 'fragile',
        expectedViability: 38,
        source: 'Milgram, 1963 J. Abnormal & Social Psychology, Behavioral study of obedience',
    },
    {
        name: 'commons cooperation',
        description:
            'Stable institutions, mutual repair norms, low scarcity. Trust accrues, exploit suppressed by strong norms.',
        expectedRegime: 'stable',
        expectedViability: 80,
        source: 'Ostrom, 1990, Governing the Commons',
    },
    {
        name: 'fishery collapse',
        description:
            'High scarcity + dopamine + weak institution → exploit-dominant equilibrium → ecological resilience collapses.',
        expectedRegime: 'fragile',
        expectedViability: 40,
        source: 'Worm et al., 2006 Science, Impacts of biodiversity loss on ocean ecosystem services',
    },
    {
        name: 'whistleblower under autocracy',
        description:
            'Truth-telling against strong institutional weight. Frames split: legal frame condemns, kin/medical praise. Net viability mid-range.',
        expectedRegime: 'contested',
        expectedViability: 58,
        source: 'Glazer & Glazer, 1989, The Whistleblowers',
    },
    {
        name: 'truth and reconciliation',
        description:
            'Coercion was high, but post-conflict repair is institutionalised. Memory and institution amplify repair flow.',
        expectedRegime: 'contested',
        expectedViability: 62,
        source: 'TRC South Africa, 1996; Tutu, 1999, No Future Without Forgiveness',
    },
    {
        name: 'kept promise across generations',
        description:
            'Steady promise-keeping with high memory and institutional support. Trust compounds; repair never needed.',
        expectedRegime: 'stable',
        expectedViability: 84,
        source: 'Putnam, 2000, Bowling Alone (illustrative case)',
    },
];
