import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. builds the hydride-anomaly explorer: tabulated boiling and melting points, latent heats, and molar masses for the group 14 to 17 binary hydrides plus noble-gas, alkane, alcohol, and diatomic baselines. fits a least-squares line through the period 3 to 5 members of each family, extrapolates to period 2, and reports the residual as the hydrogen-bonding gap. adds series, scatter, outlier, and phase views, plus calibration of the trend extrapolation and residuals against hand-computed values.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'substance dataset: boiling point, melting point, latent heat of vaporisation and fusion, molar mass, and periodic row for 38 substances across eight families.',
            'anomaly model: least-squares fit through periods 3, 4, 5 of each hydride family, extrapolated to period 2; residual = observed minus trend.',
            'scatter baseline: boiling point regressed on ln(molar mass) over non-hydrogen-bonding substances, so water and HF can be seen jumping above the dispersion line.',
            'phase lens: solid/liquid/gas classification at an adjustable ambient temperature, showing water alone liquid among the groups 14 to 17 hydrides at 25 C.',
            'calibration: extrapolated trend values and anomaly residuals checked against closed-form OLS computations, including a methane control with a small negative residual.',
        ],
    },
];
