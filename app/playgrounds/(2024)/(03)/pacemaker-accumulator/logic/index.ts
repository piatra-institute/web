// Pacemaker-accumulator model of interval timing (Scalar Expectancy Theory). A
// pacemaker emits pulses as a roughly Poisson process at rate r; an accumulator
// sums them until it reaches a threshold N, and the elapsed time is the timed
// interval. The simulation is stochastic, but two facts are exact:
//   - the mean time to accumulate N pulses at rate r is N / r;
//   - that accumulation time is Gamma(N, r) distributed, so its coefficient of
//     variation is 1/sqrt(N), independent of the rate. A constant CV is the
//     "scalar property" (Weber's law for time).
// Pure functions used by the calibration.

// per-step probability of a pulse for rate r over a small step dt (Poisson thinning)
export function pulseProbability(rate: number, dt: number): number {
    return Math.max(0, rate * dt);
}

// expected interval: time to accumulate `threshold` pulses at `rate`
export function expectedTimeToThreshold(rate: number, threshold: number): number {
    if (rate <= 0) return Infinity;
    return threshold / rate;
}

// coefficient of variation of the accumulation time (Gamma(N, r)): 1/sqrt(N),
// independent of rate. This constancy is the scalar property.
export function accumulationCV(threshold: number): number {
    if (threshold <= 0) return Infinity;
    return 1 / Math.sqrt(threshold);
}

// standard deviation of the timed interval = mean * CV (scalar timing)
export function intervalStd(rate: number, threshold: number): number {
    return expectedTimeToThreshold(rate, threshold) * accumulationCV(threshold);
}
