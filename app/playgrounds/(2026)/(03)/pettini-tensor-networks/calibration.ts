export interface CalibrationCase {
    name: string;
    description: string;
    params: {
        diffusion3D: number;
        sliding1D: number;
        resonanceMatch: number;
        activation: number;
        coupling: number;
        ionicNoise: number;
    };
    expected: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'lac repressor',
        description: 'Strong facilitated diffusion via 3D excursions + 1D sliding, no resonance',
        params: { diffusion3D: 60, sliding1D: 75, resonanceMatch: 0, activation: 0, coupling: 0, ionicNoise: 30 },
        expected: 0.55,
        source: 'Berg et al., 1981; Halford & Marko, 2004',
    },
    {
        name: 'p53 scanning',
        description: 'Dominant 1D sliding along DNA with moderate 3D diffusion',
        params: { diffusion3D: 40, sliding1D: 85, resonanceMatch: 0, activation: 0, coupling: 0, ionicNoise: 25 },
        expected: 0.50,
        source: 'Tafvizi et al., 2011 — single-molecule tracking of p53',
    },
    {
        name: '3D diffusion only',
        description: 'Pure 3D diffusion without sliding or resonance (Smoluchowski limit)',
        params: { diffusion3D: 80, sliding1D: 5, resonanceMatch: 0, activation: 0, coupling: 0, ionicNoise: 30 },
        expected: 0.90,
        source: 'von Hippel & Berg, 1989 — diffusion-limited rate baseline',
    },
    {
        name: 'high ionic screening',
        description: 'Elevated salt disrupts sliding and any long-range interactions',
        params: { diffusion3D: 55, sliding1D: 20, resonanceMatch: 40, activation: 40, coupling: 40, ionicNoise: 90 },
        expected: 0.95,
        source: 'Record et al., 1991 — salt dependence of protein-DNA association',
    },
    {
        name: 'resonance-assisted (hypothetical)',
        description: 'Strong frequency match, activation, and coupling under low noise',
        params: { diffusion3D: 50, sliding1D: 40, resonanceMatch: 85, activation: 80, coupling: 75, ionicNoise: 20 },
        expected: 0.35,
        source: 'Pettini et al., 2022 — extrapolation from in vitro recruitment measurements',
    },
];
