# Closedness and Adverse Selection: Who Enters a Closing System

## Abstract

When an institution stops tolerating criticism, something subtle happens to who
wants to join it. The honest and the morally averse opt out; the corruption-
tolerant find it more attractive than ever. This playground models that drift as
adverse selection on a moral-type dimension, and the cutoff math behind it is
exact, which the calibration pins.

## The lemons logic, on morals

George Akerlof's "market for lemons" showed how hidden quality can make a market
unravel: as buyers cannot tell good cars from bad, good sellers withdraw, average
quality falls, and the market selects for lemons. This model runs the same logic
on a moral dimension. Each potential entrant has a moral type m (higher m means
more averse to wrongdoing). As a system closes, the people who self-select into it
shift toward low m.

## The entry cutoff

Closedness is a single parameter k from 0 (open) to 1 (closed). It drives three
exact functions:

- **Private rents** B(k) = beta0 + gamma*k. A more closed system offers bigger
  private spoils to insiders.
- **Moral-cost amplifier** g(k) = k^alpha. The more closed the system, the more it
  asks entrants to stomach, and for alpha > 1 this cost is convex, accelerating.
- **Baseline cost** h(k) = eta*k. A flat psychic or sanction cost.

An agent of moral type m enters when the net rents beat the amplified moral cost,
which gives a sharp threshold:

> m* = (B(k) - h(k)) / g(k).

Everyone below the cutoff enters, everyone above abstains. The calibration checks
the pieces: B(0.5) = 0.55, g(0.5) with alpha = 2 is 0.25, and the cutoff for a
clean case is exactly 0.95.

## Why closure selects for corruption-tolerance

The key result is the direction. Under a convex amplifier, raising closedness
pushes the cutoff down: rents rise linearly, but the moral cost rises faster, so
the type of person willing to enter becomes steadily less scrupulous. The
calibration confirms it directly, the cutoff at k = 0.2 (which clamps to 1, almost
everyone) exceeds the cutoff at k = 0.8 (about 0.83). As a system closes, its
gate quietly filters for the corruption-tolerant.

The population side uses a Beta distribution of moral types, and the entrant
fraction and average morality are integrals of that density up to the cutoff. In
the fully open limit the cutoff sits at the top of the range and the whole
population enters, which the calibration also checks.

## An optional twist: loyalty signaling

The model can add a loyalty-signaling channel, a dissonance cost for signaling
against one's type and an identity benefit for signaling with it, which shifts the
cutoff further. This is an extension layered on the base mechanism; it is exact
given its parameters but its functional form is stipulated, not derived.

## Honest scope

The functional shapes (linear rents, power-law amplifier, Beta population) are
modelling choices, and the parameters and named regimes (open, moderate, closed,
authoritarian) are illustrative, not fitted to any institution. The playground
argues a mechanism, how closure selects for who is willing to enter, not the
history of any real organization. The exact content is the cutoff math and its
direction; the politics is the lens.

## References

- Akerlof, G. (1970). The market for "lemons": quality uncertainty and the market
  mechanism.
- Standard references on adverse selection and self-selection in entry decisions.
