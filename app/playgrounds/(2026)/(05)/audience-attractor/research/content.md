# Audience Attractor

## Abstract

This playground models the viewership of personality-driven media as a stochastic dynamical system with sticky basins of attraction. Streamers, talk-radio hosts, podcasters, and political commentators do not grow along a smooth curve; their audiences sit in bands. Habit, parasocial attachment, social proof, platform memory, and community lock-in create floors. Niche capacity, format constraints, and identity lock-in create ceilings. The result is a landscape of metastable audience regimes separated by barriers that only sufficiently large shocks can cross.

## Background

The intuition that started the project: once a streamer reaches a certain viewership band, neither falls easily below it nor easily rises above it unless something external changes. The sharpest version of that intuition is not "viewership has a minimum" but "viewership has stable attractor regimes."

Three lines of work support this reading.

**Cumulative advantage.** Salganik, Dodds and Watts (2006) ran an artificial cultural market with 14,341 participants and showed that social influence increased both inequality and unpredictability: popularity itself changed future popularity. Independent Twitch popularity work (over 10,058 users, 55,000 streams, 50,000 clips) finds power-law-like distributions consistent with cumulative advantage, although not proof of any single mechanism.

**Superstar economics.** Rosen's superstar model (1981) argues that small differences can produce very large outcome differences when distribution technology lets top performers serve huge markets. Personality-driven media inherit that asymmetry, with a twist: intimacy and community are partly anti-scalable, so the same identity that built the floor can prevent escape into a larger basin.

**Loyalty decomposition.** A 2026 livestream-loyalty preprint decomposes audience loyalty into stability, competition resistance, post-peak retention, and a floor ratio across 2.94 million minute-level observations from 18 channels over 3.3 years. These four components are close to the model's structural terms.

## Model description

State variable: V_t = C_t + A_t, total viewers in period t, decomposed into a slow-moving core and a fast-moving casual pool.

Core dynamics:

    C_{t+1} = retention(habit, retentionShock) * C_t + conversion(parasocial, quality) * A_t

Habit retention multiplies the core stock down by a factor close to one each period. Parasocial conversion moves a small fraction of casuals into the core. A schedule-collapse scenario multiplies the retention term by 0.52.

Casual dynamics:

    A_{t+1} = platform(V_t) + noise + shock - nicheDrag

where platform(V_t) is the saturating cumulative-advantage term

    platform(V_t) = discoverability * 8 * (V_t + 1)^(0.24 + cumulative * 0.03) * (1 - V_t / capacity)

The cumulative-advantage exponent makes large audiences acquire faster, but the capacity term cuts that off as the niche fills. The niche-drag term penalises operation beyond 72 percent of capacity and is amplified by saturation and identity lock-in.

Shocks are seeded so the simulation is deterministic given the parameters and the scenario. Each scenario adds one or two timed events: a collaboration window for breakout, a capacity lift for the format pivot, a negative-drift band for a trust shock, a retention multiplier for a schedule collapse.

## The six scenarios

The playground exposes six named runs designed to span the four regime tiers.

**Baseline sticky band.** No major events. Floor and ceiling do all the work. The cleanest demonstration of a single stable attractor.

**Breakout campaign.** A collaboration window from roughly 20 percent to 45 percent of the run doubles discoverability. The test is whether the trajectory holds the new band after the window closes.

**Format pivot.** Capacity rises by 65 percent at the 35 percent mark and quality lifts by about a point. Identity lock-in competes with the new ceiling.

**Trust shock.** A negative-drift band runs from about 30 percent to 42 percent. The core's habit retention is unchanged, so the question is whether the floor holds.

**Schedule collapse.** Habit retention is multiplied by 0.52 from the 25 percent mark onward. Isolates the role of routine.

**Slow decay.** No events. Low discoverability, modest quality, but strong habit. The falsification target for the floor: does the basin hold without acquisition?

## Results

**Stable basins exist.** The baseline scenario reaches a single dominant dwell band that captures more than half the run. The trajectory wobbles inside it and rarely leaves.

**Transitions are visible.** Breakout and pivot configurations move the system into a higher dwell band that persists after the event window closes. The signature in the landscape view is a ball that has rolled into the upper well.

**Floors fail when habit goes.** Schedule collapse drops the trajectory below the inherited floor and keeps it there. Habit retention is the decisive term, not raw shock magnitude.

**Trust shocks recover.** A pure controversy can crash peak viewership without destroying the basin: the core holds, and the trajectory reapproaches its band as the shock window closes.

**Wandering is the falsifier.** Drop habit, identity lock-in, and saturation to near zero and the trajectory ceases to dwell. There is no dominant band, only a noisy walk on the log-scale. The attractor metaphor stops doing work for that configuration.

## Limitations

The model has no calendar time, no seasonality, no production-cost or burnout dynamics, and no creator effort variable. The two-pool decomposition is a deliberate compression: real audiences cluster into more than two behavioural strata. The simulation runs with a single seed, so reported dwell shares describe one path rather than a distribution. The classification of regimes into four tiers is a legibility choice, not a claim that audience phenomenology cleanly bins into four bins.

The model is comparative, not predictive. The calibration table compares simulated final viewers against reader-assigned expected values from the cited literature; close agreement means the model's shape is consistent with that reading, not that it has been fit to any specific creator's history.

## References

- Salganik, M. J., Dodds, P. S. and Watts, D. J. *Experimental Study of Inequality and Unpredictability in an Artificial Cultural Market*. Science (2006).
- Rosen, S. *The Economics of Superstars*. American Economic Review (1981).
- Bourdieu, P. *Distinction: A Social Critique of the Judgement of Taste* (1979).
- Lobato, R. *Streaming and the Politics of Default* (2024).
- Braithwaite, J. *Crime, Shame and Reintegration* (1989).
- Twitch popularity power-law analyses (2022).
- 2026 arXiv preprint on livestream loyalty decomposition.
