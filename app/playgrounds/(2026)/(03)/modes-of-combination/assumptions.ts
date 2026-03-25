import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'taxonomy-coverage',
        statement: 'The eleven modes of combination (juxtaposition, freedom, action, mutual action, gluing, compatibility, interaction, partial commutativity, quotient collapse, twisting, hierarchical repetition) cover the major product-like constructions in algebra and topology.',
        citation: 'Synthesis from standard algebra and topology references \u2014 Mac Lane (Categories for the Working Mathematician), Rotman (Advanced Modern Algebra), Hatcher (Algebraic Topology)',
        confidence: 'established',
        falsifiability: 'Finding a well-known product construction that cannot be described by any of these eleven modes would require expanding the taxonomy.',
    },
    {
        id: 'four-templates',
        statement: 'Product, coproduct, pullback, and pushout are the four fundamental universal templates from which most other constructions can be derived by adding actions, quotients, or twists.',
        citation: 'Mac Lane, 1971 \u2014 categorical limits and colimits as the foundation of universal algebra',
        confidence: 'established',
        falsifiability: 'Finding a widely-used product construction that cannot be viewed as a decorated limit or colimit would weaken this claim.',
    },
    {
        id: 'difficulty-ordering',
        statement: 'Difficulty levels (foundational, core, intermediate, advanced) reflect standard curriculum ordering in graduate mathematics.',
        citation: 'Model design choice \u2014 based on typical textbook sequencing',
        confidence: 'contested',
        falsifiability: 'A student with a different mathematical background might find the ordering unintuitive; difficulty depends on prior knowledge.',
    },
    {
        id: 'field-boundaries',
        statement: 'The four-field partition (group theory, ring/algebra, category theory, topology) is a useful organizational device even though many constructions cross boundaries.',
        citation: 'Standard mathematical classification \u2014 most constructions appear in multiple fields',
        confidence: 'established',
        falsifiability: 'A construction that genuinely resists field classification would reveal the limits of this partition.',
    },
];
