import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'May 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'May 2026',
        changes: [
            'Thirteen input parameters across object, context, observer, and historical time',
            'Aura vector with eight fibers: sacred, prestige, distance, history, trace, meme, market, uncanny',
            'Curvature, sheaf tension, and holonomy as emergent metrics from interaction polynomials',
            'Six attractor basins (sacred relic, institutional masterpiece, luxury, ruin, meme, synthetic novelty)',
            'Energy landscape over (historical depth, ritual distance) with three anchored wells',
            'Holonomy path: studio → market → archive → crisis → return',
            'Optimal transport cost to relic, luxury, and meme-relic targets',
            'Five presets: museum masterpiece, AI image in feed, wartime archive, meme relic, luxury commodity',
        ],
    },
];
