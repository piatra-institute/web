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
    {
        title: 'Gluing Leviathan: A Local-to-Global Theory of Civilizational Reconstruction',
        date: 'May 2026',
        abstract: 'Civilizations assemble from local rule systems whose interfaces with one another either glue into a coherent macro-order or fail to. This paper formalises the gluing condition. A post-collapse landscape is modelled as a finite cell complex whose vertices are settlements and whose higher cells are the routes, watersheds, debts, and jurisdictions that bind them. To each region we assign a finite space of admissible institutional packages drawn from seven dimensions: property, labor, money, contract enforcement, violence, resource governance, and knowledge retention. A global section of the resulting cellular sheaf is a coherent macro-order; the first cohomology measures the obstruction to one existing globally. Above the compatibility layer sits a dynamical layer whose attractors are the historically recurrent macro-regimes: kin-commons, warlord tribute, neo-feudal land control, monastic redistribution, guild-merchant order, state-command, capitalist market order, and commons federation. A worked three-settlement river system shows that institutional repairs aimed at edges that are not the obstruction shrink the cochain spaces without buying compatibility, the kind of error reformers make routinely. A four-dimensional parameter sweep over violence, transport, energy, and literacy finds that the capitalist attractor wins 3.1% of the parameter cube, while neo-feudal and state-command together win 43.3%. Capitalism\'s stability is a geometric coincidence of low violence, secure transport, abundant energy, and preserved literacy. Reconstruction, on this view, is the engineering of interfaces under a parameter regime that may or may not permit the macro-order being aimed at.',
        pdf: '/papers/gluing-leviathan.pdf',
    },
    {
        title: '1.00115965218: A Stratigraphy of the Electron Magnetic Moment',
        date: 'May 2026',
        abstract: 'The number 1.00115965218 is the experimentally measured value of |g|/2 for the electron, where g is the gyromagnetic ratio. We read this number as historical sediment. Its leading 1 is Dirac\'s 1928 relativistic prediction; its next several digits are Schwinger\'s 1948 one-loop QED correction alpha/(2pi), which agrees with the modern measurement to one part in 660. The digits beyond Schwinger\'s contribution were determined order by order through the QED perturbation series, with the analytic two-loop result of Sommerfield and Petermann (1957), the three-loop analytic result of Laporta and Remiddi (1996), and the five-loop numerical calculation of Aoyama, Hayakawa, Kinoshita and Nio (2012) over 12,672 Feynman diagrams. The final digits of resolution were extracted by single-electron Penning-trap experiments, from Dehmelt\'s geonium spectroscopy through Hanneke, Fogwell and Gabrielse (2008) to Fan, Myers, Sukra and Gabrielse (2023), the current record at 0.13 parts per trillion. The residual uncertainty in the Standard Model comparison is now set by an unresolved 5.5-sigma tension between the 2018 Berkeley caesium-recoil value of the fine-structure constant alpha-inverse = 137.035999046(27) and the 2020 Paris rubidium-recoil value 137.035999206(11); inverting the Fan et al. (2023) measurement under the Standard Model gives alpha-inverse = 137.035999166(15), consistent with Paris at 2.2 sigma and with Berkeley at 3.9 sigma. The two recoil measurements predict a_e to differ by roughly 1.4e-12, an order of magnitude larger than the experimental uncertainty 1.3e-13. The simulation reconstructs the QED series at orders one through five, propagates the hadronic and weak contributions, performs the alpha-inversion of the measurement, and quantifies the Berkeley/Paris/Fan triangle of alpha determinations. The number 1.00115965218 now functions as a metrological instrument that audits the constants and theories that go into predicting it.',
        pdf: '/papers/stratigraphy-electron-moment.pdf',
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
