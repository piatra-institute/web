import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    classifyIgneous,
    classifySedimentary,
    classifyMetamorphic,
} from './logic';


/**
 * The "grammar" of this playground is a set of deterministic decision trees:
 * given a fixed set of diagnostic parameters (silica content, texture, modal
 * mineralogy, grain size, protolith, metamorphic grade, pressure), each
 * classifier returns exactly one rock name. There is no randomness, so the
 * model is fully verifiable: a textbook specimen with known properties must
 * derive to its accepted name.
 *
 * Each calibration case fixes a parameter vector that corresponds to a
 * canonical, named rock from standard petrology references. `predicted` is the
 * boolean outcome (1 = the classifier produced the expected rock id, 0 = it did
 * not), computed live by the classifier rather than hardcoded. `expected` is 1.
 * If any production rule were edited so a known specimen no longer derives to
 * its name, that case would drop to 0 and the error would jump to 100%.
 */
interface ClassifierCase {
    name: string;
    description: string;
    expectedId: string;
    classify: () => string;
}


const CASES: ClassifierCase[] = [
    {
        name: 'granite · felsic plutonic',
        description:
            'SiO2 = 72% with a plutonic (coarse) texture. Above the 70% felsic boundary, quartz + feldspar + mica defines granite.',
        expectedId: 'granite',
        classify: () =>
            classifyIgneous({
                sio2: 72,
                texture: 'plutonic',
                highAlkali: false,
                vesicular: false,
                veryCoarse: false,
                ol: 0,
                opx: 0,
                cpx: 0,
            }).rock.id,
    },
    {
        name: 'basalt · mafic volcanic',
        description:
            'SiO2 = 49% (mafic, 45 to 52%) with a volcanic texture. Rapid surface cooling of basaltic lava yields fine-grained basalt.',
        expectedId: 'basalt',
        classify: () =>
            classifyIgneous({
                sio2: 49,
                texture: 'volcanic',
                highAlkali: false,
                vesicular: false,
                veryCoarse: false,
                ol: 0,
                opx: 0,
                cpx: 0,
            }).rock.id,
    },
    {
        name: 'dunite · ternary endmember',
        description:
            'Ultramafic (SiO2 = 40%) plutonic rock with olivine = 95% of the Ol/Opx/Cpx mode. Crossing the 90% olivine field boundary derives dunite.',
        expectedId: 'dunite',
        classify: () =>
            classifyIgneous({
                sio2: 40,
                texture: 'plutonic',
                highAlkali: false,
                vesicular: false,
                veryCoarse: false,
                ol: 95,
                opx: 3,
                cpx: 2,
            }).rock.id,
    },
    {
        name: 'sandstone · Wentworth sand',
        description:
            'Clastic, sand-sized (0.063 to 2 mm), well-sorted and quartz-rich (not feldspathic). The clastic grain-size rule derives sandstone.',
        expectedId: 'sandstone',
        classify: () =>
            classifySedimentary({
                sedType: 'clastic',
                grainSize: 'sand',
                fissile: false,
                rounded: true,
                glacial: false,
                feldspathic: false,
                poorlySorted: false,
                chemComposition: 'carbonate',
                mgRich: false,
                biogenic: false,
                hotSpring: false,
                organicType: 'plant',
            }).rock.id,
    },
    {
        name: 'limestone · carbonate precipitate',
        description:
            'Chemical sedimentary, carbonate composition, neither Mg-rich nor biogenic nor hot-spring. The carbonate rule defaults to limestone.',
        expectedId: 'limestone',
        classify: () =>
            classifySedimentary({
                sedType: 'chemical',
                grainSize: 'sand',
                fissile: false,
                rounded: true,
                glacial: false,
                feldspathic: false,
                poorlySorted: false,
                chemComposition: 'carbonate',
                mgRich: false,
                biogenic: false,
                hotSpring: false,
                organicType: 'plant',
            }).rock.id,
    },
    {
        name: 'schist · pelitic medium grade',
        description:
            'Pelitic protolith at grade 50 (medium), no contact aureole. The Barrovian sequence places this rock at the schist field (40 to 65).',
        expectedId: 'schist',
        classify: () =>
            classifyMetamorphic({
                protolith: 'pelitic',
                grade: 50,
                pressure: 'medium',
                contact: false,
            }).rock.id,
    },
    {
        name: 'eclogite · high-P mafic',
        description:
            'Mafic protolith at high pressure and grade 85. Deep subduction beyond grade 40 derives garnet + omphacite eclogite.',
        expectedId: 'eclogite',
        classify: () =>
            classifyMetamorphic({
                protolith: 'mafic',
                grade: 85,
                pressure: 'high',
                contact: false,
            }).rock.id,
    },
];


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((c) => {
        const derivedId = c.classify();
        const correct = derivedId === c.expectedId ? 1 : 0;
        return {
            name: c.name,
            description: c.description,
            predicted: correct,
            expected: 1,
            source: `derives "${derivedId}"; canonical name per Philpotts & Ague (2011), Principles of Igneous and Metamorphic Petrology`,
        };
    });
}
