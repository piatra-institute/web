import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PapersList, { type OwnPaper } from './components/PapersList';

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


const ownPapers: OwnPaper[] = [
    {
        title: 'On Faultization: Generative Pre-Trained Transformer. What Perturbation Reveals About Pattern Access in a Minimal Transformer',
        date: 'March 2026',
        abstract: 'We apply faultization (a systematic regime of morphogenetic perturbation) to a minimal transformer (4-layer, 16-dimensional, 4-head character-level GPT), asking which patterns from the latent space (Levin, 2026) the system accesses. Twelve experiments reveal that the optimization pattern is accessible through radically different interfaces (local loss, partial communication, chimeric assembly), that absent interface components are tolerated while corrupted ones are catastrophic (+0.2% vs +24.8%), and that gradual noise exposure unlocks a stress-tolerance pattern that sudden exposure does not (p = 0.0001, d = −0.374): a free lunch the system receives without the optimizer paying for it.',
        pdf: '/papers/on-faultization-gpt.pdf',
        github: 'https://github.com/piatra-institute/papers-on-faultization-gpt',
        topics: ['computer-science'] as const,
        kinds: ['simulation', 'programmatic'] as const,
    },
    {
        title: 'On Faultization: Pigeonhole Principle. What Perturbation Reveals About Pattern Access Under Irreducible Constraint',
        date: 'March 2026',
        abstract: 'We apply faultization (a systematic regime of morphogenetic perturbation) to the pigeonhole principle reinterpreted as a distributed multi-agent system, asking which patterns from the latent space (Levin, 2026) the system accesses under irreducible constraint. The theoretical minimum overload O_min = m − n is a mathematical truth the system channels without computing. In six of eight experiments every run converges to O_min exactly with zero variance, the strongest evidence we have for pattern-driven dynamics. Perceptual noise produces immediate degradation with no tolerance threshold; misleading holes invert the pattern-seeking mechanism; all four local policies reach identical endpoints despite five-fold differences in process cost.',
        pdf: '/papers/on-faultization-pigeonhole.pdf',
        github: 'https://github.com/piatra-institute/papers-on-faultization-pigeonhole',
        topics: ['computer-science', 'mathematics'] as const,
        kinds: ['simulation', 'formal'] as const,
    },
    {
        title: 'Epistemic Lensing: A Markov-Blanket Account of Mediated Belief Distortion',
        date: 'April 2026',
        abstract: 'This paper proposes epistemic lensing as a formal concept for describing how mediated information channels deform belief formation. Using a Markov-blanket framing, we distinguish direct environmental evidence from processed informational inputs and define distortion as divergence between the posterior supported by a higher-fidelity channel and the posterior induced by a mediated one. We introduce five distortion operators (attenuation, selection, warping, amplification, recursion) and four families of metrics: information loss, posterior divergence, inferential curvature, and hysteresis. A toy simulation shows how channel structure produces systematic overreaction, underreaction, salience warping, and persistent miscalibration in both individual agents and populations. We extend the framework to populations and introduce posterior shear, focal capture, shadow zones, and narrative gravity wells as collective-level phenomena. The framework reads as a bridge between active inference, information theory, media ecology, and political cognition.',
        pdf: '/papers/epistemic-lensing.pdf',
        github: 'https://github.com/piatra-institute/papers-epistemic-lensing',
        topics: ['philosophy', 'psychology'] as const,
        kinds: ['formal', 'simulation'] as const,
    },
    {
        title: 'The Invention of the Person: A Genealogy of Stratified Personhood',
        date: 'April 2026',
        abstract: 'The modern Person, the autonomous, rational, rights-bearing individual, is treated in contemporary political and moral thought as a natural category. The argument here treats it as a stratification: a composite assembled over millennia from at least five distinct historical formations. The paper traces those formations in sequence: relational personhood rooted in kinship, ritual, and animism; epic singularization in the narratives of Gilgamesh and Odysseus; juridical personhood as developed in Roman law; interior moral personhood through the innovations of Paul, Augustine, and Boethius; and the autonomous rational subject consolidated by Locke and Kant. The modern individual emerges only when these layers collapse together and are retroactively treated as a single thing. The paper then follows the socialization of this figure through Hegel\'s theory of recognition and its historicization through Foucault\'s genealogy of the subject. The final sections examine the contemporary forces thinning the practical conditions of agency: platform capitalism, algorithmic management, the expansion of legal personhood to non-human entities, neurotechnology. Formal personhood remains intact while its institutional supports thin. The central claim is that personhood, having been assembled, can be disassembled, and that this disassembly proceeds today through the hollowing of institutional supports rather than the erasure of the legal category. Three small computational models accompany the argument: a stratigraphy that dates and orders the nine formations, a composite index in which holding formal support fixed while draining practical support reproduces the unequal thinning of agency, and a recognition network in which concentrating who designs the field collapses reciprocated recognition for the many.',
        pdf: '/papers/invention-of-the-person.pdf',
        github: 'https://github.com/piatra-institute/papers-invention-of-the-person',
        topics: ['philosophy', 'sociology', 'history'] as const,
        kinds: ['genealogy', 'simulation'] as const,
    },
    {
        title: '1.00115965218: A Stratigraphy of the Electron Magnetic Moment',
        date: 'May 2026',
        abstract: 'The number 1.00115965218 is the experimentally measured value of |g|/2 for the electron, where g is the gyromagnetic ratio. We read this number as historical sediment. Its leading 1 is Dirac\'s 1928 relativistic prediction; its next several digits are Schwinger\'s 1948 one-loop QED correction alpha/(2pi), which agrees with the modern measurement to one part in 660. The digits beyond Schwinger\'s contribution were determined order by order through the QED perturbation series, with the analytic two-loop result of Sommerfield and Petermann (1957), the three-loop analytic result of Laporta and Remiddi (1996), and the five-loop numerical calculation of Aoyama, Hayakawa, Kinoshita and Nio (2012) over 12,672 Feynman diagrams. The final digits of resolution were extracted by single-electron Penning-trap experiments, from Dehmelt\'s geonium spectroscopy through Hanneke, Fogwell and Gabrielse (2008) to Fan, Myers, Sukra and Gabrielse (2023), the current record at 0.13 parts per trillion. The residual uncertainty in the Standard Model comparison is now set by an unresolved 5.5-sigma tension between the 2018 Berkeley caesium-recoil value of the fine-structure constant alpha-inverse = 137.035999046(27) and the 2020 Paris rubidium-recoil value 137.035999206(11); inverting the Fan et al. (2023) measurement under the Standard Model gives alpha-inverse = 137.035999166(15), consistent with Paris at 2.2 sigma and with Berkeley at 3.9 sigma. The two recoil measurements predict a_e to differ by roughly 1.4e-12, an order of magnitude larger than the experimental uncertainty 1.3e-13. The simulation reconstructs the QED series at orders one through five, propagates the hadronic and weak contributions, performs the alpha-inversion of the measurement, and quantifies the Berkeley/Paris/Fan triangle of alpha determinations. The number 1.00115965218 now functions as a metrological instrument that audits the constants and theories that go into predicting it.',
        pdf: '/papers/electron-magnetic-moment.pdf',
        github: 'https://github.com/piatra-institute/papers-electron-magnetic-moment',
        topics: ['physics', 'history'] as const,
        kinds: ['historical', 'simulation'] as const,
    },
    {
        title: 'After Economy: Constraint, Price, and the End of the Fiscal World',
        date: 'May 2026',
        abstract: 'Price is a late institutional interface, a derived form of commensuration that arrives after value has already been made consequential. The deeper sequence runs through constraint, patterned flow, cost, allocation, bind, valuation, commensuration, price, money, market, capital, and financial abstraction. Physical systems supply gradients and dissipation; economic language enters there only by analogy. Cells allocate energy, metabolites, membrane gradients, and repair capacity under viability constraints; they have costs and tradeoffs but no prices. Organisms budget energy, attention, immune response, movement, and reproduction. Sensorimotor systems transact with environments before they exchange anything: a ball in flight and a catcher form a temporary field of reciprocal constraint in which action possibilities compete for realization. Human economies stabilize these older structures under social value frames. Gifts create debt without money. Blood compensation creates price without market. States fiscalize grain, land, labor, debt, and bodies before capitalism. Capitalism inherits value, money, markets, and price, subordinates them to accumulation, and treats capitalized price as the privileged public form of value. Financialization extends that move by pricing claims on future income, risk, collateral, volatility, liquidity, and state rescue. The phrase "after economy" can survive only as a precise claim: after the monetary-price form loses its monopoly over the interpretation of value. AI, platforms, ecological accounting, open-source production, public provisioning, carbon budgets, and post-scarcity imaginaries leave allocation intact and shift it into compute, attention, energy, access, reputation, and governance. The problem after economy is the political form taken by allocation after price ceases to appear as ontology. A small allocation model makes the structural claim auditable: undistorted prices reproduce the constraint-optimal allocation exactly, while a speculative markup on finance raises its budget share from 0.02 to 0.26 and costs 8.08 percent of system viability.',
        pdf: '/papers/after-economy.pdf',
        github: 'https://github.com/piatra-institute/papers-after-economy',
        topics: ['economics', 'philosophy'] as const,
        kinds: ['essay', 'simulation'] as const,
    },
    {
        title: 'Before Sapiens: The Hominin Field Before the Surviving Species',
        date: 'May 2026',
        abstract: 'The boundary around *Homo sapiens* is late in the history of human capacities. Fossils from Jebel Irhoud place early members of the clade, or a population close to it, at roughly 315,000 years ago; Omo I gives a minimum age of 233,000 years for eastern Africa. By then, bipedal locomotion, stone-flake production, long-range dispersal, large-animal processing, Acheulean biface manufacture, fire use, wooden weapon production, and extended social learning already had deep histories. Bipedality and stone working reach beyond secure *Homo*. Range expansion, biface manufacture, fire practices, and organic technologies were carried by *Homo erectus*, Neanderthal-lineage populations, Denisovans, *Homo naledi*, *Homo floresiensis*, and poorly resolved regional forms. The sapiens boundary is a taxonomic stabilization inside an older hominin field. The record has the structure of a stratigraphy: upright bodies before large brains, manipulative hands before secure species assignment, tools before modern anatomy, population networks before global replacement. The surviving species inherited this field and narrowed it by outlasting, absorbing, or replacing the other lineages. Read as a stratigraphy of dated capacities, seven of eight precede the Jebel Irhoud boundary and all eight precede Omo I, the deepest by more than four million years.',
        pdf: '/papers/before-sapiens.pdf',
        github: 'https://github.com/piatra-institute/papers-before-sapiens',
        topics: ['biology', 'anthropology', 'history'] as const,
        kinds: ['historical', 'essay'] as const,
    },
    {
        title: 'From Object to Protocol: A Genealogy of the Artwork as Specification',
        date: 'May 2026',
        abstract: 'Across the long history of art the locus of the work has migrated, in successive episodes, from the finished object toward the rule-bound specification. The intuition that an artwork is a singular artifact is a late and historically specific configuration; older regimes treated images as ritual instruments, dynastic technologies, devotional interfaces, and workshop products. Conceptual and score-based art relocated the work into the certificate, the score, the instruction. Generative code art added editioned variability through deterministic seeds. Contemporary AI artworks complete the migration: the work resides in an executable package of prompts, reference assets, model recommendations, seeds, and licenses, navigated by a user and realized by a model. We name this form latent score art, formalize a protocol as a substrate-relative, bounded, transferable, editioned, governed specification, and trace the consequences for legal authorship, market structure, and aesthetic ontology.',
        pdf: '/papers/from-object-to-protocol.pdf',
        github: 'https://github.com/piatra-institute/papers-from-object-to-protocol',
        topics: ['aesthetics', 'philosophy'] as const,
        kinds: ['genealogy', 'essay'] as const,
    },
    {
        title: 'Gluing Leviathan: A Local-to-Global Theory of Civilizational Reconstruction',
        date: 'May 2026',
        abstract: 'Civilizations assemble from local rule systems whose interfaces with one another either glue into a coherent macro-order or fail to. This paper formalises the gluing condition. A post-collapse landscape is modelled as a finite cell complex whose vertices are settlements and whose higher cells are the routes, watersheds, debts, and jurisdictions that bind them. To each region we assign a finite space of admissible institutional packages drawn from seven dimensions: property, labor, money, contract enforcement, violence, resource governance, and knowledge retention. A global section of the resulting cellular sheaf is a coherent macro-order; the first cohomology measures the obstruction to one existing globally. Above the compatibility layer sits a dynamical layer whose attractors are the historically recurrent macro-regimes: kin-commons, warlord tribute, neo-feudal land control, monastic redistribution, guild-merchant order, state-command, capitalist market order, and commons federation. A worked three-settlement river system shows that institutional repairs aimed at edges that are not the obstruction shrink the cochain spaces without buying compatibility, the kind of error reformers make routinely. A four-dimensional parameter sweep over violence, transport, energy, and literacy finds that the capitalist attractor wins 3.1% of the parameter cube, while neo-feudal and state-command together win 43.3%. These shares are facts about the model\'s geometry, not estimates of historical frequency. Capitalism\'s stability is a geometric coincidence of low violence, secure transport, abundant energy, and preserved literacy. Reconstruction, on this view, is the engineering of interfaces under a parameter regime that may or may not permit the macro-order being aimed at.',
        pdf: '/papers/gluing-leviathan.pdf',
        github: 'https://github.com/piatra-institute/papers-gluing-leviathan',
        topics: ['political-science', 'mathematics', 'sociology'] as const,
        kinds: ['formal', 'simulation'] as const,
    },
    {
        title: 'Owned Causality: Constraint Closure, Basin Steering, and the Emergence of Agency from Chemistry',
        date: 'May 2026',
        abstract: 'A causal influence is owned when a persistent organisation produces the constraints that generate it, those constraints steer the organisation\'s future attractor regime, and the resulting regime feeds back into the production of further constraints. The right primitive for agency must be definable without "I" or "self" on the right-hand side, on pain of circularity. The paper assembles a single mathematical object that absorbs ideas from chemical reaction-network theory (Feinberg), chemical organisation theory (Dittrich and Speroni di Fenizio), autocatalytic-set and RAF theory (Kauffman, Hordijk and Steel), closure to efficient causation (Rosen, Hofmeyr), closure of constraints (Moreno, Mossio, Montévil), autopoiesis (Maturana and Varela), semantic closure (Pattee, Hoffmeyer, Kolchinsky and Wolpert), Markov-blanket inference (Friston, Kirchhoff et al.), basin dynamics (Lorenz), and circular causality across levels (Haken). Owned causality is a product of four factors: closure of constraints excludes thermostats; directed information from endogenous perturbations to future macrostate excludes systems mostly pushed by environment; viability gain over a scrambled-constraint counterfactual excludes random internal explosions; mutual information from achieved macrostate to future constraints excludes one-shot influences. The simulation computes the formula on a six-rung agency ladder running a common bistable dynamics. The two rungs with externally specified rules (rock and thermostat) score zero; the four with internal constraint production (flame, RAF, chemoton, organism) score between 2.2e-5 and 2.1e-4. A second simulation traces the handover from an external scaffold to the organism\'s own constraint deployment: directed information from the scaffold falls from a peak of 0.037 to near zero while directed information from endogenous constraints rises to a peak of 0.403, the traces crossing at window 6 of 20, with viability between 0.885 and 1.000. The pathological case is the contrapositive of the same equation. The "I" appears later as a compressed model of recurrent high-owned-causality history.',
        pdf: '/papers/owned-causality.pdf',
        github: 'https://github.com/piatra-institute/papers-owned-causality',
        topics: ['philosophy', 'biology', 'mathematics'] as const,
        kinds: ['formal', 'simulation'] as const,
    },
    {
        title: 'P-JEPA: JEPA Augmentations from Embodied and Causal Mathematics',
        date: 'May 2026',
        abstract: 'The original P-JEPA proposal claimed to extend Joint Embedding Predictive Architectures (JEPA) by replacing the homogeneous target embedding with a sheaf-valued predictive state over a stratified interaction space. That framing was decorative: the implementation computed a posterior-weighted variance, not a coboundary, and the sheaf structure was never wired into a training loop. This revision discards the replacement framing and adopts a plug-in framing instead. JEPA is treated as the working substrate; each piece of embodied or causal mathematics from the original paper is implemented as an auxiliary loss, head, or sampler that can be added to a stock JEPA training loop and ablated. The contribution is the resulting *typology*: which auxiliary losses match which structural assumptions about the data, with toy evidence for directional effects and preregistered evaluation protocols for V-JEPA-scale tests. The toy evidence (5 preregistered hypothesis tests on dishworld, 8 generated JSON artifacts) shows that (i) the obstruction gate in the original paper is a no-op on every reported suite, with the "p_jepa_stack" agent numerically identical to a plain exact value-of-information agent; (ii) value-aware active probing beats entropy probing with paired bootstrap CI [+0.009, +0.017] across 50 deterministic seeds; (iii) the trained intervention encoder is matched within CI [+0.000, +0.005] by a frozen random projection of equal width; (iv) a real cellular sheaf reduces coboundary energy 10× as theory predicts but produces *slightly worse* downstream action choice than the raw cover (CI [−0.005, −0.004]); (v) on a small NumPy JEPA with the auxiliary losses ported as toggleable terms, the viability head shows a positive trend (CI [−0.007, +0.10]) while the bisimulation regularizer at the chosen weight is mis-calibrated and hurts (CI [−0.23, −0.03]). The toy is at its variance limit and these results are *directional* signals for V-JEPA-scale ablation, not quantitative rankings. The paper closes with a priority order for V-JEPA implementation: intervention loss first, composition consistency and active masking next, sheaf consistency on overlapping clips conditional on the H4 boundary, bisimulation with curriculum tuning, viability head last (or first if the downstream is safety-critical). All claims are gated by the results in `docs/HYPOTHESIS_RESULTS.md`.',
        pdf: '/papers/p-jepa.pdf',
        github: 'https://github.com/piatra-institute/papers-p-jepa',
        topics: ['computer-science', 'mathematics'] as const,
        kinds: ['programmatic', 'simulation'] as const,
    },
    {
        title: 'Mixture of Experimenters: Controlled Internal Experiments as a Label-Free Correctness Signal',
        date: 'June 2026',
        abstract: 'The word "expert" in mixture-of-experts is a fossil: a modern expert is a routed feed-forward subnetwork for conditional compute, not something that runs experiments. Taking the older sense seriously, we ask what it would mean for a language model to run an experiment on itself. Recent test-time activation steering does not qualify, because steering pushes the residual stream toward a chosen answer and so presupposes the conclusion. A genuine experiment is answer-agnostic: it intervenes on the evidence a claim depends on, predicts how the output should respond if the claim is grounded, and reads the discrepancy. We make this concrete as a controlled internal experiment, a targeted intervention on the evidence bound to an answer paired with a matched control intervention on evidence that should be irrelevant, whose control-corrected differential measures whether the answer is causally grounded. A mixture of experimenters is a battery of such experiments aggregated into one label-free correctness signal. On an in-context retrieval task with a small transformer whose ground truth is known by construction, in a noisy regime, the aggregated signal separates correct from incorrect answers with AUROC 0.967 (a three-experiment mixture; 0.956 for two), against 0.786 for negative entropy, 0.784 for logit margin, and 0.602 for a supervised correctness probe. The construction transfers to Pythia-160M, reaching AUROC 0.841 against 0.719 for entropy, and it survives finding the evidence by causal attribution rather than being given it (the margin then narrows with attribution quality). The matched control is necessary where the intervention is non-specific (ablation, AUROC +0.016) and inert where it is intrinsically specific (a counterfactual swap), so a control matters exactly when there is generic perturbation-sensitivity to cancel. The finding is that whether an answer survives intervention on its own evidence is a far stronger label-free signal of correctness than how confident the model is.',
        pdf: '/papers/mixture-of-experimenters.pdf',
        github: 'https://github.com/piatra-institute/papers-mixture-of-experimenters',
        topics: ['computer-science'] as const,
        kinds: ['simulation', 'formal'] as const,
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
