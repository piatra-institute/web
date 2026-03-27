import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'March 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'March 2026',
        changes: [
            'Coupled 6-sector simulation over 35-year horizon with 13 policy parameters',
            'Five regime presets: balanced, wartime, venture, monopoly, breakdown',
            'Five frontier event toggles: AI shock, automation wave, cheap nuclear, cis-lunar, RTSC',
            'Trajectory, radar, scatter, and bar chart visualizations with snapshot comparison',
            'Sector deep-dive diagnostics with best-instrument recommendation',
            'Parameter sweep and sensitivity analysis on welfare index',
        ],
    },
];
