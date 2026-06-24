import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'two-axis-reduction',
        statement:
            'every action can be placed on two real-valued axes: gain to self and gain to others. The sign pair fully determines which of Cipolla\'s four behavioural types the action belongs to.',
        citation:
            'Cipolla, The Basic Laws of Human Stupidity (1976): the central diagram is exactly this two-axis plane.',
        confidence: 'contested',
        falsifiability:
            'an action whose value to self or others is genuinely incommensurable, or context dependent in a way no single number captures, would break the reduction.',
    },
    {
        id: 'stupidity-is-quadrant-not-trait',
        statement:
            'stupidity is a property of an action (it lands in the harm-self and harm-others quadrant), not a fixed property of a person. The same individual can produce intelligent, helpless, bandit, or stupid acts on different occasions.',
        citation:
            'Cipolla: a stupid person is one who causes losses to others while deriving no gain, framed behaviourally rather than as an IQ measure.',
        confidence: 'contested',
        falsifiability:
            'if the quadrant a person occupies were perfectly stable across all situations, the trait view would beat the per-action view used here.',
    },
    {
        id: 'closed-positive-boundary',
        statement:
            'the boundaries are assigned by the convention gain >= 0 counts as non-harmful, so the axes are closed on the positive side and a point exactly on an axis is read as the more charitable type.',
        citation:
            'a modelling choice; Cipolla draws open quadrants and does not specify the zero line, so a convention is required to make classify total.',
        confidence: 'established',
        falsifiability:
            'this only affects measure-zero points exactly on an axis; any consistent tie-breaking rule classifies the interior of each quadrant identically.',
    },
    {
        id: 'net-welfare-diagonal',
        statement:
            'the diagonal gain-to-self plus gain-to-others equals zero (the P-O-M line) is a meaningful refinement: it splits helpless and bandit actions into net-positive and net-negative variants by total welfare.',
        citation:
            'follows Cipolla\'s own remark that the bandit who takes exactly what the victim loses sits on the diagonal, with perfect bandits above and destructive ones below.',
        confidence: 'contested',
        falsifiability:
            'this assumes self-gain and other-gain are measured in the same comparable units so they can be summed; if the units are not commensurable the diagonal has no welfare meaning.',
    },
    {
        id: 'macro-to-quadrant-map',
        statement:
            'national macro indicators (GDP, inequality, corruption, trust, unemployment, education) shift the share of a population that acts in each quadrant, via latent factors of prosperity, institutions, inequality, and stress.',
        citation:
            'a pedagogical structural model inspired by social-capital and institutional-trust literature; the coefficients are interpretable but not fitted.',
        confidence: 'speculative',
        falsifiability:
            'no cross-country dataset measures Cipolla coordinates directly, so the macro-to-distribution mapping is untested; it is a scaffold, not a validated prediction.',
    },
    {
        id: 'mixture-sampling-honest',
        statement:
            'the population is drawn from a four-component bivariate normal mixture, with each component reflected into its quadrant, so the visible cloud is stochastic and reseeding changes it; only the classifier overlaid on the cloud is deterministic.',
        citation:
            'standard Gaussian-mixture sampling; quadrant membership is enforced by reflecting the absolute value onto the component\'s sign.',
        confidence: 'established',
        falsifiability:
            'reflection distorts the true tail shape near the axes, so the sampled density is an approximation; the calibration deliberately tests the classifier, not the sampler.',
    },
];
