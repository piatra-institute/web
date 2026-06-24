import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'contact-law-form',
        statement:
            'grain-grain contacts transmit a normal force F = sqrt(overlap) * stiffness, and nothing when grains are not overlapping. this sublinear, square-root contact law is the deterministic core the whole computation rides on.',
        citation:
            'Hertzian contact theory gives F proportional to overlap^(3/2) for spheres; this toy uses a softened sqrt form for legibility and numerical stability.',
        confidence: 'contested',
        falsifiability:
            'real photoelastic granular experiments show a 3/2 power law, not 1/2; swapping the exponent changes the force-chain stiffness, so the precise gate behaviour is law-dependent, not universal.',
    },
    {
        id: 'frequency-multiplexing',
        statement:
            'two logic gates share one medium because each contact is modulated by a frequency-dependent factor 1 + 0.5 sin(2 pi f t). the same grain bends incoming vibration energy differently at different frequencies, the way a medium refracts different wavelengths differently.',
        citation:
            'Parsa, Bongard, Levin and colleagues on universal mechanical polycomputation in evolved granular matter; frequency-multiplexed NAND gates in a single assembly.',
        confidence: 'contested',
        falsifiability:
            'if two channels at nearby frequencies cross-talk so strongly that no evolved packing separates them, the multiplexing claim fails for that frequency pair.',
    },
    {
        id: 'nand-completeness',
        statement:
            'NAND is taken as the target gate because it is functionally complete, so every Boolean circuit can be assembled from NAND alone and a material that robustly computes NAND is in principle a general-purpose logic substrate.',
        citation:
            'Sheffer 1913: the NAND (Sheffer stroke) is a sole sufficient operator for Boolean algebra.',
        confidence: 'established',
        falsifiability:
            'functional completeness is a theorem about ideal gates; it says nothing about whether a noisy granular gate can be cascaded without signal degradation, which is the real engineering question.',
    },
    {
        id: 'threshold-readout',
        statement:
            'the output grain reports a bit per channel by thresholding its displacement: channel one reads the x-displacement, channel two the y-displacement, and a magnitude above 0.1 counts as a logical 1.',
        citation:
            'a modelling choice standing in for a physical readout (a strain gauge or optical pickup at the output grain).',
        confidence: 'speculative',
        falsifiability:
            'the 0.1 threshold and the x/y channel assignment are hand-chosen; a different readout axis or threshold can flip the reported gate, so the decision boundary is not intrinsic to the material.',
    },
    {
        id: 'packing-geometry',
        statement:
            'mean grain radius is set from a target packing fraction by area conservation: phi * A = N * pi * r^2, with phi = 0.64 standing in for random close packing of disks. radii are then jittered by +/- 20 percent.',
        citation:
            'random close packing of equal disks is near phi ~ 0.82 in 2D; phi ~ 0.64 is the classic 3D RCP value used loosely here as a familiar reference.',
        confidence: 'contested',
        falsifiability:
            'the 2D and 3D close-packing fractions differ; using the 3D number for a 2D disk packing means the absolute density label is approximate, though the geometry round-trips exactly.',
    },
    {
        id: 'evolution-is-offline',
        statement:
            'the genetic-algorithm story (generations, mutation rate) describes how a working packing would be discovered offline; the live canvas does not actually run evolution, it animates a single fixed packing and its frequency response.',
        citation:
            'evolved-material polycomputation literature finds gate-performing packings by offline search over grain positions and stiffnesses, not in real time.',
        confidence: 'established',
        falsifiability:
            'if the evolution controls changed the live readout, the playground would claim more than it computes; here they are explicitly framed as describing the offline search, not the on-screen dynamics.',
    },
];
