# Photosynthetic state space

A research companion to the playground. This document describes what the model actually computes, how its light-response and protection terms relate to established photosynthesis physiology, and where the scalar simplification departs from the standard biochemical models.

## Abstract

The playground treats oxygenic photosynthesis as a controllable landscape. Seventeen physiological parameters and three speculative control nodes feed a deterministic steady-state function, `simulate()`, that returns a carbon-fixation proxy, a reactive-oxygen-species (ROS) load, a homeostasis score, a bifurcation risk, and a regime label. A second layer runs a 48-step trajectory under five perturbation profiles, accumulating damage memory so that the same nominal conditions can yield different outcomes depending on history. The model is a teaching instrument, not a predictive crop model. Its light response is a genuine rectangular hyperbola and its CO2 response is a genuine Michaelis-Menten saturation, but its single scalar assimilation output deliberately collapses processes that the Farquhar-von Caemmerer-Berry (FvCB) framework keeps separate.

## Background: the Z-scheme

Oxygenic photosynthesis splits the light reactions across two photosystems wired in series. Photosystem II (PSII, reaction-center pigment P680) oxidises water, releasing O2 and feeding electrons into the plastoquinone pool. The cytochrome b6f complex passes those electrons to plastocyanin while pumping protons across the thylakoid membrane, building the proton-motive force that ATP synthase uses to make ATP. Photosystem I (PSI, reaction-center pigment P700) re-excites the electrons and delivers them, via ferredoxin and ferredoxin-NADP reductase, to NADP+, producing NADPH.

Plotting redox potential against the electron's journey produces the characteristic Z shape. The redox span from water (E about +0.82 V) to NADP+ (E about -0.32 V) is roughly 1.14 V. A single 680 nm photon carries about 1.82 eV, which is nominally enough, but each transfer step dissipates free energy, so two serial photon inputs are needed in practice. This two-photosystem requirement is the model's single established structural assumption (Hill and Bendall, 1960; Blankenship, 2021).

## The light response: a rectangular hyperbola

The core of the model is the light-use term

    lightUse(I) = (I * antenna) / (I * antenna + Ik * (1 + 0.7 * NPQ))

where I is incident irradiance, `antenna` scales the effective absorption cross-section, Ik is the species half-saturation irradiance, and NPQ is the effective non-photochemical quenching. This is the rectangular hyperbola form of the photosynthesis-irradiance (P-I) curve (Jassby and Platt, 1976; Ye, 2007). It has three textbook diagnostic properties, all of which the calibration suite checks against `simulate()` directly:

1. **Dark point.** At I = 0 the term is zero, so assimilation is exactly zero. There is no light, so there is no fixation.
2. **Saturation.** As I grows without bound the term approaches 1. Light stops being limiting and some other factor (CO2, temperature, enzyme capacity) caps the rate.
3. **Half-saturation.** The term equals one half precisely at I = Ik_eff, where Ik_eff = Ik * (1 + 0.7 * NPQ) / antenna. This is the irradiance at which half of the light-saturated rate is reached, the standard way Ik is read off an experimental P-I curve.

NPQ enters the denominator: raising quenching pushes the half-saturation point to higher irradiance, the model's way of saying that a leaf dissipating more energy as heat needs more light to reach the same relative output. A larger antenna does the opposite, lowering Ik so that dim-light specialists (the Red Algae preset, with a large phycobilisome antenna and low Ik) saturate earlier.

Note that this model does not represent a light compensation point as a negative intercept. Real leaves respire, so net assimilation is slightly negative in darkness and crosses zero at the compensation irradiance. The playground's assimilation is a gross light-use proxy clamped to be non-negative, so its dark value is zero rather than minus the respiration rate. This is one of the deliberate simplifications.

## The CO2 response

Carbon-dioxide delivery enters through

    co2Effective = CO2 * (1 + ccm * ccmStrength)
    co2Factor = co2Effective / (co2Effective + kCO2)

another Michaelis-Menten saturation, with kCO2 the half-saturation concentration. The carbon-concentrating-mechanism (CCM) term raises the effective CO2 seen by Rubisco, capturing the qualitative advantage of C4 bundle-sheath cells and cyanobacterial carboxysomes (Sage, 2004; Badger and Price, 2003). In the FvCB framework the CO2 response is more structured: it is the lower envelope of a Rubisco-limited rate and an RuBP-regeneration-limited rate, with a sharp transition between them. The playground uses one smooth saturation instead of that piecewise envelope.

## Protection, repair, and ROS

When absorbed light exceeds what carbon fixation can consume, excess excitation drives the formation of reactive oxygen species that damage the D1 protein of PSII. The model represents three defences, each grounded in the literature:

