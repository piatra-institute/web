import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'cell-as-network',
        statement:
            'each grid cell carries its own small feedforward network that reads the states of its eight Moore neighbours and outputs a new activation vector. the first output channel, thresholded at 0.5, becomes the next discrete state. the update is local, identical in form across cells, and applied synchronously.',
        citation:
            'Mordvintsev et al. 2020, "Growing Neural Cellular Automata" (Distill): a per-cell neural update rule is the core construction of a neural CA.',
        confidence: 'established',
        falsifiability:
            'if cells could only realise the rule by reading non-local information or a global clock beyond the synchronous sweep, the local-network framing would be wrong for this model.',
    },
    {
        id: 'discrete-binary-state',
        statement:
            'the externally visible cell state is binary (alive or dead) via a hard 0.5 threshold on the first output channel, even though the internal activations are continuous. this keeps the automaton in the classical discrete-CA regime rather than a continuous Lenia-style field.',
        citation:
            'classical cellular automata (von Neumann; Wolfram, A New Kind of Science 2002) use discrete states; Mordvintsev-style growing CA instead keep state continuous.',
        confidence: 'contested',
        falsifiability:
            'continuous-state neural CA (the original Growing NCA) demonstrably regenerate fine images; a hard binary threshold discards that information, so any task needing graded state would expose this choice as limiting.',
    },
    {
        id: 'local-learning-not-backprop',
        statement:
            'weights change through a local Hebbian rule (delta = rate * output * input) with magnitude clipping, not through gradient descent on a target image. the automaton self-organises rather than being trained to reproduce a goal pattern.',
        citation:
            'Hebb 1949, The Organization of Behavior; contrasted with Mordvintsev 2020, where the per-cell network is trained end-to-end by backpropagation-through-time.',
        confidence: 'contested',
        falsifiability:
            'Hebbian-only updates have no explicit objective, so they need not converge to any useful or stable morphology; if the grid never settles or never forms structure across activation choices, the "learning produces order" reading fails.',
    },
    {
        id: 'moore-toroidal',
        statement:
            'the neighbourhood is the nine-cell Moore block (centre plus eight surrounding cells) on a toroidal grid with wrap-around indexing, so there are no boundaries and every cell has exactly eight neighbours.',
        citation:
            'standard Moore neighbourhood and periodic boundary conditions used throughout CA practice (Wolfram 2002; Conway\'s Life on a torus).',
        confidence: 'established',
        falsifiability:
            'a fixed or reflecting boundary would give edge cells fewer neighbours and break the translational symmetry assumed here; observed edge artefacts would indicate the toroidal assumption was violated.',
    },
    {
        id: 'synchronous-deterministic-core',
        statement:
            'aside from random initial weights and an occasional random mutation mask, the per-step update is deterministic: the same neighbour states and weights always yield the same activation, the same threshold, and the same complexity density. the calibration panel checks exactly this deterministic core.',
        citation:
            'determinism of the affine-plus-nonlinearity forward pass; only initialisation and mutation draw on Math.random in the implementation.',
        confidence: 'established',
        falsifiability:
            'if identical inputs and weights produced different outputs, the forward pass would be non-deterministic and the zero-error calibration cases would not reproduce.',
    },
    {
        id: 'fitness-is-descriptive',
        statement:
            'the reported fitness (complexity, stability, oscillation, or diversity) is a descriptive readout of the current grid, not an optimisation target. nothing in the dynamics is driven to maximise it; selection pressure is a label, not an implemented evolutionary loop over a population.',
        citation:
            'modelling choice in this implementation; contrast with genetic-algorithm CA search (Mitchell, Crutchfield, Das 1996) where fitness genuinely drives selection.',
        confidence: 'contested',
        falsifiability:
            'if a user expects raising "selection pressure" to evolve higher-fitness rules, they will see no such trend, because no population-level selection is implemented; that mismatch falsifies an evolutionary reading.',
    },
    {
        id: 'morphogenesis-analogy',
        statement:
            'the morphogenesis framing (local rules growing global form, robustness, self-repair) is an analogy to biological development, not a claim about real tissue. the model shares the structural idea of distributed local computation producing global pattern.',
        citation:
            'Turing 1952 on morphogenesis; Mordvintsev 2020 explicitly frames growing CA as a model of self-organisation and regeneration.',
        confidence: 'speculative',
        falsifiability:
            'the model omits chemistry, mechanics, and gene regulation; any developmental phenomenon that depends on those and cannot be expressed as a local neighbour-to-state map lies outside what this analogy can claim.',
    },
    {
        id: 'single-run-sandbox',
        statement:
            'the canvas shows a single stochastic run on one grid with one random weight initialisation. it is a transparent sandbox for exploring neural-CA dynamics, not an ensemble result or a validated simulator of any specific system.',
        citation:
            'modelling choice; quantitative claims about neural CA require many seeds and controlled comparisons.',
        confidence: 'established',
        falsifiability:
            'any statistical claim drawn from one run would not survive re-seeding; only the qualitative behaviour and the deterministic calibration core are robust here.',
    },
];
