import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'precision-weighting',
        statement:
            'pain perception is a precision-weighted blend of a top-down prior and bottom-up nociceptive evidence, combined with weight w = Pi_p / (Pi_p + Pi_y). expectation moves perception toward the prior in proportion to its relative precision.',
        citation:
            'Buchel et al. 2014, Neuron, "Placebo analgesia: a predictive coding perspective"; Wager and Atlas 2015, Nat Rev Neurosci review of expectation and pain.',
        confidence: 'contested',
        falsifiability:
            'if placebo magnitude were independent of the reliability of the sensory signal or of cue informativeness, the precision-weighting account would be the wrong control variable.',
    },
    {
        id: 'attention-raises-sensory-precision',
        statement:
            'attention to the painful stimulus multiplicatively raises sensory precision (Pi_y -> Pi_y x (1 + attention)), shifting w toward bottom-up input and shrinking expectation effects.',
        citation:
            'distraction analgesia and attentional modulation literature; Buhle et al. 2012 on attention and pain competing for resources.',
        confidence: 'contested',
        falsifiability:
            'if directing attention onto pain reliably amplified rather than reduced placebo analgesia, the sign of this attentional term would be wrong.',
    },
    {
        id: 'opioid-pathway',
        statement:
            'a large part of placebo analgesia is mediated by endogenous mu-opioid release and is reversible by the opioid antagonist naloxone. the naloxone slider scales this branch toward zero.',
        citation:
            'Levine, Gordon and Fields 1978, Lancet (naloxone reverses placebo analgesia); Eippert et al. 2009, Neuron, opioidergic placebo mechanisms.',
        confidence: 'established',
        falsifiability:
            'naloxone failing to attenuate placebo analgesia under conditions that should engage the opioid system would falsify the opioid-dependence of this branch.',
    },
    {
        id: 'cb1-conditioning-pathway',
        statement:
            'a second, conditioning-dependent analgesic branch is cannabinoid (CB1) and is blocked by rimonabant. it is gated by learned associations, so it requires prior conditioning to contribute.',
        citation:
            'Benedetti et al. 2011, Nat Med, "Nonopioid placebo analgesia is mediated by CB1 cannabinoid receptors".',
        confidence: 'contested',
        falsifiability:
            'if rimonabant left conditioning-induced, naloxone-insensitive placebo analgesia intact, the CB1 attribution of this branch would be wrong.',
    },
    {
        id: 'cck-nocebo-pathway',
        statement:
            'nocebo hyperalgesia is driven by a cholecystokinin (CCK) branch that facilitates pain transmission and is reduced by the CCK antagonist proglumide. negative cues recruit this branch.',
        citation:
            'Benedetti et al. 2006, J Neurosci, anti-anxiety and CCK mechanisms of nocebo hyperalgesia; Benedetti et al. 1997 on proglumide.',
        confidence: 'contested',
        falsifiability:
            'if proglumide did not reduce verbally induced nocebo hyperalgesia, the CCK attribution of the nocebo branch would be falsified.',
    },
    {
        id: 'saturating-static-map',
        statement:
            'each pathway is squashed by a static signed saturation x / (1 + |x|), and the model is a memoryless map from cue similarity to a signed effect. it omits temporal dynamics, descending PAG-RVM circuitry, spinal gating, and learning over trials.',
        citation:
            'modelling choice; descending modulation reviewed in Fields 2004, Nat Rev Neurosci. the saturation is a phenomenological ceiling, not a fitted dose-response curve.',
        confidence: 'speculative',
        falsifiability:
            'order effects, extinction, and carry-over across trials are real and absent here; any time-dependent placebo phenomenon (e.g. extinction of conditioned analgesia) lies outside this static map.',
    },
];
