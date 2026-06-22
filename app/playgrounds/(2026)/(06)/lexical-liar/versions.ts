import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut. ports the contronym ideation prototype to playground conventions: PlaygroundLayout, black-and-lime palette, eight contronyms as presets, context frames, manual pull, free-text keyword scorer, collapse-context paradox mode, a semantic-attractor map, calibration against hand-labelled polarity, and nine assumptions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'modelled each contronym as a semantic operator M(w, c) = f_w(c): a fixed deep operation whose polarity is set by context.',
            'ported eight contronyms (sanction, screen, dust, cleave, oversight, fast, seed, clip) with two attractors, three context frames, and three labelled examples each.',
            'polarity = 0.5 frame + 0.38 manual pull + 0.55 keyword-scored text, clamped to [-100, 100]; basin selected at +/-8 with an underdetermined middle.',
            'collapse-context mode erases the index and forces both senses into one slot, exhibiting the Grim-style paradox of totalization.',
            'semantic-attractor map: a point moving between two basins, drawn together into one slot when context collapses.',
            'calibration: the keyword scorer reads ten example sentences and is checked against the hand-labelled polarity on a 0..100 pull-toward-second-sense axis.',
        ],
    },
];
