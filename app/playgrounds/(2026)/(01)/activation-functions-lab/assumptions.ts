import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'exact-closed-forms',
        statement:
            'every built-in activation is its exact closed form. ReLU(x) = max(0, x), sigmoid(x) = 1/(1 + e^(-x)), tanh, GELU, Swish, ELU and the rest are evaluated directly from their published definitions, with no fitted constants beyond the documented ones (for example the 0.044715 cubic term in the tanh GELU approximation).',
        citation:
            'standard definitions: Nair and Hinton 2010 (ReLU); Hendrycks and Gimpel 2016 (GELU); Ramachandran et al. 2017 (Swish); Clevert et al. 2015 (ELU).',
        confidence: 'established',
        falsifiability:
            'evaluating any function at a known point would expose an error; sigmoid(0) must equal 0.5, tanh(0) must equal 0, ReLU(-3) must equal 0. the calibration panel checks exactly these.',
    },
    {
        id: 'derivatives-are-numeric',
        statement:
            'derivatives shown alongside each curve are central finite differences, not analytic gradients. for smooth functions this matches the true derivative to several digits; sigmoid prime at the origin recovers 0.25 to floating-point precision.',
        citation:
            'central difference (f(x + h) - f(x - h)) / 2h has error O(h^2); standard numerical analysis.',
        confidence: 'established',
        falsifiability:
            'at a kink such as ReLU at x = 0 the finite difference reports a blended slope, not the undefined point derivative; a function with discontinuous output would yield a spurious spike.',
    },
    {
        id: 'one-dimensional-view',
        statement:
            'each activation is plotted as a scalar map from one real input to one real output. softmax, which is genuinely multivariate, is shown only in its two-class reduction (Softmax1D), which coincides with the logistic sigmoid.',
        citation:
            'softmax over two logits z and 0 reduces to sigmoid(z); a familiar identity in classification.',
        confidence: 'established',
        falsifiability:
            'the true multi-class softmax couples all outputs through a shared denominator; the scalar view cannot show that coupling, so any claim about cross-class competition is outside this model.',
    },
    {
        id: 'parameters-fixed-for-display',
        statement:
            'parametric activations are drawn at fixed, representative parameter values (for example LeakyReLU at its default negative slope, Swish at beta = 1). learnable parameters in a trained network would drift away from these defaults.',
        citation:
            'PReLU (He et al. 2015) and Swish-beta (Ramachandran et al. 2017) learn their parameters during training.',
        confidence: 'contested',
        falsifiability:
            'a network may converge on slopes or gates that make a curve here unrepresentative; the displayed shape is illustrative, not the shape any particular trained model uses.',
    },
    {
        id: 'no-best-activation',
        statement:
            'the lab presents activations side by side without ranking them. the diagnostics (dead fraction, saturation, Lipschitz estimate) describe shape, they do not declare a winner. which activation trains best is task, architecture, and initialisation dependent.',
        citation:
            'Ramachandran et al. 2017 found Swish helps on some benchmarks; later work shows GELU, ReLU, and Swish are often within noise of each other depending on setup.',
        confidence: 'contested',
        falsifiability:
            'a controlled benchmark might show one activation dominating for a fixed task; the claim of no universal best is an empirical generalisation that a strong counterexample would narrow.',
    },
    {
        id: 'gradient-flow-heuristics',
        statement:
            'the vanishing-gradient story attached to saturating functions (sigmoid, tanh) is a heuristic about derivative magnitude, not a guarantee about training. ReLU mitigates saturation but introduces dead units; the trade-off is real but its severity depends on depth, normalisation, and residual connections.',
        citation:
            'Glorot and Bengio 2010 on saturation and signal propagation; He et al. 2015 on rectifier initialisation; modern residual and normalisation layers change the picture.',
        confidence: 'contested',
        falsifiability:
            'a deep sigmoid network with careful normalisation can still train; conversely a ReLU network can suffer dead units. the heuristic predicts tendencies, not outcomes for a given run.',
    },
];
