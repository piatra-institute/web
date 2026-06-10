import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'coarse-graining-defines-entropy',
        statement:
            'Entropy here is defined relative to a coarse-graining: the cup is binned into a 32-cubed voxel grid and each voxel contributes the binary Shannon entropy of its cream fraction c, H(c) = -[c log2 c + (1-c) log2 (1-c)], particle-weighted. A finer or coarser grid gives different absolute entropy.',
        citation:
            'Boltzmann / Gibbs coarse-grained entropy; Carroll, From Eternity to Here (2010), on entropy as observer-relative.',
        confidence: 'established',
        falsifiability:
            'this is the crux, not a bug: change the grid resolution and the entropy curve shifts. The qualitative monotone rise is robust to the choice; the absolute bits are not.',
    },
    {
        id: 'binary-species',
        statement:
            'Coffee and cream are treated as two indivisible particle species. The concentration c in a voxel is just the cream fraction; there is no continuum of fat globules, temperature, or chemistry.',
        citation:
            'modelling commitment. Real cream is a polydisperse emulsion mixing by molecular diffusion and advection.',
        confidence: 'contested',
        falsifiability:
            'a continuum two-fluid solver would replace the binary count. The rise-and-fall of apparent complexity does not depend on the binary idealisation.',
    },
    {
        id: 'particle-fluid-approximation',
        statement:
            'The fluid is approximated by about sixty thousand particles advected with buoyancy, a soft density and pressure penalty, Brownian diffusion, a stirring vortex, and viscous damping. It is not an incompressible Navier-Stokes solve with a true pressure projection.',
        citation:
            'smoothed-particle-hydrodynamics style scheme; the pressure pass is a local density penalty, not a global projection.',
        confidence: 'contested',
        falsifiability:
            'a grid-based incompressible solver would conserve volume exactly and remove residual compressibility. The mixing phenomenology is preserved.',
    },
    {
        id: 'complexity-metric-choice',
        statement:
            'Apparent complexity is one specific proxy: the mean voxel concentration gradient times the mixedness, averaged over the cup. Only its qualitative shape (rise then fall) is meant to be trusted; its absolute scale is metric-dependent, which is why it is shown as a time-series rather than calibrated to a number.',
        citation:
            'Aaronson, Carroll and Ouellette 2014, arXiv:1405.6903, Quantifying the Rise and Fall of Complexity in Closed Systems.',
        confidence: 'contested',
        falsifiability:
            'a different apparent-complexity measure (compressed file size, structure factor, persistent homology) could shift the peak or its height. The existence of an interior peak should survive.',
    },
    {
        id: 'buoyant-stratification-artistic',
        statement:
            'Vertical layering is enforced by a buoyancy term (coffee sinks, cream floats) plus soft restoring springs that keep each species near a target height. This is a legible stand-in for density-driven stratification, not a first-principles density solve.',
        citation:
            'modelling commitment to keep the unstirred state visually layered like the reference photograph.',
        confidence: 'speculative',
        falsifiability:
            'a real density-and-gravity solve would set the layering from fluid densities. The qualitative pour-and-settle behaviour is what matters here.',
    },
    {
        id: 'closed-system-with-damping',
        statement:
            'The cup is treated as a closed system: nothing enters or leaves except the poured cream, and viscous damping stands in for dissipation. Stirring injects energy that the damping removes.',
        citation:
            'the second law applies cleanly only to closed systems; Carroll uses the closed cup as the canonical example.',
        confidence: 'contested',
        falsifiability:
            'a real cup exchanges heat with its surroundings and cools. Adding an explicit thermal reservoir would change the late-time dynamics, not the entropy-rise story.',
    },
    {
        id: 'statistical-second-law',
        statement:
            'Entropy increase is statistical and typical, not enforced. The coarse-grained entropy can fluctuate downward briefly, especially with few particles per voxel, exactly as Boltzmann predicts.',
        citation:
            'Boltzmann H-theorem and its statistical reading; the second law as overwhelmingly probable, not certain.',
        confidence: 'established',
        falsifiability:
            'large, sustained, spontaneous decreases in coarse-grained entropy would falsify the statistical picture. Only small short-lived dips appear.',
    },
    {
        id: 'stochastic-single-sample',
        statement:
            'Particle positions and the diffusion noise are randomised per run, so two runs of the same preset differ. The metrics shown are single-sample reads of a stochastic process, not deterministic predictions.',
        citation:
            'modelling commitment. The simulation seeds from Math.random at reset.',
        confidence: 'established',
        falsifiability:
            'this is a feature. Averaging many runs would tighten the curves around the same qualitative shape.',
    },
    {
        id: 'screen-space-rendering',
        statement:
            'The liquid surface is reconstructed in screen space (a particle depth map, bilateral smoothing, and a glass overlay). It is a visual approximation of a fluid surface, with no true refraction, caustics, or free-surface tracking.',
        citation:
            'screen-space fluids rendering; van der Laan et al. 2009 and successors.',
        confidence: 'established',
        falsifiability:
            'this only affects appearance, never the metrics, which are computed from particle positions directly.',
    },
];
