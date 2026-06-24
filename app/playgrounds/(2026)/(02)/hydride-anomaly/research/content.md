# The Hydride Anomaly

## Abstract

Water boils at 100 °C. Its closest chemical relatives, the heavier group-16
hydrides H2S, H2Se, and H2Te, boil at -60, -41, and -2 °C. Extrapolating the
trend of the heavier members down to water predicts a boiling point near -90 °C.
The 190-degree gap between that prediction and reality is the hydride anomaly,
and it is one of the most legible fingerprints of hydrogen bonding in all of
chemistry. This companion describes the quantitative model behind the
playground: a least-squares extrapolation that turns "water is weird" into a
number, and the limits of reading that number too literally.

## Background

Across a family of binary hydrides built on the same structural pattern (H2E
for group 16, HX for group 17, EH3 for group 15, EH4 for group 14), the heavier
homologues form a tidy series. As you descend a periodic group, the central
atom gains electrons, the molecule gains mass, and its polarisability rises.
London dispersion forces, the attractions between instantaneously induced
dipoles, grow with that polarisability. More dispersion means stronger
intermolecular attraction, which means more thermal energy is needed to boil or
melt the substance. The result is a boiling point that climbs steadily from
period 3 to period 5.

If dispersion were the whole story, the line would continue smoothly to period
2. For the group-14 hydrides it nearly does: methane, with no hydrogen bonding,
sits close to the extrapolated trend (slightly below it, because the lightest
member has the least dispersion). For groups 15, 16, and 17 the period-2 member
breaks away dramatically upward. The donors involved (N, O, F) are the three
most electronegative non-noble elements. A hydrogen atom bonded to one of them
carries a large partial positive charge and can form a directional hydrogen
bond to a lone pair on a neighbouring molecule. That extra attraction, absent
in the heavier homologues, is what the anomaly measures.

## Model

The playground reduces the anomaly to one regression. For a chosen property
(boiling point, melting point, latent heat of vaporisation or fusion, or liquid
range) and a chosen family, it takes the three heavier members at periodic rows
3, 4, and 5 and fits an ordinary least-squares line:

    y_hat(row) = slope * row + intercept

The slope and intercept come from the closed-form OLS expressions over those
three points. The line is then evaluated at row 2 to give the "no special
bonding" prediction, and the residual is

    residual = y_observed - y_hat(2)

A large positive residual is the signature of hydrogen bonding. For group-16
boiling point in Celsius the fit through (3, -60.3), (4, -41.3), (5, -2) gives a
slope of 29.15 and an intercept of -150.13, predicting -92.83 °C at period 2.
Water's observed 100 °C leaves a residual of 192.83 °C. The same procedure gives
residuals of 131.6 °C for HF and 90.6 °C for NH3, in descending order of
hydrogen-bonding strength, while methane's control residual is only -17.6 °C and
points the wrong way for an anomaly.

The scatter view adds a second, independent baseline: boiling point regressed
on the natural log of molar mass, fit only over substances that neither donate
nor accept hydrogen bonds. Water and HF jump well above that dispersion line
too, confirming that the gap is not an artefact of the period-based fit. The
phase view classifies each substance as solid, liquid, or gas at an adjustable
ambient temperature; at 25 °C water is the only liquid among the groups-14-to-17
hydrides, a direct consequence of its anomalously high boiling point.

## Results

The three classic anomalies (water, hydrogen fluoride, ammonia) dominate the
outlier ranking for every thermodynamic property, not just boiling point. Their
melting points and enthalpies of vaporisation also lie far above the
extrapolated trend, because the same hydrogen bonds that resist boiling also
resist melting and raise the energy cost of leaving the liquid. The ordering
water > HF > NH3 by residual tracks the conventional picture: water forms a
three-dimensional network with two donors and two acceptors per molecule, HF
forms one-dimensional chains, and ammonia, with one lone pair and three donor
hydrogens, forms a weaker network limited by acceptor count.

## Limitations

The straight-line baseline is a convenience, not a law. The heavier homologues
are not exactly collinear, so the extrapolated period-2 value carries a fit
uncertainty that the residual inherits; with only three points there is no
degrees-of-freedom cushion. The magnitude of the residual therefore should be
read as "large and positive" rather than as a precise enthalpy. Using molar mass
as a proxy for polarisability is likewise approximate, since shape and electron
distribution matter and two molecules of equal mass can differ in dispersion.

Finally, everything here is at one atmosphere. The phrase "hydride anomaly"
elsewhere names a completely different phenomenon: the high-pressure
superhydrides such as H3S and LaH10, where hydrogen-rich lattices under megabar
pressure become high-temperature superconductors. That is not this model.
Nothing in the standard-pressure boiling-point trend extends to the megabar
regime, and the two should not be confused.

## References

- L. Pauling, *The Nature of the Chemical Bond*, Cornell University Press.
- F. London, *The general theory of molecular forces*, Trans. Faraday Soc. 33 (1937).
- J. N. Israelachvili, *Intermolecular and Surface Forces*, Academic Press.
- CRC Handbook of Chemistry and Physics, boiling and melting points and latent heats.
- NIST Chemistry WebBook, thermophysical property data.
