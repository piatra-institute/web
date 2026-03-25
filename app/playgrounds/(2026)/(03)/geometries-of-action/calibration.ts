export interface CalibrationCase {
    name: string;
    description: string;
    params: {
        intrinsicDim: number;
        neurons: number;
        curvature: number;
        taskConstraint: number;
        noise: number;
        speed: number;
        cooling: number;
        alignment: number;
        residual: number;
    };
    expected: number;
    source: string;
}

export const calibrationCases: CalibrationCase[] = [
    {
        name: 'Intact motor cortex',
        description: 'Standard monkey M1 reaching task with 96-channel Utah array, low noise, moderate curvature.',
        params: {
            intrinsicDim: 2,
            neurons: 96,
            curvature: 0.38,
            taskConstraint: 0.72,
            noise: 0.10,
            speed: 0.62,
            cooling: 0.0,
            alignment: 0.58,
            residual: 0.80,
        },
        expected: 78,
        source: 'Gallego et al., 2017 \u2014 M1 population decoding during center-out reaching',
    },
    {
        name: 'Cooled striatum timing',
        description: 'Rat interval timing task with pharmacological cooling of dorsal striatum.',
        params: {
            intrinsicDim: 1,
            neurons: 72,
            curvature: 0.26,
            taskConstraint: 0.86,
            noise: 0.10,
            speed: 0.48,
            cooling: 0.62,
            alignment: 0.42,
            residual: 0.22,
        },
        expected: 30,
        source: 'Jazayeri & Shadlen, 2015 \u2014 timing circuit perturbation',
    },
    {
        name: 'Cross-species alignment',
        description: 'Monkey and mouse motor cortex aligned via CCA during analogous reaching/grasping tasks.',
        params: {
            intrinsicDim: 2,
            neurons: 112,
            curvature: 0.54,
            taskConstraint: 0.68,
            noise: 0.15,
            speed: 0.56,
            cooling: 0.08,
            alignment: 0.86,
            residual: 0.28,
        },
        expected: 35,
        source: 'Gallego et al., 2020 \u2014 cross-species manifold alignment',
    },
    {
        name: 'Severe spinal cord injury',
        description: 'Clinically complete SCI patient attempting voluntary leg movement with surface EMG electrodes.',
        params: {
            intrinsicDim: 2,
            neurons: 80,
            curvature: 0.34,
            taskConstraint: 0.74,
            noise: 0.22,
            speed: 0.58,
            cooling: 0.06,
            alignment: 0.52,
            residual: 0.18,
        },
        expected: 26,
        source: 'Gallego lab, 2023 \u2014 residual spinal decoding in SCI',
    },
];
