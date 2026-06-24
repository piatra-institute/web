import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. builds the synthetic typology: 30 state spaces across six families, each scored on ten axes from 0 to 4, a Euclidean nearest-neighbour classifier that ranks cells against a user or sample profile, table, compare, classify, and ladder views, plus calibration of the classifier against five canonical sample cases, six assumptions separating the framework from its hand-assigned scores, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'score matrix: 30 state spaces in six families (geometry, dynamics, control, systems, social, epistemology), each carrying a 10-axis integer profile from 0 to 4.',
            'matching: matchScore as unweighted Euclidean distance over the ten axes, rankSpaces returning a full ranked list, and similarityPercent normalising distance against the maximum possible separation.',
            'views: a table of all cells, a radar compare of up to three cells, a classify mode that ranks cells against a slider-built profile, and a Fixed to Adaptive to Endogenous to Reflexive ladder.',
            'calibration: the classifier is checked against five canonical cases (classical mechanics, quantum mechanics, weather, financial markets, psychotherapy), confirming the nearest cell sits inside each case declared type set.',
            'framing kept honest: the typology is a synthesis with no single canonical source, the axes are assumed orthogonal for tractability, and the integer scores are expert judgements rather than measurements.',
        ],
    },
];
