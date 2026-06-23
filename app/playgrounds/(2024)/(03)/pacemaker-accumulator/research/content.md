# Pacemaker-Accumulator: How a Counting Clock Tells Time

## Abstract

How does a brain estimate a duration with no external clock? The oldest and most
influential answer is the pacemaker-accumulator: an internal pacemaker ticks, an
accumulator counts the ticks, and the count at the moment of interest is the felt
duration. This playground simulates that clock. The pulse generation is
stochastic, but the timing laws it produces, including the famous scalar property,
are exact, and the calibration pins them.

## The clock

The model has two parts. A pacemaker emits pulses at some rate, roughly as a
Poisson process: in each small time step there is a chance of a pulse proportional
to the rate. An accumulator counts pulses until it reaches a threshold; the time
that takes is the timed interval. Two simple consequences are exact, and the
calibration checks both:

- The **mean interval** is the threshold divided by the rate. Accumulating 100
  pulses at 10 per second takes 10 seconds; halve the rate and the interval
  doubles. This is why drugs or states that speed the pacemaker make time feel
  compressed.
- The **per-step pulse probability** is the rate times the time step (Poisson
  thinning), 0.1 for rate 10 over a 0.01-second step.

## The scalar property

The deepest fact about interval timing is Weber's law for time, the scalar
property: the variability of a timed interval grows in proportion to its length,
so the coefficient of variation (standard deviation over mean) is roughly
constant. A 2-second interval is judged about twice as variably as a 1-second one.

The pacemaker-accumulator predicts this almost for free. The time to accumulate N
pulses from a Poisson process is Gamma-distributed with mean N/r and variance
N/r², so its coefficient of variation is 1/√N, independent of the rate r. The
calibration verifies it: threshold 100 gives CV 0.1, and the interval's standard
deviation is the mean times that CV (one second for a ten-second interval). A
constant CV across rates is scalar timing falling out of the architecture.

## Where it sits among timing theories

Scalar Expectancy Theory, built on this clock by Gibbon and colleagues, dominated
interval-timing research for decades. It is not the only model: oscillator and
coincidence-detection accounts (such as striatal beat-frequency) explain some
neural and behavioural data the simple counting clock does not. The assumptions
panel marks the pacemaker-accumulator as one contested architecture among several.

## Honest scope

The simulation adds pacemaker noise, accumulator decay, and a slow oscillatory
adaptation of the rate, which shape variability and drift but are stylized
choices, not measured parameters. And real pacemaker pulses may be more regular
than Poisson. The exact, checkable content is the mean-interval and scalar-CV
relationships; the noise model and the neural interpretation are the lens. The
model shows how a counting clock yields scalar timing, not how any particular
brain keeps time.

## References

- Gibbon, J. (1977). Scalar expectancy theory and Weber's law in animal timing.
- Treisman, M. (1963). Temporal discrimination and the indifference interval.
- Buhusi, C. V., and Meck, W. H. (2005). What makes us tick? Functional and neural
  mechanisms of interval timing.
