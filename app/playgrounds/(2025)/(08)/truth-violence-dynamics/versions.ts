import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'August 2025',
        description:
            'three-state ODE model of how truth-seeking capacity is suppressed and support for violence is enabled, driven by emotion, disinformation, and institutional transparency, integrated with RK4. Retrofitted with the scientific scaffolding: a logic module holding the model equations and integrator, calibration that checks the saturating response and the closed-form violence decay, and assumptions separating the established dynamical-systems pieces from the stylized political claims.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'August 2025',
        changes: [
            'three coupled states (grievance, truth-seeking, violence support) with an RK4 integrator and pulse-able exogenous drivers.',
            'logistic truth dynamics, linear violence relaxation with a saturating emotional driver, and a constructed risk index.',
            'presets for stabilizing, spiral, and shock regimes, plus CSV export of the trajectory.',
            'logic module with the model equations and integrator, used by the calibration.',
            'calibration checks the saturating response S(E) and the closed-form violence decay v0 exp(-lambda T) with the driver off.',
        ],
    },
];
