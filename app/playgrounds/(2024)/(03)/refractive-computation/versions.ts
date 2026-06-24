import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'first cut. wraps the granular polycomputation canvas in the scientific template: a pure logic module for the deterministic core (square-root contact law, frequency-modulation factor, NAND truth table, output-correctness check, packing geometry), a calibration that recomputes each predicted value from those functions, six assumptions separating the verifiable contact-and-logic core from the hand-chosen readout and the offline evolution, and a research companion on optical and mechanical analog computation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'logic module: contactNormalForce (F = sqrt(overlap)*k), frequencyFactor (1 + 0.5 sin(2 pi f t)), NAND and nandBit, readChannelBit threshold readout, outputCorrect multiplex check, and grainRadius / packedGrainCapacity geometry.',
            'two vibration channels multiplex two NAND gates through one fixed packing; the output grain reports each gate by thresholding its displacement along one axis.',
            'calibration: six deterministic checks (contact force at a known overlap, zero force without contact, the NAND low row, all-four-rows NAND match, packing-geometry round trip, and a correct multiplexed output), every predicted value recomputed from the logic module.',
            'framing kept honest: the live canvas animates one fixed packing, the genetic-algorithm controls describe an offline search rather than the on-screen dynamics, and the contact-law exponent is flagged as a softened approximation to the Hertz 3/2 power law.',
        ],
    },
];
