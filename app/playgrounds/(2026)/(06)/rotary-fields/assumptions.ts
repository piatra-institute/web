import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'rope-formal',
        statement:
            'RoPE is implemented as in Su et al. 2021: queries and keys are grouped into 2D pairs, each pair is rotated by an angle θ = p · ω_m where p is the token position and ω_m = 1 / base^(2m / d) is the per-pair frequency, with d = 2 · pairs.',
        citation:
            'Su et al. 2021, RoFormer: Enhanced Transformer with Rotary Position Embedding.',
        confidence: 'established',
        falsifiability:
            'a re-derivation that produces a different rotation formula or a different frequency ladder would falsify this. the formula matches the original paper and standard implementations.',
    },
    {
        id: 'relative-invariance',
        statement:
            'after rotation, the dot product q_i · k_j depends on j − i, not on i and j separately. this is the formal property RoPE is built to give.',
        citation:
            'standard derivation: R(i)ᵀR(j) = R(j − i), so score(i, j) = q_i · R(j − i) · k_j.',
        confidence: 'established',
        falsifiability:
            'if our content vectors were position-independent, drift would be exactly zero. the playground measures a small drift because each token gets its own random q and k, which ties some structure to absolute position.',
    },
    {
        id: 'random-content-vectors',
        statement:
            'each token position is assigned a unit-norm random query vector, and a key vector that shares a controlled amount of similarity with the query. content vectors do not encode meaning.',
        citation:
            'modelling commitment. real transformer content depends on the token embeddings and prior layers; this playground only models the rotation step.',
        confidence: 'speculative',
        falsifiability:
            'a real transformer trace would replace these with actual query and key vectors from a trained model. the qualitative behaviour (locality with small base, dispersion with large base) is robust to that swap.',
    },
    {
        id: 'attention-without-softmax',
        statement:
            'the attention score shown is the raw rotated dot product, not the softmax-normalised attention weight.',
        citation:
            'pedagogical choice: showing the raw score makes the relative-position effect visible. softmax would compress and bias toward the maximum row score.',
        confidence: 'established',
        falsifiability:
            'this is a feature, not a hypothesis. a softmax overlay would be a useful next iteration.',
    },
    {
        id: 'phase-precession-real',
        statement:
            'hippocampal place cells exhibit theta phase precession: spike timing advances within the theta cycle as the animal moves through the place field, by approximately 360 degrees across the field.',
        citation:
            'O\'Keefe and Recce 1993, Nature; replicated extensively since.',
        confidence: 'established',
        falsifiability:
            'a careful replication that failed to find phase advance would falsify this. modern replications confirm it across species.',
    },
    {
        id: 'grid-oscillatory-interference',
        statement:
            'one plausible mechanism for grid-cell firing is oscillatory interference among inputs at different phases. the toy here uses three oscillations at 60° offsets to produce a hexagonal-ish pattern.',
        citation:
            'Burgess et al. 2007, oscillatory interference model. competing continuous-attractor models also exist.',
        confidence: 'contested',
        falsifiability:
            'recent evidence favours attractor-network models over pure interference. the playground is using interference because it shows the phase-encoded position story most cleanly.',
    },
    {
        id: 'analogy-not-implementation',
        statement:
            'neurons do not implement RoPE. the analogy is structural: both systems encode position as an angle, and both let relative position be recovered from a phase or rotation difference.',
        citation:
            'the position-of-this-playground.',
        confidence: 'established',
        falsifiability:
            'a discovery that cortical neurons explicitly compute rotation matrices on stored vectors would update this. no such evidence exists.',
    },
    {
        id: 'concentration-as-metric',
        statement:
            'the calibrated metric is attention concentration: (mean nearby score − mean score) / (peak score − mean score), clamped to [0, 1]. it summarises how much the rotated attention prefers nearby positions over a uniform baseline.',
        citation:
            'a modelling choice. there are many alternative concentration metrics (entropy, kurtosis); this one is monotone in the locality-vs-dispersion axis we care about.',
        confidence: 'speculative',
        falsifiability:
            'a different concentration metric (e.g. row-entropy) might rank the presets differently. the qualitative ordering should be robust.',
    },
    {
        id: 'deterministic-rng',
        statement:
            'the simulation is deterministic given (params, seed): the rng is seeded. randomising the q, k vectors changes the seed and produces a fresh sample from the random-content distribution.',
        citation:
            'modelling commitment, matches the audience-attractor and family-threshold sibling playgrounds.',
        confidence: 'established',
        falsifiability:
            'this is a feature, not a hypothesis.',
    },
    {
        id: 'no-multi-head-no-layers',
        statement:
            'the playground models one head, one layer, no softmax, no value projection. it is a sketch of the position-rotation step, not of full attention.',
        citation:
            'modelling commitment. full attention adds multi-head averaging, softmax normalisation, and value-vector composition, none of which change the relative-position story.',
        confidence: 'established',
        falsifiability:
            'a future iteration could add softmax and value projection without changing the rotation analysis.',
    },
];
