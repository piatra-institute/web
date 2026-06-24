import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'first cut. extracts the discrete C, P, T symmetry operators implicit in the particle visualisation into a pure logic module: charge conjugation, parity inversion, time reversal as exact involutions, their CPT composition, a CPT scalar invariant, and a linear matter-antimatter asymmetry. adds calibration of the group-theory identities, six assumptions separating the established CPT theorem from the toy violation sliders, and a research companion.',
    },
];


export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'state model: a particle is position, momentum, charge and a matter/antimatter label.',
            'C flips charge and species; P inverts position and momentum; T reverses momentum. each is an exact involution.',
            'CPT defined as C then P then T, with a known analytic image for any reference state.',
            'a CPT scalar invariant (charge times species sign, plus momentum-squared minus position-squared) that the combined operation preserves.',
            'matter-antimatter asymmetry modelled as linear in the CPT-violating parameter, vanishing at exact CPT.',
            'calibration checks the involution and invariance identities against their exact values; assumptions keep the CPT theorem apart from the illustrative violation dials.',
        ],
    },
];
