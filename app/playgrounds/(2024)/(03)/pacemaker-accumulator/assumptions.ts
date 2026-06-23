import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'pacemaker-accumulator',
        statement:
            'time is estimated by a pacemaker that emits pulses and an accumulator that counts them: an interval is timed when the count reaches a threshold. this is the classic pacemaker-accumulator architecture of Scalar Expectancy Theory.',
        citation:
            'Gibbon (1977), Scalar Expectancy Theory; Treisman (1963) internal-clock model.',
        confidence: 'contested',
        falsifiability:
            'alternative timing models (oscillator/coincidence-detection, e.g. striatal beat-frequency) fit some data the pacemaker-accumulator does not.',
    },
    {
        id: 'mean-interval',
        statement:
            'the mean timed interval is the threshold divided by the pacemaker rate: faster pacemaker or lower threshold means shorter perceived intervals. this is exact.',
        citation:
            'mean time to accumulate N pulses at rate r is N / r.',
        confidence: 'established',
        falsifiability:
            'the calibration checks the mean interval and its inverse-rate scaling against the closed form; a deviation would be an implementation error.',
    },
    {
        id: 'scalar-property',
        statement:
            'the standard deviation of timing grows in proportion to the interval, so the coefficient of variation is constant. this scalar property (Weber\'s law for time) follows from the accumulation time being Gamma-distributed with CV = 1/sqrt(N).',
        citation:
            'the scalar property of interval timing; Gibbon\'s scalar timing.',
        confidence: 'established',
        falsifiability:
            'the calibration checks CV = 1/sqrt(N) and the proportional standard deviation; systematic departures from scalar timing are a known edge (very short or very long intervals).',
    },
    {
        id: 'poisson-pulses',
        statement:
            'pulses are generated as a near-Poisson process (independent per-step chance proportional to rate), with added noise and slow adaptation. the per-step pulse probability is rate times the time step.',
        citation:
            'Poisson pulse generation via thinning.',
        confidence: 'contested',
        falsifiability:
            'real pacemaker pulses may be more regular (sub-Poisson) or bursty, changing the variability structure.',
    },
    {
        id: 'noise-and-adaptation',
        statement:
            'the model adds pacemaker noise, accumulator decay and noise, and a slow oscillatory adaptation of the rate. these shape the variability and drift but are stylized additions, not measured parameters.',
        citation:
            'noise, decay, and adaptation terms in the model.',
        confidence: 'speculative',
        falsifiability:
            'the specific noise and adaptation forms are modelling choices; different forms change the dynamics around the exact mean and CV.',
    },
    {
        id: 'illustrative-sandbox',
        statement:
            'parameters are illustrative. the model demonstrates how a counting clock produces scalar timing, not the neural implementation or the timing behaviour of any specific organism.',
        citation:
            'stylized cognitive-timing sandbox.',
        confidence: 'speculative',
        falsifiability:
            'fitting to behavioural timing data would test whether these parameters reproduce a real subject.',
    },
];
