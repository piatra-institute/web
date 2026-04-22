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
            '13 country presets spanning post-socialist transition (ROU, POL, CZE, EST, HUN, BGR, SVK, SVN, UKR) and comparative cases (DEU, ESP, PRT, IRL, KOR)',
            'Two transfer modes: path transfer (import growth trajectory) and decision basket (import policy score)',
            'Synthetic control — blend multiple model countries with normalized weights',
            'Confidence bands with square-root compounded uncertainty',
            'Historical event markers overlaid on the GDP timeline (EU accessions, 2008 crisis, COVID, war)',
            'Policy gap decomposition attributing the overall gap to specific dimensions',
            'Reverse framing toggle for symmetric counterfactuals',
            '5 presets: Romania–Poland, Bulgaria–Czechia, Hungary–Poland, Ukraine–Poland, Romania synthetic',
            'Cumulative 1990–2024 gap, annual gap area chart, per-capita comparison',
        ],
    },
];
