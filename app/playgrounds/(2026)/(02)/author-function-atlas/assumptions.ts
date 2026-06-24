import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'author-as-function',
        statement:
            'the author is treated as a function of discourse rather than a person: a classificatory device that groups texts, confers authority, and restricts interpretation. the model never represents a writer, only the name-token a_name as a circulating attribute of a phrase.',
        citation:
            'Foucault, "What Is an Author?" (1969): the author-function as a mode of existence and circulation of discourse, not a biographical individual.',
        confidence: 'contested',
        falsifiability:
            'if attribution behaviour in real corpora tracked verified biography far more than circulating brand-value, the function framing would be the weaker description and the name-token would be redundant.',
    },
    {
        id: 'cliche-as-logistic-composite',
        statement:
            'a phrase is more cliche when it is widely circulated, dispersed across channels, unsurprising, context-free, and mutable. the cliche index folds these into one logistic score C = sigmoid(1.1 ln(f+1) + 0.8 disp - 0.55 surp - delta ret + 0.7 mut) with delta = 1.',
        citation:
            'composite indicator built from information-theoretic surprisal (Shannon) and circulation/dispersion intuitions; the specific weights are a modelling choice, not a measured fit.',
        confidence: 'speculative',
        falsifiability:
            'the five weights are hand-set; a corpus where surprisal and retention failed to predict perceived cliche-ness would falsify this particular weighting, even if the qualitative direction held.',
    },
    {
        id: 'entanglement-surplus',
        statement:
            'attribution drift is captured by the entanglement surplus E = a_name - a_src: the gap between how much legitimation the name does and how much the source actually supports. positive E marks a name circulating as a brand-token detached from citation.',
        citation:
            'misattribution and "context collapse" in networked circulation (boyd / Marwick on collapsed audiences; the broad "fake quotes" literature on Einstein, Twain, and Mandela).',
        confidence: 'contested',
        falsifiability:
            'if measured name-prestige and measured source-verifiability moved together in real circulation, the surplus would stay near zero and the entanglement story would have no signal to explain.',
    },
    {
        id: 'replicator-mutator',
        statement:
            'the population evolves by a replicator-mutator rule: each variant grows like exp(0.22 (fitness - mean fitness)), is renormalised to constant mean frequency, and occasionally spawns perturbed paraphrase-children. fitness rewards portability, generality, brevity, and name-prestige.',
        citation:
            'replicator-mutator dynamics from evolutionary game theory and quasispecies theory (Nowak; Eigen and Schuster), applied here to cultural variants rather than genotypes.',
        confidence: 'contested',
        falsifiability:
            'cultural transmission is biased, networked, and conformist in ways a mean-field replicator ignores; if observed quote spread were dominated by network structure the well-mixed equation would mispredict which variants win.',
    },
    {
        id: 'cliche-attractor-drift',
        statement:
            'over time the population drifts toward the lower-left of the specificity-circulation landscape: general, highly circulated, context-collapsed slogans carrying a prestigious name. the step rule pushes specificity, surprisal, retention, and source-verifiability down while name-prestige rises with frequency.',
        citation:
            'qualitative attractor reading of the step dynamics in logic/stepPopulation; consistent with the "memes converge to portable slogans" intuition.',
        confidence: 'speculative',
        falsifiability:
            'this is an observed tendency of the toy, not a proven fixed point; a parameter regime (low context-collapse, high brevity-penalty) where the cloud does not converge would bound the claim, and the live run can be steered there.',
    },
    {
        id: 'synthetic-corpus',
        statement:
            'the atlas is a synthetic sandbox. variants are seeded from a handful of canonical phrase fragments per author with filler padding, not from real quote corpora, and every trait is normalised to [0, 1] so only relative dynamics carry meaning.',
        citation:
            'modelling choice; the seed phrases in logic/SEEDS are illustrative stubs, and absolute trait values are arbitrary by construction.',
        confidence: 'established',
        falsifiability:
            'no quantitative claim about any real author survives the synthetic seeding; reproducing a measured attribution-drift curve would require a real corpus, tokenisation, and fitted weights this toy does not have.',
    },
];