- **Non-photochemical quenching (NPQ)** dissipates excess excitation as heat, lowering ROS at the cost of quantum yield (Ruban, 2016). In the model NPQ both raises Ik and multiplies down the ROS load.
- **D1 repair turnover** replaces damaged reaction centers (Aro et al., 1993). The `repair` and `rosBuffer` parameters set a repair capacity that is differenced against ROS load to give net damage.
- **Cyclic electron flow** around PSI adds proton-motive force without making NADPH, tuning the ATP:NADPH ratio and contributing to photoprotection (Munekage et al., 2004). The model rewards cyclic flow when stress demand is high and penalises it slightly otherwise.

ROS load grows with irradiance, excitation mismatch, water stress, and supra-optimal temperature, and is damped by NPQ and the ROS buffer. Damage memory integrates the running excess of ROS over repair.

## Path dependence and bifurcation

The trajectory layer is where the state-space framing earns its name. Each of the 48 steps re-runs `simulate()` under a time-varying irradiance and temperature profile, then updates damage memory by the net of ROS over repair. Because memory feeds back into the next step's penalty, two leaves reaching the same nominal noon conditions can end in different states: one that ramped up gradually may sit in a homeostatic regime, while one hit by a high-light pulse may have accumulated enough damage to tip into the photoinhibition attractor. The regime classifier labels the photoinhibition basin when bifurcation risk or damage index crosses threshold. The calibration suite confirms that combined extreme stress (saturating light, heat, drought, crippled NPQ and repair) reliably lands in that basin.

This bifurcation is a coarse caricature of real photoinhibition dynamics, which are continuous and reversible on the timescale of D1 turnover rather than a true attractor with a separatrix. The model uses a sigmoid threshold to make the regime shift legible, not because photoinhibition is genuinely bistable.

## What the model does not reproduce

To use the playground honestly, three departures from textbook physiology should be kept in mind.

1. **Scalar assimilation.** Real carbon fixation is the minimum of a Rubisco-limited and an RuBP-regeneration-limited rate (FvCB; Farquhar, von Caemmerer, and Berry, 1980; von Caemmerer, 2000 for C4). The playground multiplies smooth factors together instead of taking a minimum, so it cannot reproduce the kink where a leaf switches from carboxylation-limited to electron-transport-limited operation. It conflates processes on different timescales into one number.
2. **No explicit respiration or compensation point.** As noted above, dark assimilation is zero rather than negative, so there is no light or CO2 compensation point.
3. **Speculative control nodes.** Adaptive excitonic routing, dynamic thylakoid topology, and protonic micro-homeostasis are not established mechanisms. They are flagged speculative in the assumptions panel and exist as prompts for systems thinking, not as validated levers. Quantum-coherence effects in light harvesting (Engel et al., 2007) and thylakoid membrane remodelling (Kirchhoff, 2019) are active research areas, but the specific node behaviours in the model are inventions.

## Calibration

The calibration panel checks the deterministic core against the diagnostic points listed above: the dark point, light saturation, the half-saturation irradiance, P-I monotonicity, excitation-balance symmetry, and the photoinhibition basin under extreme stress. Every predicted value is computed by `simulate()` at run time, not stored, so the panel re-verifies the model on each build. The stochastic, history-dependent trajectory layer is intentionally left out of calibration because its output depends on the path, not on a fixed target.

## References

- Hill, R. and Bendall, F., 1960. Function of the two cytochrome components in chloroplasts. Nature.
- Jassby, A. D. and Platt, T., 1976. Mathematical formulation of the relationship between photosynthesis and light for phytoplankton. Limnology and Oceanography.
- Farquhar, G. D., von Caemmerer, S., and Berry, J. A., 1980. A biochemical model of photosynthetic CO2 assimilation in leaves of C3 species. Planta.
- Aro, E.-M., Virgin, I., and Andersson, B., 1993. Photoinhibition of Photosystem II: inactivation, protein damage and turnover. Biochimica et Biophysica Acta.
- Badger, M. R. and Price, G. D., 2003. CO2 concentrating mechanisms in cyanobacteria. Journal of Experimental Botany.
- Sage, R. F., 2004. The evolution of C4 photosynthesis. New Phytologist.
- Munekage, Y. et al., 2004. Cyclic electron flow around photosystem I is essential for photosynthesis. Nature.
- Ye, Z.-P., 2007. A new model for relationship between irradiance and the rate of photosynthesis in Oryza sativa. Photosynthetica.
- Engel, G. S. et al., 2007. Evidence for wavelike energy transfer through quantum coherence in photosynthetic systems. Nature.
- Ruban, A. V., 2016. Nonphotochemical chlorophyll fluorescence quenching: mechanism and effectiveness in protecting plants from photodamage. Plant Physiology.
- Kirchhoff, H., 2019. Chloroplast ultrastructure in plants. New Phytologist.
- Blankenship, R. E., 2021. Molecular Mechanisms of Photosynthesis, 3rd ed. Wiley.
