import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'freedom-as-index',
        statement:
            'the "freedom" of an algorithmic system is operationalized as a composite index of five normalized indicators, not a metaphysical claim about will. it is a constructed score for comparing systems, from a sorting routine to a human.',
        citation:
            'composite-indicator methodology; freedom here is a defined measure, not free will.',
        confidence: 'speculative',
        falsifiability:
            'the index is a stipulated definition; whether it tracks anything one would call freedom is a conceptual question, not a measurement.',
    },
    {
        id: 'weighted-blend',
        statement:
            'the score is a convex combination: 0.25 intra-choice entropy, 0.25 empowerment, 0.2 policy-manifold volume, 0.2 causal emergence, 0.1 descriptive regularity. the weights sum to one, so the score is a true weighted average scaled to 0..100.',
        citation:
            'the freedom-score definition in the model.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the floor, ceiling, weight sum, and a worked case; a deviation would be an implementation error.',
    },
    {
        id: 'components-meaningful',
        statement:
            'each component draws on a real concept: choice entropy (information), empowerment (information-theoretic agency, Klyubin et al.), policy-manifold volume, and causal emergence (Hoel). the specific normalizations and combination are modelling choices, not derived from those theories.',
        citation:
            'Klyubin et al. on empowerment; Hoel on causal emergence; used as indicator inspirations.',
        confidence: 'contested',
        falsifiability:
            'a different normalization or weighting could rank the same systems differently, so the ordering is not theory-forced.',
    },
    {
        id: 'normalized-inputs',
        statement:
            'every indicator is assumed already normalized to [0,1]. the playground lets you set them directly rather than estimating them from a running system, so it explores the score surface, not measurement.',
        citation:
            'inputs are sliders in [0,1], not computed from data.',
        confidence: 'established',
        falsifiability:
            'estimating these indicators from a real system is a separate, hard problem the playground does not attempt.',
    },
    {
        id: 'preset-placements',
        statement:
            'the presets (sorting, fixed and learning neural nets, a cell, a human) place example systems at illustrative points on the indicators. these placements are hand-chosen intuitions, not measurements.',
        citation:
            'the preset values in the model.',
        confidence: 'speculative',
        falsifiability:
            'measuring the indicators for these systems could place them elsewhere on the freedom scale.',
    },
    {
        id: 'conceptual-tool',
        statement:
            'the playground is a conceptual instrument for thinking about gradations of algorithmic autonomy, the "space between" rigid and free systems, not a benchmark or a claim that any system is conscious or free.',
        citation:
            'stated scope; a philosophy-of-agency sandbox.',
        confidence: 'established',
        falsifiability:
            'the exact content is the index arithmetic; the interpretation as a freedom spectrum is the framing.',
    },
];
