import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'sheaf-as-frame',
        statement:
            'A sheaf is an appropriate frame for narrative gluing, where local sections correspond to commitments, performances, or readings over partially overlapping situations.',
        citation: 'Mac Lane and Moerdijk 1992 (Sheaves in Geometry and Logic); cited as analogical structure, not formal model',
        confidence: 'speculative',
        falsifiability:
            'A reader who shows that a canonical case (e.g. Odysseus) has no meaningful notion of "local overlap" between episodes would falsify the analogy.',
    },
    {
        id: 'obstruction-class-meaningful',
        statement:
            'The first cohomology class H^1(X, Aut(F)) is a useful informal proxy for the irreducible mismatch between local readings of a single life or work.',
        citation: 'Standard sheaf cohomology; used here metaphorically, following the spirit of constructible-sheaf readings of stratified narratives.',
        confidence: 'speculative',
        falsifiability:
            'A formal counterexample where local readings glue perfectly yet the figure is canonically read as fractured (or vice versa) would falsify this.',
    },
    {
        id: 'six-axis-coverage',
        statement:
            'The six axes (locality, abstraction, desire, institution, trauma, knowledge) are enough to summarise the moral-topological situation of the figures in this set.',
        citation: 'Author selection; informed by Auerbach 1946 (Mimesis), MacIntyre 1981 (After Virtue), Taylor 1989 (Sources of the Self).',
        confidence: 'contested',
        falsifiability:
            'A figure for which the six axes leave the canonical reading unrecoverable (e.g. one dominated by ritual, ecology, or play) would require expanding the basis.',
    },
    {
        id: 'canonical-profile-fairness',
        statement:
            'The canonical axis profile assigned to each figure approximates a consensus scholarly reading, not the implementer\'s preference.',
        citation: 'Calibration table compares model output to a reader-provided expected obstruction.',
        confidence: 'contested',
        falsifiability:
            'A scholarly reading that places a figure (e.g. Dante) far from the canonical profile here would require revising the profile.',
    },
    {
        id: 'local-global-tension-central',
        statement:
            'The absolute difference between locality and abstraction is a dominant driver of obstruction across cases.',
        citation: 'Walzer 1983 (Spheres of Justice); Berlin 1958 (Two Concepts of Liberty); used as orientation.',
        confidence: 'contested',
        falsifiability:
            'A figure with high locality and high abstraction simultaneously, who shows low obstruction, would falsify the central role of their tension.',
    },
    {
        id: 'institution-and-knowledge-glue',
        statement:
            'Institution and knowledge act as containment factors, partially reducing obstruction in the model.',
        citation: 'Olson 1965 (Logic of Collective Action); North 1990 (Institutions). Treated as informal weights.',
        confidence: 'contested',
        falsifiability:
            'A regime with strong institutions and high knowledge that shows high obstruction (e.g. late-Habsburg Vienna in Musil) tests this; the model handles it via the trauma and tension terms, but the test is not clean.',
    },
    {
        id: 'lens-does-not-change-numbers',
        statement:
            'The selected mathematical lens (sheaf, stalk, monodromy, obstruction, derived) frames the reading but does not change the numerical metrics.',
        citation: 'Modeling choice: lenses are interpretive overlays.',
        confidence: 'speculative',
        falsifiability:
            'A user who finds that different lenses produce contradictory but equally well-grounded readings of the same configuration would either confirm the framing or motivate distinct lens-conditioned models.',
    },
    {
        id: 'modernity-pressure-monotone',
        statement:
            'Higher abstraction, institution, and knowledge together index a "modernity pressure" that increases with their average.',
        citation: 'Weber 1905 (The Protestant Ethic); Habermas 1981 (Theory of Communicative Action).',
        confidence: 'contested',
        falsifiability:
            'A counterexample where high abstraction-institution-knowledge corresponds to a clearly non-modern regime (e.g. medieval scholasticism) would weaken the index.',
    },
    {
        id: 'monodromy-twist-via-trauma',
        statement:
            'Trauma plus local-global tension is a reasonable informal proxy for the monodromy twist a subject undergoes around a loop in the narrative base space.',
        citation: 'Caruth 1996 (Unclaimed Experience); LaCapra 2001 (Writing History, Writing Trauma).',
        confidence: 'speculative',
        falsifiability:
            'A trauma-heavy figure who emerges from repetition unchanged (rare) would suggest the twist is decoupled from trauma in some regimes.',
    },
    {
        id: 'model-is-comparative-not-predictive',
        statement:
            'The model is intended for comparative reading across figures and configurations, not for prediction about any specific text or biography.',
        citation: 'Methodological statement.',
        confidence: 'established',
        falsifiability:
            'Treating the obstruction number as a literal property of a text and finding it useless for criticism would correctly falsify the predictive reading, but not the comparative one.',
    },
];
