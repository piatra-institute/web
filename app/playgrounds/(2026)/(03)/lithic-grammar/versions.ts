import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. encodes the classification grammars of igneous, sedimentary and metamorphic petrology as three deterministic decision trees over a shared parameter set, with an atlas of 60+ named rocks and a rock-cycle graph. adds calibration of canonical specimens against their accepted names, seven assumptions separating physical boundaries from conventional ones, and a research companion on classification as a formal grammar imposed on continuous geological space.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'igneous grammar: silica percentage partitions ultramafic / mafic / intermediate / felsic, crossed with plutonic vs volcanic texture; an Ol/Opx/Cpx ternary refines ultramafic plutonic rocks.',
            'sedimentary grammar: Wentworth grain size for clastic rocks with fissility / rounding / feldspar / sorting modifiers, plus separate chemical (carbonate / siliceous / evaporite) and organic branches.',
            'metamorphic grammar: protolith crossed with grade and pressure regime, contact metamorphism as an override, producing Barrovian and mafic-pathway sequences.',
            'atlas of 60+ rocks with descriptions, mineralogy and neighbours, plus a rock-cycle graph drawn from curated transformsTo edges.',
            'calibration: seven canonical specimens (granite, basalt, dunite, sandstone, limestone, schist, eclogite) derived live from fixed parameters and checked against their accepted names.',
            'framing kept honest: assumptions mark which classification boundaries are physical (90% olivine), which are committee conventions (63% silica), and which are fuzzy ratios.',
        ],
    },
];
