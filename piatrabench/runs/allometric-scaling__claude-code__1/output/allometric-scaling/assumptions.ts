import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'power-law-form',
        statement:
            'resting metabolic rate follows a power law of body mass, B = B0 * M^a, approximately straight on log-log axes across many orders of magnitude of mass.',
        citation:
            'Kleiber 1932; Savage et al. 2004 (the predominance of quarter-power scaling in biology).',
        confidence: 'established',
        falsifiability:
            'systematic curvature in the log-log relation across the full mass range would mean no single power law holds, only a local approximation.',
    },
    {
        id: 'exponent-steeper-than-two-thirds',
        statement:
            'for mammalian basal metabolic rate the exponent sits closer to 3/4 than to the 2/3 a surface-to-volume argument predicts. this steeper-than-2/3 pattern is the robust empirical claim.',
        citation:
            'White and Seymour 2003; Savage et al. 2004 reanalyses of mammalian BMR datasets.',
        confidence: 'contested',
        falsifiability:
            'a carefully controlled BMR dataset whose confidence interval centres on 2/3 and excludes 3/4 would overturn this.',
    },
    {
        id: 'network-theory-mechanism',
        statement:
            'the specific value 3/4 is explained by West, Brown and Enquist as a consequence of space-filling, fractal-like resource-distribution networks that minimise transport cost.',
        citation:
            'West, Brown and Enquist 1997 (Science): a general model for the origin of allometric scaling laws.',
        confidence: 'contested',
        falsifiability:
            'organisms without branching transport networks that still show a clean 3/4 exponent, or networked organisms that do not, would undercut the mechanism.',
    },
    {
        id: 'single-universal-exponent',
        statement:
            'the playground fits one exponent to a pooled set of animals. in reality the exponent varies between taxa and with metabolic level (birds, ectotherms, and plants differ from placental mammals).',
        citation:
            'Glazier 2005 on the metabolic-level boundaries hypothesis and the diversity of scaling exponents.',
        confidence: 'contested',
        falsifiability:
            'taxon-specific exponents that vary systematically would mean a single universal slope is the wrong model.',
    },
    {
        id: 'basal-metabolic-rate',
        statement:
            'the measured values are basal metabolic rates, taken at rest, thermoneutral, and postabsorptive. field metabolic rate (the rate of a free-living animal) scales with a different coefficient.',
        citation:
            'Nagy 2005 on field metabolic rates of mammals, birds, and reptiles.',
        confidence: 'contested',
        falsifiability:
            'substituting field metabolic rates shifts the coefficient and can shift the exponent, so the conclusion is specific to BMR.',
    },
    {
        id: 'representative-dataset',
        statement:
            'the ten animals are representative, order-of-magnitude literature values chosen to show the pattern legibly, not a curated, peer-reviewed dataset with error bars.',
        citation:
            'standard physiology tables; a modelling simplification for the sandbox.',
        confidence: 'speculative',
        falsifiability:
            'replacing these with a vetted dataset could move the best-fit exponent by a few hundredths and is the right next step for any quantitative claim.',
    },
];
