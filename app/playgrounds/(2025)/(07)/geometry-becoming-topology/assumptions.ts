import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'metric-vs-topology',
        statement:
            'the same set of points carries two kinds of structure: a metric (exact distances between points) and a topology (what is connected and how many independent loops). geometry is coordinate-dependent; topology is not.',
        citation:
            'the basic distinction between metric geometry and topology.',
        confidence: 'established',
        falsifiability:
            'moving a point changes distances but not the connection pattern; the calibration shows the metric value varies while the invariants do not.',
    },
    {
        id: 'betti-numbers',
        statement:
            'topology is summarized by Betti numbers computed from the graph: b0 is the number of connected components, and b1 is the cycle rank E - V + components, counting independent loops. these are exact integer invariants.',
        citation:
            'simplicial / graph homology; Betti numbers of a 1-complex.',
        confidence: 'established',
        falsifiability:
            'the calibration checks b0, b1, and the Euler characteristic on graphs with known topology; a deviation would be an implementation error.',
    },
    {
        id: 'deformation-invariance',
        statement:
            'the invariants are unchanged by any continuous deformation that preserves the connections. you can stretch, bend, or rearrange the points and the loop count and component count stay fixed.',
        citation:
            'topological invariance under homeomorphism (here, graph isomorphism preserving adjacency).',
        confidence: 'established',
        falsifiability:
            'adding or cutting an edge changes the invariants; merely moving points does not, which is exactly the metric-versus-topology contrast.',
    },
    {
        id: 'graph-not-surface',
        statement:
            'the model works with a graph (a 1-dimensional complex), so its Euler characteristic is V - E and its loops are graph cycles. this is the discrete cousin of surface topology (genus, chi = 2 - 2g), not a full surface mesh.',
        citation:
            'graph homology as a 1-complex; surfaces require a 2-complex.',
        confidence: 'contested',
        falsifiability:
            'claims about surface genus would need faces (a 2-complex); the playground illustrates the idea on graphs, where only b0 and b1 are defined.',
    },
    {
        id: 'exotic-spheres-aside',
        statement:
            'the interface mentions Milnor\'s exotic spheres as a deeper case where smooth structure outruns topology. that is an illustrative aside, not something this 2D graph model computes.',
        citation:
            'Milnor (1956) on exotic 7-spheres; mentioned for context only.',
        confidence: 'speculative',
        falsifiability:
            'exotic smooth structures are a high-dimensional phenomenon the playground does not and cannot demonstrate.',
    },
    {
        id: 'illustrative-sandbox',
        statement:
            'the playground is a hands-on illustration of how moving from "how far" to "what is connected" discards geometry and keeps topology. it is pedagogical, not a research tool.',
        citation:
            'stated scope; an educational topology sandbox.',
        confidence: 'established',
        falsifiability:
            'the exact content is the invariant computation; the broader geometry-to-topology narrative is interpretive framing.',
    },
];
