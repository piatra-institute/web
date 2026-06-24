# Open Source Sustainability

## Abstract

This playground asks a deceptively simple question: when does an open source project move from a permissive licence (MIT, Apache 2.0, BSD) to a restrictive one (AGPL, BSL, SSPL)? It frames the decision not as a moral choice but as a phase transition. Four forces act on a project at once, and the model collapses them into a single point moving through a two-dimensional landscape of pressure against support. When the point crosses a boundary, the licence regime flips. The model is a toy, and this companion is explicit about where it captures something real and where it does not.

## Background: the commons under cloud pressure

The 2018 to 2022 wave of relicensings is the empirical backdrop. Redis moved modules to the Commons Clause and later to RSAL and SSPL. MongoDB switched from AGPL to the Server Side Public License. Elastic adopted SSPL and the Elastic License. The common thread in each public account was the same: a hyperscale cloud provider offered the project as a managed service, captured a large share of the revenue, and contributed little back upstream. The maintainers experienced this as a tragedy of the commons, where a shared resource is depleted by an actor who does not bear the cost of sustaining it.

Not every project responded the same way. PostgreSQL, despite decades of cloud providers offering managed Postgres, never relicensed. Its strong, distributed community governance and its lack of a single corporate owner left it with no incentive and no mechanism to restrict use. MinIO kept the AGPL. Sentry moved to the Business Source License from a position of relative strength rather than crisis. The model is built to explore what separates these outcomes.

## The model

A project is represented by four scalars, each on a zero-to-one-hundred scale:

- **maturity**: institutional stability and code stability over time.
- **community**: contributor base, engagement, and solidarity.
- **donations**: the funding the project receives, broadly construed.
- **cloud**: commercial pressure from providers monetising the project.

These four numbers are mapped to a point in a two-dimensional phase space whose axes are a **support score** and a **pressure score**.

### Support

Support is not community plus donations. It is a synergistic combination:

- community is scaled by a maturity-dependent factor, so a mature community is more effective per unit;
- donations are likewise scaled by maturity, so a mature project spends its funds more efficiently;
- the two effects are averaged, multiplied by a synergy factor that couples community and donations non-linearly, and passed through a square root.

The square root encodes diminishing returns. The result is capped at one hundred. This cap matters: well-resourced projects pile up against the ceiling, which flattens the differences between them.

### Pressure

Pressure starts from the raw cloud number and is then resisted. Community solidarity, financial buffer, and institutional maturity each reduce a resistance factor, and the three factors multiply. Effective pressure is the cloud value times that combined resistance; the result is squared and rescaled. The multiplication means a project needs all three buffers at once, and the squaring sharpens the transition near the boundary.

### The moving boundary

The verdict is decided by comparing support against an adjusted boundary. The boundary is not fixed. Community, funding, and maturity each shift it outward by up to a quarter of its position. A stronger project therefore tolerates more pressure before the verdict flips from permissive to restrictive. This is the model's account of why PostgreSQL stays permissive under pressure that pushed weaker projects to relicense.

## Results and an honest limitation

The deterministic core behaves cleanly at the extremes. A mature, strong-community project under light pressure is scored permissive. A fragile project facing heavy cloud competition with little community or funding is scored restrictive. The calibration panel pins both verdicts and four exact closed-form scores, all reproducing to the digit.

The honest limitation is in the middle. Because the support term saturates at one hundred and the pressure term is squared and damped by resistance, the well-resourced commercial projects whose relicensings motivated the model (Redis, Elastic, and MongoDB at their actual licence-change endpoints) all score as permissive. They had strong communities, substantial funding, and high maturity, so the model places them comfortably inside the permissive zone even though, historically, they relicensed. The model reproduces the permissive-versus-restrictive split only for the resource extremes, not for the mid-range commercial cases it set out to explain.

This is a feature of being explicit rather than a bug to be hidden. The relicensings were driven by ownership structure and revenue capture, which are exactly the variables the four-scalar state cannot represent. PostgreSQL did not relicense not because its support score was higher than MongoDB's, but because it has no owner who could choose to. The model's phase space has no axis for that.

## The sandbox

The play loop is stochastic and illustrative. Cloud pressure drifts upward by a small random increment each tick, mimicking the slow encroachment of commercial competition, and shock events apply random deltas to community and funding (a key maintainer leaves, a security flaw lands, the project goes viral). This animated trajectory is deliberately excluded from calibration; only the deterministic transform and the verdict function are verified.

## Limitations

- Governance and ownership, the dominant drivers of the real relicensings, are absent from the four-variable state.
- The synergy term in the support formula is sinusoidal and has no empirical grounding; its oscillations are an artefact.
- The hundred-point caps make the model unable to discriminate among strong projects, which is precisely where the interesting commercial cases live.
- The stochastic sandbox is a single run, not an ensemble, and supports only qualitative reading.

## References

- Redis, Elastic, and MongoDB relicensing announcements and surrounding community discussion, 2018 to 2022.
- The Commons Clause, Server Side Public License, and Business Source License texts and the debates over whether they are open source.
- Hardin, The Tragedy of the Commons (1968), as the standard reference for shared-resource depletion, applied here by analogy to upstream contribution.
- PostgreSQL governance documentation, as the contrasting case of an owner-free project that never relicensed.
