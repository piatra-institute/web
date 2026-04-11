import type { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'formal-ontology',
        statement: 'An ontology can be formalized as a tuple O = (C, R, A, I) of categories, relations, axioms, and intended interpretations, making it explicit, comparable, and testable.',
        citation: 'Guarino 1998 \u2014 Formal Ontology in Information Systems; Smith & Welty 2001 \u2014 Ontology: Towards a New Synthesis',
        confidence: 'established' as const,
        falsifiability: 'Falsified if a coherent ontology can be shown to resist all formal representation while remaining useful.',
    },
    {
        id: 'mdl-quality',
        statement: 'Ontology quality can be modeled as a tradeoff between fit (how well it organizes cases) and complexity (how much structure it requires), analogous to Minimum Description Length in model selection.',
        citation: 'Gr\u00FCnwald 2007 \u2014 The Minimum Description Length Principle; Rissanen 1978 \u2014 Modeling by shortest data description',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if a principled ontology evaluation framework is demonstrated that does not involve any form of parsimony-fit tradeoff.',
    },
    {
        id: 'jaccard-redundancy',
        statement: 'Category redundancy is measured by mean pairwise Jaccard overlap between category extensions (the sets of cases each category covers). High overlap suggests the categories are doing nearly the same work.',
        citation: 'Jaccard 1912 \u2014 The distribution of the flora in the alpine zone; standard similarity measure in information retrieval',
        confidence: 'established' as const,
        falsifiability: 'Falsified if categories with high extensional overlap are shown to be consistently non-redundant in their intensional (meaning-based) roles.',
    },
    {
        id: 'axiom-consistency',
        statement: 'Axiom violations (cases that satisfy contradictory constraints) are a meaningful indicator of ontological inconsistency. In OWL/description-logic settings this is formally checkable.',
        citation: 'Baader et al. 2003 \u2014 The Description Logic Handbook; W3C OWL 2 Primer',
        confidence: 'established' as const,
        falsifiability: 'Falsified if ontological inconsistencies are shown to be systematically benign and informative rather than defective.',
    },
    {
        id: 'underdetermination',
        statement: 'An ontology is underdeveloped when its model class is too large \u2014 many incompatible worlds satisfy it. This is the ontological analogue of an underconstrained CAD sketch.',
        citation: 'Stanford Encyclopedia of Philosophy \u2014 Underdetermination of Scientific Theory; Quine 1951 \u2014 Two Dogmas of Empiricism',
        confidence: 'established' as const,
        falsifiability: 'Falsified if all ontologies with large model classes are shown to be equally useful for practical purposes.',
    },
    {
        id: 'overdetermination',
        statement: 'An ontology is overdetermined when marginal structure produces little gain in fit but large gains in complexity, redundancy, or brittleness. Additional categories must earn their keep.',
        citation: 'Model assumption \u2014 extending MDL intuition to ontology design; analogous to overfitting in statistical learning',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if adding categories always improves ontology utility regardless of extensional evidence.',
    },
    {
        id: 'harman-axes',
        statement: 'Undermining (reducing to parts) and overmining (reducing to effects/relations) are orthogonal to the underdeveloped/overdetermined axis. An ontology can be underdeveloped AND overmining, or overdetermined AND undermining.',
        citation: 'Harman 2011 \u2014 The Quadruple Object; Harman 2010 \u2014 Towards Speculative Realism',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if undermining/overmining is shown to fully determine the underdeveloped/overdetermined character of an ontology.',
    },
    {
        id: 'phase-thresholds',
        statement: 'The specific threshold values for phase classification (fit < 0.48, structureLoad > 0.72, etc.) are modeling choices calibrated to produce clear regime distinctions, not empirical constants.',
        citation: 'Model assumption \u2014 thresholds are illustrative, inspired by MDL and ontology engineering practice',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if a principled, non-arbitrary method for setting exact phase boundaries is demonstrated.',
    },
];
