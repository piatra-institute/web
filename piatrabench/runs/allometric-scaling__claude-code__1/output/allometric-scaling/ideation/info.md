# Allometric scaling: the metabolic rate of life

## Concept

Across more than twenty orders of magnitude in body mass, an organism's resting
metabolic rate B scales with mass M as a power law, B = B0 * M^a. Max Kleiber
(1932) found the exponent a is close to 3/4, not the 2/3 that a naive
surface-to-volume argument predicts. Why it is 3/4 is still debated: West, Brown
and Enquist (1997) derive it from the geometry of space-filling resource
networks; others argue the data do not pin a single universal exponent.

## What to build

An interactive log-log plot of metabolic rate versus body mass for a set of
animals, with a model power law the user can tune. Let the user vary the exponent
a and the coefficient B0 and watch how the model line tracks the measured points.
Surface the competing exponents (2/3 surface law, 3/4 Kleiber, 1 isometric) and
an analysis of which exponent best fits the data.

## The scientific point

- On log-log axes a power law is a straight line, and the slope is the exponent.
- The data favour an exponent near 3/4 over 2/3, but the error valley is broad.
- Calibrate the model: predicted BMR from the law versus measured BMR for known
  animals (mouse, human, cow, elephant).

## Sources

- Kleiber, M. (1932). Body size and metabolism. Hilgardia.
- West, Brown, Enquist (1997). A general model for the origin of allometric
  scaling laws in biology. Science.
- White and Seymour (2003); Glazier (2005) on the ongoing 2/3 versus 3/4 debate.
