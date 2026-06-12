import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'meaning-is-operator',
        statement:
            'a contronym is modelled not as a fixed dictionary object but as a semantic operator: a function M(w, c) from context c to polarity. its deep operation is fixed and context supplies the direction.',
        citation:
            'Grim-style reading of contronyms as context-sensitive polarity switches; cf. Grim, The Incomplete Universe, on the failure of totalized meaning.',
        confidence: 'contested',
        falsifiability:
            'a usage where the same fully specified context yields both polarities at once, with no further indexing available, would break the operator account.',
    },
    {
        id: 'contradiction-from-collapse',
        statement:
            'the apparent contradiction "P and not-P" is produced by erasing the context index, not by the word. collapse mode in the playground is exactly this erasure made explicit.',
        citation:
            'analogous to Grim-style paradox by totalization: the trouble appears when an open-ended rule-space is flattened into one complete entry.',
        confidence: 'established',
        falsifiability:
            'if non-collapsed, fully indexed readings still produced a stable logical contradiction, the diagnosis would be wrong. they do not: indexed meaning is coherent.',
    },
    {
        id: 'two-attractors',
        statement:
            'each contronym is treated as having exactly two opposed semantic attractors (A and B). intermediate or third readings are folded into the nearest basin or into the underdetermined middle.',
        citation:
            'modelling simplification. many words have graded or multi-modal sense distributions rather than two clean poles.',
        confidence: 'contested',
        falsifiability:
            'a contronym with three or more stable opposed senses (or a smooth sense continuum) would need a richer state space than two basins.',
    },
    {
        id: 'keyword-scorer-is-a-toy',
        statement:
            'the sentence analyzer is a bag-of-hints keyword scorer: it sums matches of curated cue words weighted by each frame\'s polarity. it has no syntax, no parser, and no world model.',
        citation:
            'engineering choice for a transparent, inspectable demo. real disambiguation uses distributional models trained on large corpora.',
        confidence: 'speculative',
        falsifiability:
            'sentences whose disambiguating cue is structural rather than lexical (word order, negation, long-range dependency) will be mis-scored. the calibration table shows where it already drifts.',
    },
    {
        id: 'hand-labeled-polarity',
        statement:
            'the polarity scores attached to context frames and example sentences are hand-assigned on a -100..100 scale, not measured from a corpus.',
        citation:
            'ideation dataset. the numbers encode a reader\'s judgement of how strongly each frame pulls toward a sense.',
        confidence: 'speculative',
        falsifiability:
            'corpus frequencies of each sense in each frame would replace the hand labels; the qualitative basin structure should survive, the exact scores would shift.',
    },
    {
        id: 'linear-combination',
        statement:
            'the combined polarity is a fixed linear blend: 0.5 frame + 0.38 manual pull + 0.55 text score, then clamped. the weights are tuned for legibility, not learned.',
        citation:
            'modelling commitment. a different weighting would move the basin boundaries but not the qualitative two-attractor picture.',
        confidence: 'speculative',
        falsifiability:
            'a case where the blend selects a basin that every component individually contradicts would indicate the linear form is too coarse.',
    },
    {
        id: 'shared-deep-operator',
        statement:
            'the two opposed senses of a contronym are presented as arising from one underlying reversible operation (mediate visibility, change dust-relation, impose institutional force), not as arbitrary homonyms.',
        citation:
            'the analytic claim of the ideation: many contronyms are oppositions generated from a single deeper operator whose direction context fixes.',
        confidence: 'contested',
        falsifiability:
            'a contronym whose two senses have unrelated etymologies and no shared schema (true accidental homonymy) would not fit the single-operator story.',
    },
    {
        id: 'confidence-is-heuristic',
        statement:
            'the confidence readout is a monotone function of polarity magnitude, 50 + 0.49 * |score| capped at 99. it is a display heuristic, not a calibrated probability.',
        citation:
            'modelling choice. it communicates "how committed the context is", nothing more.',
        confidence: 'established',
        falsifiability:
            'this is a feature, not a hypothesis; it would only be wrong if read as an actual posterior probability of the chosen sense.',
    },
    {
        id: 'eight-word-sample',
        statement:
            'the lexicon is eight English contronyms chosen to span institutional, physical, and domestic registers. it is illustrative, not a census of the phenomenon.',
        citation:
            'ideation sample. English has dozens of attested contronyms (auto-antonyms).',
        confidence: 'established',
        falsifiability:
            'a broader sample could reveal patterns the eight do not, but would not change the operator-over-context claim the playground makes.',
    },
];
