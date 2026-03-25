import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'low-dim-manifold',
        statement: 'Neural population activity during task performance is confined to a smooth, low-dimensional manifold whose intrinsic dimension reflects task degrees of freedom.',
        citation: 'Gallego et al., 2017 \u2014 Nature Neuroscience: cortical population activity in a low-dimensional space',
        confidence: 'established',
        falsifiability: 'Finding that neural activity during a well-controlled task fills the full N-dimensional space with no low-rank structure would invalidate this.',
    },
    {
        id: 'geometry-vs-projection',
        statement: 'Linear dimensionality reduction (PCA) can substantially distort the intrinsic manifold geometry when the manifold is curved.',
        citation: 'Cunningham & Yu, 2014 \u2014 Nature Neuroscience: dimensionality reduction for large-scale neural data',
        confidence: 'established',
        falsifiability: 'Demonstrating that PCA faithfully preserves geodesic distances on a known curved manifold would challenge this.',
    },
    {
        id: 'cooling-dissociation',
        statement: 'Cooling the striatum slows neural dynamics along the manifold without substantially altering the manifold geometry itself.',
        citation: 'Jazayeri & Shadlen, 2015; Gallego podcast \u2014 causal manipulation of timing circuits in striatal populations',
        confidence: 'established',
        falsifiability: 'Showing that cooling reorganizes manifold topology rather than just slowing traversal would invalidate the dynamics/geometry dissociation.',
    },
    {
        id: 'cross-subject-invariance',
        statement: 'Different subjects performing the same task exhibit similar manifold structure despite having different individual neurons, supporting ontological reality.',
        citation: 'Gallego et al., 2020 \u2014 Nature Neuroscience: cross-subject and cross-species alignment of motor cortical manifolds',
        confidence: 'contested',
        falsifiability: 'Finding that aligned manifolds carry no more shared information than chance-level neural subspaces would weaken this claim.',
    },
    {
        id: 'residual-decoding',
        statement: 'Residual motor signals in spinal cord injury patients preserve enough low-dimensional structure to decode intended movements for neuroprosthetic control.',
        citation: 'Gallego lab, 2023 \u2014 spinal electrode arrays in clinically complete SCI patients demonstrating virtual cursor control',
        confidence: 'established',
        falsifiability: 'Showing that decoding performance is fully explained by noise correlations rather than structured manifold activity would challenge this.',
    },
    {
        id: 'parametric-proxy',
        statement: 'This playground uses analytic parametric formulas rather than real neural data, so metric values are qualitative proxies, not quantitative predictions.',
        citation: 'Model design choice \u2014 prioritizes pedagogical clarity over empirical fidelity',
        confidence: 'speculative',
        falsifiability: 'Replacing parametric formulas with actual neural data would test whether qualitative conclusions hold.',
    },
];
