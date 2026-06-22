import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2026',
        description:
            'Initial implementation. Ten figures across return, descent, mortality, transfer, cosmic order, infinite appetite, bureaucracy, society, over-possibility, and pathological collapse. Six axes (locality, abstraction, desire, institution, trauma, knowledge), five lenses (sheaf, stalk, monodromy, obstruction, derived), four presets. Custom obstruction map visualization plus radar, sweep, sensitivity, calibration, and assumption panels.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'claude-v1',
        date: 'May 2026',
        changes: [
            'Ten narrative figures with canonical axis profiles drawn from scholarly readings, not implementer preference.',
            'Six-axis basis (locality, abstraction, desire, institution, trauma, knowledge) chosen as the smallest set that distinguishes the figures while remaining intelligible.',
            'Obstruction model: pressure from desire, trauma, abstraction, and local-global tension; containment from institution and knowledge.',
            'Derived metrics: glue, mythic charge, modernity pressure, germ persistence, monodromy twist, local-global tension.',
            'Five lenses (sheaf, stalk, monodromy, obstruction, derived) frame the reading but do not change the numbers; the configuration is the model.',
            'Calibration compares model-predicted obstruction against a reader-provided expected obstruction for each canonical figure.',
            'Obstruction map: six axis nodes placed on a hex, gluing edges weighted by minimum-pair value times overall glue, rupture arcs activated by obstruction.',
        ],
    },
];
