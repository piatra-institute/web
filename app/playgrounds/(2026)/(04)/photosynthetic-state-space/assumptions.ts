import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'z-scheme-two-photosystem',
        statement: 'Oxygenic photosynthesis requires two photosystems in series (PSII and PSI) to move electrons from water to NADP+.',
        citation: 'Hill & Bendall, 1960 — Function of the two cytochrome components in chloroplasts; Blankenship, 2021 — Molecular Mechanisms of Photosynthesis, Ch. 7',
        confidence: 'established',
        falsifiability: 'Discovery of an oxygenic phototroph using a single photosystem would refute this.',
    },
    {
        id: 'michaelis-menten-light',
        statement: 'Light response follows a Michaelis-Menten-like saturation curve parameterized by a half-saturation constant.',
        citation: 'Ye, 2007 — A new model for relationship between irradiance and the rate of photosynthesis',
        confidence: 'established',
        falsifiability: 'If light response is consistently non-hyperbolic (e.g., sigmoidal due to cooperative effects), the saturation model would need revision.',
    },
    {
        id: 'npq-photoprotection',
        statement: 'Non-photochemical quenching (NPQ) dissipates excess excitation energy as heat, reducing ROS production at the cost of quantum yield.',
        citation: 'Ruban, 2016 — Nonphotochemical chlorophyll fluorescence quenching: mechanism and effectiveness in protecting plants from photodamage',
        confidence: 'established',
        falsifiability: 'If NPQ is shown to increase ROS under certain conditions (e.g., via incomplete quenching pathways), the simple protective model breaks down.',
    },
    {
        id: 'd1-repair-cycle',
        statement: 'PSII repair via D1 protein turnover is the primary mechanism for recovering from photodamage.',
        citation: 'Aro et al., 1993 — Photoinhibition of Photosystem II: inactivation, protein damage and turnover',
        confidence: 'established',
        falsifiability: 'If alternative repair mechanisms (e.g., chaperone-mediated refolding) dominate D1 turnover in certain organisms, the model overweights one pathway.',
    },
    {
        id: 'cyclic-atp-balance',
        statement: 'Cyclic electron flow around PSI adjusts the ATP:NADPH ratio without producing NADPH, and is increased under stress.',
        citation: 'Munekage et al., 2004 — Cyclic electron flow around photosystem I is essential for photosynthesis',
        confidence: 'established',
        falsifiability: 'If the ATP contribution from cyclic flow is negligible in vivo (e.g., due to proton leakage), the balancing role would be overstated.',
    },
    {
        id: 'ccm-co2-concentration',
        statement: 'Carbon concentrating mechanisms (CCM) in C4 plants and cyanobacteria effectively increase local CO2 at Rubisco.',
        citation: 'Sage, 2004 — The evolution of C4 photosynthesis; Badger & Price, 2003 — CO2 concentrating mechanisms in cyanobacteria',
        confidence: 'established',
        falsifiability: 'If CCMs are shown to be primarily about O2 exclusion rather than CO2 concentration, the model parameter would need reinterpretation.',
    },
    {
        id: 'scalar-assimilation',
        statement: 'Carbon fixation is approximated as a single scalar output combining light capture, CO2 delivery, stress, and repair factors.',
        citation: 'Pedagogical simplification; real models use Farquhar-von Caemmerer-Berry (1980) for C3 or von Caemmerer (2000) for C4',
        confidence: 'speculative',
        falsifiability: 'The scalar proxy conflates processes operating on different timescales. Comparison with FvCB model output under the same parameters would reveal discrepancies.',
    },
    {
        id: 'speculative-nodes',
        statement: 'The three speculative control nodes (adaptive excitonic routing, dynamic thylakoid topology, protonic micro-homeostasis) are not established biological mechanisms.',
        citation: 'No direct precedent; inspired by discussions of quantum coherence in photosynthesis (Engel et al., 2007) and thylakoid membrane dynamics (Kirchhoff, 2019)',
        confidence: 'speculative',
        falsifiability: 'These nodes are clearly marked as speculative. They would become established if experimental evidence demonstrates each mechanism operates in vivo.',
    },
];
