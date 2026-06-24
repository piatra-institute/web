import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'taxonomy-coverage',
        statement: 'The eleven modes of combination (juxtaposition, freedom, action, mutual action, gluing, compatibility, interaction, partial commutativity, quotient collapse, twisting, hierarchical repetition) cover the major product-like constructions in algebra and topology.',
        citation: 'Synthesis from standard references: Mac Lane (Categories for the Working Mathematician), Rotman (Advanced Modern Algebra), Hatcher (Algebraic Topology)',
        confidence: 'contested',
        falsifiability: 'Finding a well-known product construction that cannot be described by any of these eleven modes would require expanding the taxonomy.',
    },
    {
        id: 'four-templates',
        statement: 'Product, coproduct, pullback, and pushout are the four fundamental universal templates from which most other constructions can be derived by adding actions, quotients, or twists.',
        citation: 'Mac Lane, 1971: categorical limits and colimits as the foundation of universal algebra',
        confidence: 'established',
        falsifiability: 'Finding a widely-used product construction that cannot be viewed as a decorated limit or colimit would weaken this claim.',
    },
    {
        id: 'difficulty-ordering',
        statement: 'Difficulty levels (foundational, core, intermediate, advanced) reflect standard curriculum ordering in graduate mathematics.',
        citation: 'Model design choice based on typical textbook sequencing',
        confidence: 'contested',
        falsifiability: 'A student with a different mathematical background might find the ordering unintuitive; difficulty depends on prior knowledge.',
    },
    {
        id: 'field-boundaries',
        statement: 'The four-field partition (group theory, ring/algebra, category theory, topology) is a useful organizational device even though many constructions cross boundaries.',
        citation: 'Standard mathematical classification: most constructions appear in multiple fields',
        confidence: 'contested',
        falsifiability: 'A construction that genuinely resists field classification would reveal the limits of this partition.',
    },
    {
        id: 'counting-exact',
        statement: 'The displayed counts (per-mode totals, the field by mode matrix, filtered list sizes) are exact integer combinatorics over the curated atlas, not estimates or samples.',
        citation: 'Direct enumeration of the products array; verified by the calibration invariants',
        confidence: 'established',
        falsifiability: 'Any count that disagrees with a direct hand tally of the atlas data, or any failing calibration invariant, would falsify this.',
    },
    {
        id: 'duality-pairs',
        statement: 'Product/coproduct and pullback/pushout are genuine categorical dual pairs, so a fact proven for one transfers to the other by reversing all arrows.',
        citation: 'Mac Lane, 1971: limits and colimits are dual notions in any category',
        confidence: 'established',
        falsifiability: 'Exhibiting a property that holds for a limit construction but fails for its formal dual would contradict the duality principle.',
    },
];
