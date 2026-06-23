import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'cells-as-agents',
        statement:
            'each array element is an autonomous cell that decides whether to swap with a neighbour, rather than a passive value moved by a central sorting routine. sorting becomes a collective, bottom-up behaviour.',
        citation:
            'Zhang, Goldstein and Levin (2023) on self-sorting arrays and basal cognition; "sorting algorithms as agential material".',
        confidence: 'contested',
        falsifiability:
            'if the global order matched a single centralized algorithm exactly, the agential framing would add nothing; the interest is in mixed-algotype and error-tolerant behaviour.',
    },
    {
        id: 'local-comparisons',
        statement:
            'cells act only on local information (their immediate neighbours), so order emerges without any global view of the array. this locality is the core constraint.',
        citation:
            'local-rule cellular models; sorting from neighbour-only comparisons.',
        confidence: 'established',
        falsifiability:
            'allowing a cell to see the whole array would make it a conventional sort, not an emergent one.',
    },
    {
        id: 'sortedness-metric',
        statement:
            'sortedness is measured as the fraction of adjacent pairs already in increasing order, so a fully ascending array scores (n-1)/n and a reversed one scores 0. this is exact.',
        citation:
            'the computeSortednessValue metric.',
        confidence: 'established',
        falsifiability:
            'the calibration checks sortedness on ascending, reversed, and length-5 arrays against the closed form; a deviation would be an implementation error.',
    },
    {
        id: 'aggregation-metric',
        statement:
            'aggregation measures the fraction of adjacent pairs sharing an algotype, capturing whether like cells cluster together (a separate axis from being value-sorted).',
        citation:
            'the computeAggregationValue metric.',
        confidence: 'established',
        falsifiability:
            'the calibration checks aggregation on uniform and alternating algotypes; the metric is exact.',
    },
    {
        id: 'mixed-algotypes',
        statement:
            'cells can carry different sorting algotypes (bubble, insertion, selection), swap policies, and mutation strategies, so the array is heterogeneous. global behaviour is then a mixture, not one clean algorithm.',
        citation:
            'the model\'s per-cell algotype, swap, and mutation options.',
        confidence: 'contested',
        falsifiability:
            'heterogeneous agents can produce delayed-gratification and error-tolerant dynamics a single algorithm cannot, which is the phenomenon of interest.',
    },
    {
        id: 'illustrative-sandbox',
        statement:
            'this is a conceptual sandbox for "sorting as agency", exploring robustness, aggregation, and mutation, not a benchmark of sorting performance or a literal model of cells.',
        citation:
            'stated scope; an agential-materials sandbox after Levin-lab work.',
        confidence: 'speculative',
        falsifiability:
            'the exact content is the order metrics; the basal-cognition interpretation is the framing.',
    },
];
