import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'instrument-not-verdict',
        statement:
            'the playground measures conditional misalignment under an explicit set of assumptions, not who is right or who is "clueless". it is a hypothesis-generating sandbox: change the assumptions and the answer changes.',
        citation:
            'the ideation\'s framing: "treat political autoimmunity as a hypothesis-generating framework, not a settled accusation"; never label a group irrational.',
        confidence: 'established',
        falsifiability:
            'if the score were stable across all interest models and slider ranges it would be a verdict; the whole point of the sensitivity view is that the ranking is assumption-sensitive.',
    },
    {
        id: 'synthetic-inputs',
        statement:
            'every exposure, dependence, hostility, implementation, magnitude, salience, and awareness number is a synthetic demonstration value, not an empirical estimate. they are taken from the ideation\'s worked example to show how the model behaves.',
        citation:
            'ideation P1: "these are synthetic demonstration values, not empirical estimates"; a serious version would draw on CES/ANES/Pew/AP VoteCast and a coded policy matrix.',
        confidence: 'speculative',
        falsifiability:
            'replacing the synthetic cells with survey-derived exposure and a human-coded candidate-policy matrix would shift every number; the formula would be unchanged.',
    },
    {
        id: 'multiplicative-risk',
        statement:
            'per-domain adverse risk is the product exposure · dependence · hostility · implementation · magnitude, then multiplied by awareness and salience. multiplication means any single near-zero factor collapses the risk.',
        citation:
            'ideation F1-F2: R = E·D·H·P·M, foreseeable = R·awareness, priority = R·awareness·salience.',
        confidence: 'contested',
        falsifiability:
            'an additive or saturating combination would let a high single factor dominate without the others; the multiplicative form is a strong assumption about how the factors interact.',
    },
    {
        id: 'plural-interest',
        statement:
            'there is no single true interest. the model exposes competing interest functions (rights, material, expressive, protest, institutional, balanced) as weight profiles over domain kinds, and the case ranking changes across them.',
        citation:
            'ideation section G: material, rights-dependence, subjective, expressive/status, coalition-entry, punitive-protest, and long-run institutional models.',
        confidence: 'established',
        falsifiability:
            'falsifiable hypothesis H10: if rankings stayed invariant across interest functions, the plural-interest claim would add nothing.',
    },
    {
        id: 'net-vs-gross',
        statement:
            'gross risk is raw priority risk; net autoimmunity subtracts a protective benefit and a tolerance τ and applies the interest weights. a vote can be gross-contradictory yet net-aligned once benefits and other priorities are counted.',
        citation:
            'ideation F3-F4: Autoimmunity = V · Σ W · max(0, priorityRisk − benefit − τ); gross vs net contradiction.',
        confidence: 'contested',
        falsifiability:
            'the tolerance and the benefit coding are modelling choices; raising τ enough zeroes the score, which is why τ is a visible, sweepable slider.',
    },
    {
        id: 'expressive-as-utility',
        statement:
            'the expressive / status and protest interest models treat symbolic belonging and punishment as real utility, so apparent self-harm can dissolve. this is the strongest non-moralizing counterweight in the model.',
        citation:
            'Brennan and Lomasky, Democracy and Decision (1993): the expressive theory of voting; a single vote\'s low decisiveness makes non-instrumental motives weigh heavily.',
        confidence: 'contested',
        falsifiability:
            'if expressive motives were measured and found not to predict the vote once material and rights interests are controlled, the expressive reframing would lose force.',
    },
    {
        id: 'counterfactuals-and-regret',
        statement:
            'the disillusionment proxy (prior support minus later approval) is a regret signal, not proof of regret. approval can move for many reasons unrelated to the modelled policy harm.',
        citation:
            'ideation L: RegretSignal = PriorSupport − LaterApproval, then adjusted for economy, media, scandal, and timing.',
        confidence: 'contested',
        falsifiability:
            'falsifiable hypothesis H11: forecastable policy hostility should predict later subgroup approval decline after implementation, controlling for the economy and scandals.',
    },
    {
        id: 'uncertainty-is-illustrative',
        statement:
            'the 90% interval comes from a seeded Monte Carlo that perturbs every cell with a Beta around its value. it shows how fragile a point estimate is, not a real posterior over empirical data.',
        citation:
            'ideation F5: draw each variable from a distribution, propagate to the score, report median and intervals.',
        confidence: 'speculative',
        falsifiability:
            'with real data each variable would carry a measured uncertainty; here the concentration is a fixed constant, so the interval width is a design choice, not an estimate.',
    },
    {
        id: 'groups-are-heterogeneous',
        statement:
            'a group label (LGBTQ, Muslim, Latino voters) is not a monolith; the cases are coarse illustrations. the large heterogeneous bloc deliberately carries lower per-supporter risk but a higher population-weighted score.',
        citation:
            'ideation ethical safeguards and case-study matrix: always show subgroup splits; "Latino" spans citizens, generations, religions, and regions with different exposure.',
        confidence: 'established',
        falsifiability:
            'falsifiable hypothesis H14: intersectional subgroup models should reduce false positives relative to broad-group models; if they identified the same cases with the same confidence, the heterogeneity caveat would be moot.',
    },
    {
        id: 'coalition-is-generic',
        statement:
            'the coalition is a generic object coded hostile on the listed domains, not a named person. the instrument is symmetric: it applies to any group-coalition pairing on either side of politics.',
        citation:
            'modelling and ethics choice, following the ideation\'s safeguard against "producing a propaganda tool rather than a research tool".',
        confidence: 'established',
        falsifiability:
            'swapping the coalition\'s hostility coding for a protective coding would turn the net score negative (alignment), with no change to the engine.',
    },
];
