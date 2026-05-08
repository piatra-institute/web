import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'morality-relational',
        statement:
            'Morality is not a substance located in any single node, it is a constraint structure on which transitions through a multi-scale graph are allowed, repaired, or forbidden.',
        citation: 'Synthesised across Mackie, 1977, Ethics; Korsgaard, 1996, The Sources of Normativity; Anderson, 1999, What Is the Point of Equality?',
        confidence: 'contested',
        falsifiability:
            'Demonstrating a coherent account of moral facts that does not reduce to relational constraints over agents, harms, and reciprocity.',
    },
    {
        id: 'dopamine-rpe',
        statement:
            'Dopamine signals a reward prediction error rather than carrying valence directly; moral valuation enters only when the prediction graph includes others\' suffering, reputation, and identity.',
        citation: 'Schultz, Dayan & Montague, 1997, A neural substrate of prediction and reward; Schultz, 1998, Predictive reward signal of dopamine neurons',
        confidence: 'established',
        falsifiability:
            'Single-unit recordings showing dopamine neurons that respond directly to moral content independent of prediction error.',
    },
    {
        id: 'crockett-harm',
        statement:
            'Healthy adults require more compensation to inflict pain on a stranger than on themselves, others\' suffering enters the valuation graph rather than being abstract.',
        citation: 'Crockett, Kurth-Nelson, Siegel, Dayan & Dolan, 2014 PNAS, Harm to others outweighs harm to self in moral decision making',
        confidence: 'established',
        falsifiability:
            'Replications failing to show the asymmetry in normal populations under controlled experimental design.',
    },
    {
        id: 'serotonin-harm-aversion',
        statement:
            'Serotonergic and dopaminergic manipulation dissociably tune harm aversion: citalopram increases it, levodopa reduces it. Morality is partly implemented through neurochemical tuning of graph traversal.',
        citation: 'Crockett et al., 2015 Current Biology, Dissociable effects of serotonin and dopamine on the valuation of harm in moral decision making',
        confidence: 'established',
        falsifiability:
            'Failure to replicate the dissociation in larger samples, or evidence that the effects are confounded with affect rather than valuation.',
    },
    {
        id: 'causal-emergence',
        statement:
            'Macro-level constructs (betrayal, debt, marriage, crime) can carry more effective causal information than their microscopic substrate, top-down causation is a real explanatory move, not a placeholder.',
        citation: 'Hoel, Albantakis & Tononi, 2013 PNAS, Quantifying causal emergence shows that macro can beat micro',
        confidence: 'contested',
        falsifiability:
            'Showing that effective information at macro scales can always be reduced to micro-state predictability without remainder.',
    },
    {
        id: 'sheaf-obstruction',
        statement:
            'When local moral frames (medical, military, kin, legal, market) assign incompatible ratings to the same action, the obstruction has a topological structure: a sheaf with nontrivial cohomology, where the consistency radius is positive.',
        citation: 'Robinson, 2018 arXiv:1805.08927, Assignments to Sheaves of Pseudometric Spaces; Hansen & Ghrist, 2019, Toward a Spectral Theory of Cellular Sheaves',
        confidence: 'speculative',
        falsifiability:
            'A representative survey of moral disagreement showing that local frames always glue consistently when context is fully specified.',
    },
    {
        id: 'viability-weighting',
        statement:
            'The weighted aggregation 0.22·trust + 0.24·agency + 0.22·(100−harm) + 0.12·repair + 0.14·(100−domination) + 0.06·ecology is a heuristic, not a utilitarian welfare function. The weights encode what to look for, not how the world is.',
        citation: 'Modelling choice; not derived from any axiomatised welfare theory',
        confidence: 'speculative',
        falsifiability:
            'Empirical case studies where the playground regime label diverges from broad-coalition human judgment of the case.',
    },
    {
        id: 'irreversibility',
        statement:
            'Some moral harms are partially irreversible, harm and domination accumulate faster than repair recovers, mirroring hysteresis in the underlying graph.',
        citation: 'Strawson, 1962, Freedom and Resentment; everyday observation of trust dynamics',
        confidence: 'established',
        falsifiability:
            'Showing in controlled longitudinal studies that fully-symmetric linear repair restores all damaged moral edges.',
    },
    {
        id: 'frames-stipulated',
        statement:
            'The five moral frames (medical, military, kin, legal, market) are stylised stand-ins for distinct value clusters. Real moral disagreement involves more frames, with internal heterogeneity, and historical contingency.',
        citation: 'Walzer, 1983, Spheres of Justice; MacIntyre, 1981, After Virtue',
        confidence: 'established',
        falsifiability:
            'Not empirically falsifiable as written, but the frames\' rating functions are stipulated and could be wrong on specific cases.',
    },
    {
        id: 'hypergraph-non-pairwise',
        statement:
            'Some morally significant actions (bribery, climate damage, truth-telling) are inherently non-pairwise: one act simultaneously affects three or more nodes (agent, institution, commons, observer). Reducing them to chains of binary edges discards information.',
        citation: 'Battiston et al., 2020 Physics Reports, Networks beyond pairwise interactions',
        confidence: 'established',
        falsifiability:
            'Demonstrating that all morally significant interactions admit a faithful binary-edge representation that preserves their causal effects.',
    },
];
