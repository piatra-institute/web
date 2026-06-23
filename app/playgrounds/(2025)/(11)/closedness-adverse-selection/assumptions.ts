import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'adverse-selection',
        statement:
            'as a system closes (critique is suppressed), who chooses to enter shifts toward those with lower moral aversion. this is adverse selection on a moral-type dimension, the same selection logic as Akerlof\'s market for lemons.',
        citation:
            'Akerlof 1970 (The Market for Lemons); adverse selection under hidden type.',
        confidence: 'contested',
        falsifiability:
            'if entry composition did not shift with closedness, the selection mechanism would be absent; the model makes the shift explicit.',
    },
    {
        id: 'entry-cutoff',
        statement:
            'an agent of moral type m enters when the private rents net of baseline cost exceed the amplified moral cost, giving a sharp cutoff m* = (B - h) / g. all types below the cutoff enter, all above abstain.',
        citation:
            'threshold (cutoff) entry rule derived from comparing net rents to moral cost.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the cutoff formula against its closed form; a deviation would be an implementation error.',
    },
    {
        id: 'closedness-functions',
        statement:
            'closedness k feeds three exact functions: private rents B(k) = beta0 + gamma*k rising linearly, a moral-cost amplifier g(k) = k^alpha (convex for alpha > 1), and a baseline cost h(k) = eta*k. the shapes are modelling choices.',
        citation:
            'the model definition; linear rents and a power-law amplifier.',
        confidence: 'contested',
        falsifiability:
            'different functional forms (e.g. saturating rents) would change where and how fast adverse selection sets in.',
    },
    {
        id: 'beta-population',
        statement:
            'moral types are drawn from a Beta(a, b) distribution on [0, 1], so the entrant fraction and mean are integrals of that density up to the cutoff. the Beta family is a flexible but specific choice.',
        citation:
            'Beta distribution as a flexible model of a bounded population trait.',
        confidence: 'contested',
        falsifiability:
            'a different population distribution would change the entrant statistics for the same cutoff.',
    },
    {
        id: 'loyalty-signaling',
        statement:
            'an optional loyalty-signaling channel adds a dissonance cost and an identity benefit, shifting the cutoff. this is an extension on top of the base cutoff and is also exact given its parameters.',
        citation:
            'costly-signaling extension; dissonance and identity terms.',
        confidence: 'speculative',
        falsifiability:
            'the signaling terms are stipulated; whether real loyalty signals behave this way is not tested by the model.',
    },
    {
        id: 'stylized-not-empirical',
        statement:
            'parameters and presets (open, moderate, closed, authoritarian) are illustrative regimes, not fitted to data. the model argues a mechanism, how closure selects for corruption-tolerance, not the trajectory of any real institution.',
        citation:
            'stylized political-economy sandbox.',
        confidence: 'speculative',
        falsifiability:
            'fitting to a real institution would test whether the predicted selection matches observed entry composition.',
    },
];
