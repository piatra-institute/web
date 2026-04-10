import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'April 2026',
        description: 'Initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Three moral formalisms: deontic logic (rights as side-constraints), capability lattice (Sen/Nussbaum), domination/repair state-space',
            'Naive utility included as deliberately crude foil',
            '4 political scenario presets: fragile democracy, segregation, emergency powers, reparative order',
            '13 slider parameters across rights indicators, capabilities, and institutional dynamics',
            'Framework comparison view, deontic violation panel, capability radar, domination/repair trajectory',
            'Parameter sweep showing how each framework responds differently to the same parameter change',
        ],
    },
];
