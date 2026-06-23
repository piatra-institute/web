import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'autocatalytic-core',
        statement:
            'the reaction rules form an autocatalytic set: a C catalyst converts an A substrate into another C (so C regenerates itself), and an F catalyst converts a D substrate into a G. this self-production is the formal heart of the model.',
        citation:
            'autocatalytic-set theory (Kauffman); the regeneration of catalysts is the defining property.',
        confidence: 'established',
        falsifiability:
            'the calibration checks that A + C yields a C and D + F yields a G; a different product table would not be autocatalytic.',
    },
    {
        id: 'autogen-self-repair',
        statement:
            'the "autogen" is a self-bounding, self-repairing capsule: it encloses catalysts, and when disrupted it releases them to rebuild itself. this follows Terrence Deacon\'s proposed autogen, a theoretical construct, not an observed molecule.',
        citation:
            'Deacon, Incomplete Nature (2011); the autogen as a minimal self-repairing system.',
        confidence: 'contested',
        falsifiability:
            'no physical autogen of this kind has been synthesised; the self-repair behaviour is asserted by the simulation rules.',
    },
    {
        id: 'peircean-interpretation',
        statement:
            'reading the autogen\'s uniform self-repair response as an "iconic interpretant" applies Peirce\'s semiotics (icon, index, symbol) to the dynamics. this is an interpretive framing layered on the mechanics.',
        citation:
            'Peirce\'s sign typology, applied here by analogy.',
        confidence: 'speculative',
        falsifiability:
            'the semiotic label is an interpretation; nothing in the simulation tests whether this is "really" meaning.',
    },
    {
        id: 'particle-spatial-sim',
        statement:
            'dynamics are a 2D particle simulation: molecules move with random velocities, bounce off walls, and react when close enough. it is a visual caricature of chemistry, not a kinetic model with real rate constants.',
        citation:
            'implementation as a proximity-based particle system.',
        confidence: 'contested',
        falsifiability:
            'real reaction kinetics depend on concentrations, temperature, and rates this proximity rule ignores.',
    },
    {
        id: 'deterministic-rules',
        statement:
            'although encounters are stochastic, the reaction table and the distance metric are deterministic and exact. those are the parts the calibration checks.',
        citation:
            'the reaction rules and Euclidean distance in the logic module.',
        confidence: 'established',
        falsifiability:
            'the calibration would fail if the distance metric or the product rules deviated from their definitions.',
    },
    {
        id: 'meaning-claim',
        statement:
            'the claim that self-repair constitutes a minimal form of meaning or teleology is a philosophical interpretation (Deacon\'s teleodynamics), not a result the simulation demonstrates.',
        citation:
            'Deacon\'s teleodynamics; a contested interpretation of self-maintaining systems.',
        confidence: 'speculative',
        falsifiability:
            'whether self-maintenance counts as proto-meaning is a conceptual question the dynamics alone cannot settle.',
    },
];
