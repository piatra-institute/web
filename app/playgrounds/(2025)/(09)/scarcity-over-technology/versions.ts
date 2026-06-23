import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'September 2025',
        description:
            'model of scarcity as the dual multiplier on a binding resource constraint, asking when technology can engineer scarcity away and when it cannot. Retrofitted with the scientific scaffolding: a logic module holding the capacity, scarcity, and welfare equations, calibration of the power-law capacity and the attention-ceiling claim, and assumptions separating the established duality from the stylized political-economy framing.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'September 2025',
        changes: [
            'scarcity-versus-technology model: power-law capacity eroded by friction and corruption, scarcity as the binding dual multiplier, log-utility welfare.',
            'optional attention ceiling that caps usable capacity, so some scarcities are independent of technology.',
            'live readouts of scarcity, its derivative in technology, welfare, and welfare growth, with a scarcity-versus-technology chart.',
            'logic module with the capacity, scarcity, and welfare equations, used by the calibration.',
            'calibration checks the power-law capacity, the material scarcity multiplier, and that more technology cannot reduce scarcity once the attention ceiling binds.',
        ],
    },
];
