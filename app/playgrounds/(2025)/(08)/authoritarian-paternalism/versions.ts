import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'August 2025',
        description:
            'agent-based model of how paternal signaling and order co-evolve to shape citizen support in authoritarian systems, with heterogeneous preferences and a logit choice rule. Retrofitted with the scientific scaffolding: a logic module for the choice and state-dynamics math, calibration that confirms the simulated states converge to their closed-form steady states, and assumptions separating the established choice theory from the stylized political simplifications.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'August 2025',
        changes: [
            'random-utility model: support probability sigma(lambda*dU) over a population with preferences theta ~ Normal.',
            'utility gap dU = a*g - d*r + b*Order + c*theta*F - kappa*k + noise, with the c*theta*F paternal interaction.',
            'linear AR(1) state dynamics for paternal signaling F and order, with closed-form steady states.',
            'agentiality and variance-share metrics tracking how much choice depends on preference vs regime levers.',
            'calibration confirms the iterated states converge to F* = eta*p/(1-rho) and Order* = psi*r/(1-phi).',
        ],
    },
];
