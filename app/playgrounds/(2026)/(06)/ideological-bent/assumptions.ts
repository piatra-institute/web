import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'instrument-not-verdict',
        statement:
            'the playground measures the internal consistency of your counterfactual reasoning, not who is right. it is symmetric: it flags both "the other side would obviously do the same" and "my side would never do that" as distortions of equal kind.',
        citation:
            'the anti-propaganda framing of the ideation: make identity pay rent by forcing probabilities, mechanisms, and the same standard across actor swaps.',
        confidence: 'established',
        falsifiability:
            'if the diagnostics rewarded one political direction over the other for the same numeric forecast, the instrument would be biased; the metrics depend only on the distributions, not on which actor is which.',
    },
    {
        id: 'baseline-is-placeholder',
        statement:
            'the baseline probabilities are editable placeholders for interface design, not calibrated forecasts. they encode a plausible prior and an assumption-to-outcome weighting, both hand-set.',
        citation:
            'stated directly in the prototype: "replace them with calibrated forecaster pools, historical analogues, and transparent expert priors" for a serious version.',
        confidence: 'speculative',
        falsifiability:
            'a calibrated forecaster pool would shift the baseline bars; your own deviation from baseline (the Bent Score) would change accordingly, but the structure of the diagnostic would not.',
    },
    {
        id: 'softmax-logit-form',
        statement:
            'the baseline is a softmax over log-priors shifted linearly by assumption sliders: score = log(prior) + sum_a w[outcome][a] * (assumption_a - default_a). this is a multinomial-logit causal forecast, a modelling choice.',
        citation:
            'standard discrete-choice / logit forecasting; the weights are hand-tuned for legibility.',
        confidence: 'contested',
        falsifiability:
            'a real structural causal model with interactions and non-linear thresholds would replace the linear logit shift; large assumption changes could then move outcomes non-monotonically.',
    },
    {
        id: 'counterfactuals-not-verifiable',
        statement:
            'counterfactuals (what the other administration would have done) are not directly observable, so the tool never scores them as true or false. it scores reasoning habits: consistency under actor swap, evidence sensitivity, and admissibility.',
        citation:
            'Pearl on counterfactuals and do-interventions; the ideation: "counterfactuals are not directly verifiable, but counterfactual reasoning habits are measurable".',
        confidence: 'established',
        falsifiability:
            'only the resolvable forecasts (real future events) can be scored with proper scoring rules; the counterfactual branches are scored indirectly via consistency, by design.',
    },
    {
        id: 'brittleness-as-js',
        statement:
            'ideological brittleness is the Jensen-Shannon distance between your two actor forecasts minus the same distance for the baseline model. positive means you separate the actors more than the facts warrant; negative means you flatten a real difference.',
        citation:
            'the ideation\'s preferred metric (IB = JS(user A, user B) - JS(model A, model B)); JS divergence is a bounded, symmetric distance between distributions.',
        confidence: 'contested',
        falsifiability:
            'a different divergence (KL, total variation) would rescale the number; the sign and ordering across users are what the metric is meant to capture.',
    },
    {
        id: 'identity-dominance',
        statement:
            'the Identity Dominance Ratio compares how much the actor label moves your forecast (label sensitivity) to how much the facts move the model (fact sensitivity). above 1 means the party label is doing more work than a large change in the evidence.',
        citation:
            'IDR = label sensitivity / (fact sensitivity + epsilon) from the ideation; fact sensitivity is measured on the baseline model across low and high assumption extremes.',
        confidence: 'contested',
        falsifiability:
            'fact sensitivity here is the model\'s, not yours, because you only submit one forecast per actor; asking you to forecast at several assumption sets would let the ratio use your own fact sensitivity instead.',
    },
    {
        id: 'rational-vs-motivated',
        statement:
            'two people disagreeing is not automatically irrational. the tool exposes assumptions explicitly so rational disagreement (different priors or causal assumptions) is separated from motivated distortion (same facts, same stated assumptions, identity-driven gap).',
        citation:
            'Jern, Chang, and Kemp on Bayesian belief polarization; the playground asks for q(y | actor, scenario, assumption set), not just q(y | actor).',
        confidence: 'established',
        falsifiability:
            'if a high Bent Score persisted even after the user matched assumptions and priors across the swap, that residue is the motivated component the tool is trying to isolate.',
    },
    {
        id: 'motivated-skepticism',
        statement:
            'the pathology being probed is real: people rate attitude-congruent arguments as stronger, counterargue hostile evidence, and polarize most when they hold strong priors and high sophistication.',
        citation:
            'Taber and Lodge, Motivated Skepticism in the Evaluation of Political Beliefs (AJPS 2006).',
        confidence: 'established',
        falsifiability:
            'the empirical claim is about populations; the tool does not diagnose an individual clinically, it only quantifies one forecast\'s internal structure.',
    },
    {
        id: 'scenarios-illustrative',
        statement:
            'the two scenarios are illustrative test cases for reasoning, not endorsements, predictions, or factual claims about any real person or administration. actors are shown as A and B and can be blinded entirely.',
        citation:
            'modelling choice. the scenarios exist to give the diagnostics something concrete to measure; the blind-label mode removes party cues so facts lead.',
        confidence: 'established',
        falsifiability:
            'swapping the scenario content for any other "same facts, different actor" case would leave every metric definition unchanged; the content is interchangeable.',
    },
];
