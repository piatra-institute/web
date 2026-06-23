import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'consensus-by-rejection',
        statement:
            'governance here works by rejection, not approval: proposals are live by default and are blocked when enough members actively vote no. this inverts majority-passes voting into a veto-based consensus model.',
        citation:
            'consensus / consent-based decision making (e.g. sociocracy, where decisions stand absent a reasoned objection).',
        confidence: 'contested',
        falsifiability:
            'real consensus bodies also weigh the content of objections, not just their count; a pure rate threshold is a simplification.',
    },
    {
        id: 'veto-threshold',
        statement:
            'a proposal is vetoed when the rejection rate (rejection votes over active members) exceeds a tunable veto threshold. the rate and the threshold test are exact.',
        citation:
            'the veto rule in the model; rate = rejections / active members.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the rate and the threshold comparison against closed forms; a deviation would be an implementation error.',
    },
    {
        id: 'pass-by-survival',
        statement:
            'a proposal passes only after it has been live long enough and its rejection rate stays below (1 - consensusThreshold). passing is survival, not active endorsement.',
        citation:
            'the pass rule in the model; requires age and low rejection.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies the age-and-rate pass condition; failing it would be a bug.',
    },
    {
        id: 'consensus-strength-curve',
        statement:
            'consensus strength is defined as 1 - |0.5 - rejectionRate| * 2, so it peaks at an even split and falls to zero at either unanimous extreme. it measures contestation, not agreement in the everyday sense.',
        citation:
            'the consensus-strength definition in the model.',
        confidence: 'contested',
        falsifiability:
            'one could equally define consensus as peaking at unanimity; this curve encodes a specific, arguable notion that the calibration checks exactly.',
    },
    {
        id: 'stochastic-members',
        statement:
            'members have random trust, influence, participation, and sentiment, and each vote is a random draw gated by participation and information access. the network animation differs every run.',
        citation:
            'use of Math.random for member attributes and individual votes.',
        confidence: 'established',
        falsifiability:
            'this is why the calibration targets the decision rules rather than a specific simulated outcome.',
    },
    {
        id: 'stylized-not-empirical',
        statement:
            'parameters (community size, trust, participation, thresholds) are illustrative. the model explores the dynamics of rejection-based governance, not the behaviour of any real assembly.',
        citation:
            'stylized political-science sandbox.',
        confidence: 'speculative',
        falsifiability:
            'fitting to a real consensus body could place it in a different regime than the model suggests.',
    },
];
