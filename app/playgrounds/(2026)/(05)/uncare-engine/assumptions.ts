import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'stage-ordering',
        statement:
            'people pass through ordered stages from ordinary moral load to monstrous uncare. the ordering is monotonic in a single composite score we call madness.',
        citation:
            'after the structure of nietzsche\'s ressentiment, with empirical anchors from haidt, "the righteous mind" (2012), and bicchieri, "the grammar of society" (2006).',
        confidence: 'contested',
        falsifiability:
            'longitudinal data showing people leap from stage 1 to stage 5 without passing through stages 2 to 4 would falsify the monotonic ordering.',
    },
    {
        id: 'sentience-not-required',
        statement:
            'the same engine that produces uncare toward animals can produce uncare toward humans, infrastructure, code, and norms. the stages are domain-general; the cases differ only in the moral object being shrunk.',
        citation:
            'inspired by floridi, "the ethics of information" (2013), which broadens moral patiency beyond sentience.',
        confidence: 'speculative',
        falsifiability:
            'evidence that backlash patterns in maintenance ethics are statistically unrelated to backlash patterns in care ethics would weaken the claim of a single engine.',
    },
    {
        id: 'shame-as-accelerant',
        statement:
            'public shame, more than private guilt, is the primary accelerant from stage 2 to stage 3. correction staged as humiliation reliably produces ressentiment.',
        citation:
            'after braithwaite, "crime, shame and reintegration" (1989). reintegrative shaming reduces backlash; stigmatising shaming increases it.',
        confidence: 'contested',
        falsifiability:
            'an intervention study in which private correction produced as much defensive minimisation as public correction would falsify this.',
    },
    {
        id: 'tribal-payoff',
        statement:
            'the presence of a tribe that rewards defiance is necessary, not just sufficient, for stages 4 and 5. solitary uncare is rare and typically unstable.',
        citation:
            'after greene, "moral tribes" (2013); tajfel social identity work; subreddit and online community ethnographies.',
        confidence: 'contested',
        falsifiability:
            'documented cases of stable counter-moral inversion sustained for years without any peer or audience reward.',
    },
    {
        id: 'exits-matter',
        statement:
            'available exits are anti-correlated with progression. when a person sees a low-cost path to acting better, they rarely cross into ressentiment.',
        citation:
            'general behavioral economics result; see thaler & sunstein, "nudge" (2008), on the importance of low-friction paths.',
        confidence: 'established',
        falsifiability:
            'an experiment where opening clear exits has no effect on observed defensive minimisation rates would weaken this.',
    },
    {
        id: 'no-cosmic-authority',
        statement:
            'no stage in this model assumes morality has cosmic authority. the engine works under species-local moral realism just as well as under moral anti-realism.',
        citation:
            'after the conversation that generated this playground. consistent with korsgaard, "the sources of normativity" (1996).',
        confidence: 'speculative',
        falsifiability:
            'this is a definitional commitment; falsified only by demonstrating the model needs metaphysical realism to score correctly.',
    },
    {
        id: 'inflation-asymmetry',
        statement:
            'moral inflation, the use of maximum-charge terms for ordinary mistakes, dampens moral signal asymmetrically. once everything is violence, nothing is.',
        citation:
            'after haslam, "concept creep" (2016).',
        confidence: 'contested',
        falsifiability:
            'longitudinal evidence that high-inflation contexts produce more careful moral discrimination, not less, would falsify this.',
    },
    {
        id: 'load-is-perceived',
        statement:
            'moral load is the perceived implication, not the actual one. two people in the same supply chain can sit at very different load values without either being objectively wrong about the chain.',
        citation:
            'self-perception literature; tversky-kahneman framing effects.',
        confidence: 'established',
        falsifiability:
            'evidence that perceived and actual implication track each other closely in field populations would weaken the distinction.',
    },
    {
        id: 'six-axes-sufficient',
        statement:
            'six axes are enough to recover the canonical stage of the ten domain cases to within one stage. adding a seventh axis is unlikely to improve fit in the current range.',
        citation:
            'pragmatic modeling choice. holds in the canonical calibration table at the time of writing.',
        confidence: 'speculative',
        falsifiability:
            'reproducing the model with a seventh axis (e.g. trauma, isolation type, prior identity injury) and getting a strictly better calibration would falsify the sufficiency claim.',
    },
    {
        id: 'reversibility',
        statement:
            'progression is not one-way. people return from stages 3 and 4 to stage 1 with the right conditions. recovery from stage 5 is rare but documented.',
        citation:
            'after the work of deradicalisation networks (life after hate, exit deutschland) and the testimony in kathleen blee, "inside organized racism" (2002).',
        confidence: 'contested',
        falsifiability:
            'evidence that no individual has returned from stage 5 to stage 1 without significant structural reset (incarceration, illness, relocation) would weaken the claim of natural reversibility.',
    },
];
