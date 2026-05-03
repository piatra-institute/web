import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PapersList from './components/PapersList';

import {
    getPapers,
} from './logic';



export const metadata: Metadata = {
    title: 'papers',
    description: 'research papers and publications',

    openGraph: {
        ...defaultOpenGraph,
        title: 'papers · piatra.institute',
        description: 'research papers and publications',
    },
};


const ownPapers = [
    {
        title: 'On Faultization: Pigeonhole Principle. What Perturbation Reveals About Pattern Access Under Irreducible Constraint',
        date: 'March 2026',
        abstract: 'We apply faultization (a systematic regime of morphogenetic perturbation) to the pigeonhole principle reinterpreted as a distributed multi-agent system, asking which patterns from the latent space (Levin, 2026) the system accesses under irreducible constraint. The theoretical minimum overload O_min = m − n is a mathematical truth the system channels without computing. In six of eight experiments every run converges to O_min exactly with zero variance, the strongest evidence we have for pattern-driven dynamics. Perceptual noise produces immediate degradation with no tolerance threshold; misleading holes invert the pattern-seeking mechanism; all four local policies reach identical endpoints despite five-fold differences in process cost.',
        pdf: '/papers/on-faultization-pigeonhole.pdf',
        github: 'https://github.com/piatra-institute/on-faultization-pigeonhole',
    },
    {
        title: 'On Faultization: Generative Pre-Trained Transformer. What Perturbation Reveals About Pattern Access in a Minimal Transformer',
        date: 'March 2026',
        abstract: 'We apply faultization (a systematic regime of morphogenetic perturbation) to a minimal transformer (4-layer, 16-dimensional, 4-head character-level GPT), asking which patterns from the latent space (Levin, 2026) the system accesses. Twelve experiments reveal that the optimization pattern is accessible through radically different interfaces (local loss, partial communication, chimeric assembly), that absent interface components are tolerated while corrupted ones are catastrophic (+0.2% vs +24.8%), and that gradual noise exposure unlocks a stress-tolerance pattern that sudden exposure does not (p = 0.0001, d = −0.227): a free lunch the system receives without the optimizer paying for it.',
        pdf: '/papers/on-faultization-gpt.pdf',
        github: 'https://github.com/piatra-institute/on-faultization-gpt',
    },
    {
        title: 'Epistemic Lensing: A Markov-Blanket Account of Mediated Belief Distortion',
        date: 'April 2026',
        abstract: 'This paper proposes epistemic lensing as a formal concept for describing how mediated information channels deform belief formation. Using a Markov-blanket framing, we distinguish direct environmental evidence from processed informational inputs and define distortion as divergence between the posterior supported by a higher-fidelity channel and the posterior induced by a mediated one. We introduce five distortion operators (attenuation, selection, warping, amplification, recursion) and four families of metrics: information loss, posterior divergence, inferential curvature, and hysteresis. A toy simulation shows how channel structure produces systematic overreaction, underreaction, salience warping, and persistent miscalibration in both individual agents and populations. We extend the framework to populations and introduce posterior shear, focal capture, shadow zones, and narrative gravity wells as collective-level phenomena. The framework reads as a bridge between active inference, information theory, media ecology, and political cognition.',
        pdf: '/papers/epistemic-lensing.pdf',
    },
    {
        title: 'The Invention of the Person: A Genealogy of Stratified Personhood',
        date: 'April 2026',
        abstract: 'The modern Person, the autonomous, rational, rights-bearing individual, is treated in contemporary political and moral thought as a natural category. The argument here treats it as a stratification: a composite assembled over millennia from at least five distinct historical formations. The paper traces those formations in sequence: relational personhood rooted in kinship, ritual, and animism; epic singularization in the narratives of Gilgamesh and Odysseus; juridical personhood as developed in Roman law; interior moral personhood through the innovations of Paul, Augustine, and Boethius; and the autonomous rational subject consolidated by Locke and Kant. The modern individual emerges only when these layers collapse together and are retroactively treated as a single thing. The paper then follows the socialization of this figure through Hegel\'s theory of recognition and its historicization through Foucault\'s genealogy of the subject. The final sections examine the contemporary forces thinning the practical conditions of agency: platform capitalism, algorithmic management, the expansion of legal personhood to non-human entities, neurotechnology. Formal personhood remains intact while its institutional supports thin. The central claim is that personhood, having been assembled, can be disassembled, and that this disassembly proceeds today through the hollowing of institutional supports rather than the erasure of the legal category.',
        pdf: '/papers/invention-of-the-person.pdf',
    },
    {
        title: 'From Object to Protocol: A Genealogy of the Artwork as Specification',
        date: 'May 2026',
        abstract: 'Across the long history of art the locus of the work has migrated, in successive episodes, from the finished object toward the rule-bound specification. The intuition that an artwork is a singular artifact is a late and historically specific configuration; older regimes treated images as ritual instruments, dynastic technologies, devotional interfaces, and workshop products. Conceptual and score-based art relocated the work into the certificate, the score, the instruction. Generative code art added editioned variability through deterministic seeds. Contemporary AI artworks complete the migration: the work resides in an executable package of prompts, reference assets, model recommendations, seeds, and licenses, navigated by a user and realized by a model. We name this form latent score art, formalize a protocol as a substrate-relative, bounded, transferable, editioned, governed specification, and trace the consequences for legal authorship, market structure, and aesthetic ontology.',
        pdf: '/papers/from-object-to-protocol.pdf',
    },
];


export default function Papers() {
    const papers = getPapers();

    return (
        <PapersList
            papers={papers}
            ownPapers={ownPapers}
        />
    );
}
