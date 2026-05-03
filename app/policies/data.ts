import { PolicySectionData } from '@/components/PolicySection';
import { PolicyTimelinePhase } from '@/components/PolicyTimeline';
import { PolicyFAQItem } from '@/components/PolicyFAQ';
import { PolicyCTAAudience } from '@/components/PolicyCTA';
import { PolicyDownloadItem } from '@/components/PolicyDownloads';
import { PolicyDemonstratorData } from '@/components/PolicyDemonstrator';


export interface Policy {
    path: string;
    name: string;
    title: string;
    subtitle?: string;
    tagline?: string;
    date: string;
    status: string;
    description: string;
    pdf?: string;
    pdfLabel?: string;
    bodyNames?: { primary: string; secondary?: string }[];
    executiveSummary: string[];
    sections: PolicySectionData[];
    demonstrator?: PolicyDemonstratorData;
    timeline?: {
        heading?: string;
        phases: PolicyTimelinePhase[];
        footer?: string;
    };
    faq?: PolicyFAQItem[];
    cta?: {
        heading?: string;
        lead?: string;
        audiences?: PolicyCTAAudience[];
        contactEmail?: string;
        contactLabel?: string;
        footnote?: string;
    };
    downloads?: PolicyDownloadItem[];
}


export const policies: Policy[] = [
    {
        path: 'cerb',
        name: 'CERB: Centre Européen de Reprogrammation Biologique',
        title: 'CERB',
        subtitle: 'Centre Européen de Reprogrammation Biologique',
        tagline: 'from atlas to compiler, and keeping what Europe builds',
        date: '2026-04',
        status: 'draft, open for endorsement',
        description: 'proposal for a CERN-class European biology infrastructure that moves research from descriptive atlas-building to programmable control of anatomical form',
        pdf: '/policies/cerb-position-paper.pdf',
        pdfLabel: 'position paper',
        bodyNames: [
            { primary: 'Conseil Européen pour la Reprogrammation Biologique', secondary: 'treaty body' },
            { primary: 'Centre Européen de Reprogrammation Biologique', secondary: 'operating institution' },
        ],
        executiveSummary: [
            'Biology has completed the measurement era. The Human Cell Atlas, HuBMAP, and Bridge2AI have built descriptive maps of the human body at scales unimaginable twenty years ago. What biology has not yet built is the <strong>control</strong> layer: the capacity to take a desired anatomical outcome and return the intervention program required to produce it.',
            'This capacity has a name in the morphogenesis literature: the <strong>anatomical compiler</strong>. It is not a 3D bioprinter. It is a system that communicates goals to cellular collectives, so those collectives build the specified outcome using their own biological machinery.',
            'CERB is the proposed institution that carries this work. Following CERN’s dual-name model, it comprises a <strong>Conseil</strong> (treaty body) and a <strong>Centre</strong> (operating laboratory). It draws on CERN’s governance and corrects CERN’s single greatest failure: the industrial-capture pattern in which European research infrastructure generates platform technology that is then commercialised outside Europe.',
            'The founding treaty therefore embeds six commercialization commitments alongside the scientific mission: IP and spin-out terms with European-headquartered incorporation during incubation; adjacent capital infrastructure combining EIB, sovereign funds, and private European capital; talent retention through cluster proximity; procurement and early-market co-design; standards co-evolution with EMA and CEN/ISO bodies; and open-closed balance (precompetitive open, applied protectable).',
            'The Phase I ask is a CERB preparatory action of €40 to €80 million over 18 months, funded through FP10, led by an ESFRI-linked consortium. Four deliverables: a founding treaty draft, a site-selection and governance proposal, a first benchmark demonstrator with pre-registered success criteria, and a commercialization-governance blueprint.',
        ],
        sections: [
            {
                id: 'the-moment',
                title: 'The moment',
                paragraphs: [
                    'Biology has spent a generation building instruments and reading cells. The effort has succeeded. We now have reference maps of human cells across organs, tissues, and developmental stages. We have spatial atlases that locate cell types within three-dimensional tissue architecture. We have perturbation-response databases, lineage-tracing records, and structured omics at scales unimaginable twenty years ago.',
                    'Biology cannot yet reliably do what other engineering disciplines take for granted. It cannot reliably take a desired anatomical outcome, compute the intervention required to produce it, and then produce it. A surgeon can repair a wound. A developmental biologist cannot yet specify a regenerated digit with the confidence an engineer specifies a bridge. A clinician can prescribe chemotherapy. A physician cannot yet instruct a tumour to rebuild itself as healthy tissue.',
                    'The gap is not a gap in knowledge alone. It is a gap in the institutions that translate knowledge into control. This is a proposal to close that gap, and to do so in a way that keeps what Europe builds.',
                ],
            },
            {
                id: 'what-we-have',
                title: 'What we already have',
                paragraphs: [
                    'Three flagship efforts anchor the current descriptive era. The <strong>Human Cell Atlas</strong>, founded in 2016, spans more than 3,900 researchers across more than 100 countries with a shared objective: a comprehensive reference map of every cell type in the human body. <strong>HuBMAP</strong>, funded by the United States National Institutes of Health, builds high-resolution three-dimensional spatial maps at single-cell resolution. <strong>NIH Bridge2AI</strong> standardises AI-ready biomedical data for downstream model training.',
                    'In Europe, EMBL, ESRF, ELIXIR, Euro-BioImaging, and INFRAFRONTIER provide instrument access and data infrastructure that smaller member states could not fund nationally.',
                    'None of these programmes is yet a compiler. They tell us what cells and tissues are. They do not yet tell us, with generality, how to rewrite them.',
                ],
            },
            {
                id: 'what-we-lack',
                title: 'What we still lack',
                paragraphs: [
                    'The term <strong>anatomical compiler</strong> appears in the morphogenesis literature to describe a system that takes a target anatomical outcome as input and returns an intervention program as output. The concept is not a three-dimensional bioprinter, which assembles structure externally. It is a system that communicates goals to cellular collectives, so those collectives, using their own biological machinery, build the specified outcome.',
                    'A working compiler would accept inputs such as: return this organoid to wild-type lumen geometry; close this epithelial wound without scarring; rebuild this nerve segment; push this tumour organoid toward a non-invasive architecture. It would return outputs such as: a ranked intervention program (which signalling molecules, in what order, at what doses, alongside which mechanical or bioelectric perturbations, with what timing), an expected trajectory of anatomical state over time, an uncertainty estimate, fallback plans if a checkpoint fails, and a set of monitoring metrics.',
                    'This is not science fiction. It is not a problem any existing lab or consortium is built to solve alone. The compiler requires simultaneous progress across domains that today sit in separate institutions. A single lab produces fragments. A shared infrastructure produces a compiler.',
                ],
            },
            {
                id: 'why-new-institution',
                title: 'Why a new institution',
                paragraphs: [
                    'The compiler cannot be an extension of atlas programmes, because their organising question is descriptive and their governance is aligned with description. Turning HCA into a compiler platform would distort HCA’s mission and under-serve compiler-specific priorities. The atlas programmes should be preserved, not repurposed.',
                    'It cannot be scattered national labs, because the problem is infrastructural. No single country can fund the full perturbation-foundry, validation-platform, and model-registry stack required. National labs can contribute nodes; only a multinational framework integrates them.',
                    'It cannot be industry alone, because the precompetitive phase is long, uncertain, and requires open standards. Pharmaceutical and biotech firms will eventually be the commercial beneficiaries, but they cannot underwrite the twenty-year foundational work.',
                    'What is required is an institution designed for long horizons, shared instruments, open standards, benchmark discipline, and the integration of scientific and political legitimacy. That description is the definition of a CERN-class research infrastructure.',
                ],
            },
            {
                id: 'cern-right-model',
                title: 'CERN as the right model',
                paragraphs: [
                    'CERN works. Since 1954, it has delivered results that no single member state could have delivered alone: the W and Z bosons, the Higgs boson, antihydrogen, and a continuous stream of high-energy-physics advances. Its member states contribute according to negotiated shares; its scientific council is independent of national governments; its instruments are shared across a global user community.',
                    'CERN’s success does not depend on physics being special. It depends on the governance: a treaty-grade legal foundation, long-term member-state commitments, independent scientific direction, shared capital infrastructure, open data and open publication norms, and a culture that treats shared instrumentation as first-class science.',
                    'Biology in 2026 is structurally where physics was in 1950. There are capable national institutes, strong theory, and growing data. There is no institution built at the scale the next phase requires.',
                ],
            },
            {
                id: 'cern-wrong-model',
                title: 'CERN as the wrong model',
                paragraphs: [
                    'CERN produced the World Wide Web. In 1989, Tim Berners-Lee, a CERN staff member, proposed hypertext over the internet to manage particle-physics collaboration. In 1993, CERN released the Web into the public domain. Within fifteen years, the Web had restructured the global economy.',
                    'Almost none of the resulting companies are European. Google, Amazon, Meta, Cloudflare, Stripe, Shopify, OpenAI, Nvidia, Apple, Microsoft: American. TSMC, Samsung, Tencent, Alibaba: Asian. Europe produced the protocol; the United States and Asia captured the industry.',
                    'This is a pattern, not a one-off failure. The same structure repeats in later European research contributions: parts of mobile telephony, parts of cryptography, parts of clean energy. European precompetitive research generates platform technology; private capital in other jurisdictions captures the industrial layer.',
                    'CERB must be designed to break this pattern. A biology compiler, when it works, will be thousands of times more consequential than the Web. The Web rearranged information; the compiler rearranges living matter. A CERB that hands the compiler stack to non-European commercial ecosystems would be a scientific success and a civilisational failure on a scale Europe has not yet experienced.',
                ],
            },
            {
                id: 'what-makes-cerb-different',
                title: 'What makes CERB different',
                paragraphs: [
                    'Six commercialization-governance commitments are proposed as non-negotiable elements of the founding treaty.',
                    '<strong>IP and spin-out terms.</strong> Platform technologies are licensable on open terms for precompetitive use. Applied and translational technologies enter a structured spin-out process with European-headquartered incorporation as the default during an incubation period. Spin-outs that relocate headquarters outside Europe during incubation forfeit preferential licensing terms.',
                    '<strong>Adjacent capital infrastructure.</strong> The founding treaty requires the creation of a co-located financing layer combining European Investment Bank, member-state sovereign funds, national development banks, and private European capital. Researchers trained at CERB should not have to emigrate for Series B funding.',
                    '<strong>Talent retention through cluster proximity.</strong> CERB sites and nodes are chosen in proximity to existing European biotech clusters (Basel, Cambridge UK, Leiden, Genoa, Dublin, Berlin-Brandenburg, Copenhagen), not greenfield locations chosen for political symmetry.',
                    '<strong>Procurement and early markets.</strong> European public healthcare systems are the natural early customer for CERB-derived therapies and devices. EU procurement rules for cross-border health-technology assessment and coordinated adoption are co-designed with CERB from the start.',
                    '<strong>Standards co-evolution.</strong> The European Medicines Agency and CEN/ISO standards bodies are embedded in CERB governance from Phase 0. Whichever jurisdiction builds the regulatory frameworks for morphogenetic-control therapies first becomes the default jurisdiction for the industry.',
                    '<strong>Open-closed balance.</strong> Precompetitive research stays open, as at CERN, HCA, and HuBMAP. The applied and translational layer requires protectable IP, or European firms cannot compete with well-capitalised counterparts elsewhere.',
                ],
            },
            {
                id: 'phase-i',
                title: 'Phase I: the preparatory action',
                paragraphs: [
                    'We propose a CERB preparatory action of €40 to €80 million over 18 months, funded through FP10, led by an ESFRI-linked consortium of member-state research organisations.',
                    'The preparatory action delivers four Phase-I products: a founding treaty draft in CERN-Convention style, reviewed by international legal counsel; a site-selection and governance proposal covering hub-and-node distribution, member-state contribution formula, voting rules, and hosting arrangements; a first benchmark demonstrator running at two or three participating labs on a bounded morphogenetic-control task with pre-registered success criteria; a commercialization-governance blueprint translating the six commitments above into operational detail.',
                    'Each deliverable is reviewed publicly before the preparatory action closes. The transition from preparatory action to founding Convention depends on all four deliverables clearing independent review, and on at least eight member states declaring intention to participate in the Convention negotiation that follows.',
                ],
            },
            {
                id: 'why-now-why-europe',
                title: 'Why now, why Europe',
                paragraphs: [
                    '<strong>Reference maps exist.</strong> The compiler has a descriptive substrate to work from, which did not exist a decade ago.',
                    '<strong>Theory is maturing.</strong> Morphogenesis research is increasingly formulated in terms of dynamical mechanisms and multi-scale causal structure, bridging molecular and physical scales. This is the correct abstraction level for compiler-style planning.',
                    '<strong>The engineering agenda is visible.</strong> Synthetic morphogenesis, bioelectric interfaces, and organoid engineering have moved from novelty to tractable benchmark systems. The compiler concept is no longer only aspirational; it is testable.',
                    'The political conditions matter as much. FP10 is being negotiated through 2026 and 2027. ESFRI’s roadmap updates in 2027. Europe is re-examining its research-sovereignty posture in response to United States and Chinese investments across AI, semiconductors, and biotechnology. The next decade will set the default jurisdiction for a technology whose industrial weight may exceed the Web’s. Europe either designs this institution or inherits whatever other jurisdictions build.',
                ],
            },
            {
                id: 'call',
                title: 'Call',
                paragraphs: [
                    'We ask the European Commission, specifically DG RTD, to include a CERB preparatory-action line in the FP10 proposal. We ask the European Parliament, specifically the ITRE committee, to support this line through inter-institutional negotiation. We ask ESFRI to consider CERB for the 2027 roadmap update as a concurrent channel.',
                    'We ask mid-size member states (Portugal, Netherlands, Czechia, Greece, Denmark, Finland, Ireland, Romania, among others) to declare founding-coalition intent. We ask large member states (France, Germany, Spain, Italy) to join as participating nodes, without attempting to capture governance.',
                    'We ask the scientific community, particularly the morphogenesis, bioelectricity, organoid, and spatial-omics communities, to commit to a shared benchmark programme. We ask European patient-advocacy and clinical-research communities to articulate the downstream clinical stakes.',
                    'Biology is at the beginning of its control era. Europe has twenty years of descriptive infrastructure and a well-documented pattern of losing industrial downstream to other jurisdictions. CERB is the proposal that takes the control era and keeps it.',
                ],
            },
        ],
        demonstrator: {
            heading: 'benchmark demonstrator',
            intro: [
                'A €2B infrastructure is not funded on a slogan. A concrete, small-scale demonstrator showing the compiler idea working on a bounded task is the single most important Phase-0 deliverable. Without one, CERB reads as philosophy; with one, the brief has a fundable benchmark to point at.',
                'Three audiences need persuasion, and each is persuaded by something different. Scientists are persuaded by benchmarks that beat published baselines on tasks they recognise. Policymakers are persuaded by "we already did the small version, now we need the infrastructure for the large one." Industry and clinicians are persuaded by outcomes that could plausibly become therapies. A good CERB demonstrator satisfies all three.',
            ],
            criteriaHeading: 'five criteria, all required',
            criteria: [
                {
                    title: 'Narrow',
                    description: 'one anatomical system, one intervention modality stack, one measurable endpoint. Not "optimise morphogenesis in general."',
                },
                {
                    title: 'Benchmarkable',
                    description: 'a published baseline exists using expert-heuristic or trial-and-error methods. The demonstrator matches or beats it using a compiler-style approach.',
                },
                {
                    title: 'Measurable',
                    description: 'a numeric improvement on a pre-registered metric. Not "produces biologically interesting results."',
                },
                {
                    title: 'Failure-visible',
                    description: 'when the approach fails, it fails cleanly. A negative result is a publishable outcome, not a moving goalpost.',
                },
                {
                    title: 'Multi-lab replicable',
                    description: 'at least 2 to 3 labs can run the same task with comparable results. A single-lab result is interesting; a multi-lab benchmark is a field.',
                },
            ],
            candidatesHeading: 'recommended Phase-0 demonstrators',
            candidates: [
                {
                    role: 'primary',
                    name: 'Organoid pattern repair',
                    task: 'given an organoid with a known developmental defect (incorrect lumen geometry, failed axis specification), apply a compiler-derived intervention program to restore wild-type-equivalent morphology.',
                    substrate: 'gastric, intestinal, or neural organoids with published defect-induction protocols.',
                    metric: 'pattern-fidelity score by segmentation and geometric analysis, against published heuristic-rescue baselines, n ≥ 30 replicates per condition.',
                    why: 'tractable in-vitro, low ethics overhead, existing benchmarks, directly relevant to regenerative-medicine audiences.',
                },
                {
                    role: 'parallel',
                    name: 'Planarian axis reprogramming',
                    task: 'reproduce published bioelectric induction of two-headed or two-tailed planarians using a compiler-derived intervention schedule rather than an expert-designed one. Demonstrate equal or better success rate with fewer interventions.',
                    substrate: 'Schmidtea mediterranea, the standard planarian model.',
                    metric: 'target-morphology success rate per trial; intervention-count efficiency. Baseline: published Levin-group protocols.',
                    why: 'publicly legible striking imagery (the two-headed worm), direct connection to the intellectual lineage CERB cites, media-friendly.',
                },
            ],
            note: 'Combined demonstrator budget: €900k to €2M over 18 to 24 months, funded externally (Wellcome, Novo Nordisk Foundation, EMBO, EMBL member-state channel, or national research councils). Funded downstream of Phase-0 coalition formation, upstream of the FP10 preparatory-action submission. Pre-registration published before any wet-lab work begins.',
        },
        timeline: {
            heading: 'timeline',
            phases: [
                {
                    phase: 'Phase 0: Proposal and coalition formation',
                    dates: '2026-2027',
                    milestones: [
                        'Position paper published',
                        'Technical whitepaper drafted with external authorship',
                        'First coalition endorsements across academic science, research-infrastructure leadership, and mid-size-member-state science councils',
                        'First benchmark demonstrator funded and initiated (organoid pattern repair; planarian axis reprogramming in parallel)',
                        'Draft Convention articles begun with external legal counsel',
                        'Informal briefings with DG RTD, ITRE, and ESFRI',
                    ],
                },
                {
                    phase: 'Phase I: Preparatory action',
                    dates: '2028-2029',
                    milestones: [
                        'FP10 preparatory action awarded (€40 to €80 million over 18 months) or fallback via 2027 ESFRI roadmap',
                        'Secretariat handover from piatra to a neutral coordinating body',
                        'Four Phase-I deliverables completed and independently reviewed',
                        'First Letter of Intent discussions with candidate founding member states',
                    ],
                },
                {
                    phase: 'Phase II: Treaty negotiation',
                    dates: '2030-2031',
                    milestones: [
                        'Letter of Intent signed by 8 to 10 member states',
                        'Formal intergovernmental treaty negotiation opens',
                        'Site selection finalised',
                        'Founding contribution formula agreed',
                        'Scientific programme for Phase III drafted by the incoming Scientific Policy Committee',
                    ],
                },
                {
                    phase: 'Phase III: Ratification and build-out',
                    dates: '2032-2033',
                    milestones: [
                        'Convention drafted and signed by founding member states',
                        'National ratifications proceed',
                        'Director-General of the Centre appointed',
                        'Site preparation begins at the primary hub',
                        'Staff recruitment opens',
                    ],
                },
                {
                    phase: 'Phase IV: Provisional operation',
                    dates: '2034-2035',
                    milestones: [
                        'Provisional CERB structure operates under the Convention',
                        'First node opens; first flagship benchmark suite published',
                        'First commercial spin-outs structured under the Commercialization Office',
                        'First commercial licences to European-headquartered entities',
                        'First regulatory-framework co-design projects with EMA and CEN/ISO bodies',
                    ],
                },
                {
                    phase: 'Phase V: Full operation',
                    dates: '2036 onward',
                    milestones: [
                        'Additional nodes open per the governance plan',
                        'Benchmark programme expands from Phase-0 demonstrators to a broader suite of morphogenetic-control tasks',
                        'Translational-medicine pipeline matures',
                        'First CERB-derived therapies enter clinical-adjacent testing through European health systems',
                    ],
                },
            ],
            footer: 'CERB is a real institution when four things are simultaneously true: a signed Convention deposited with a depositary state; an appointed Director-General in post at a named site; a first operational node receiving researchers and producing published work; a first-year budget disbursed from member-state contributions.',
        },
        faq: [
            {
                question: 'Isn\'t this just another atlas consortium?',
                answer: 'No. Atlas programmes (Human Cell Atlas, HuBMAP, Bridge2AI) produce descriptive maps: what cells and tissues are, where they are, how they differ. CERB\'s organising question is different: given a desired anatomical outcome, what intervention program produces it? Atlases are the substrate a compiler reads from; the compiler is the layer above. CERB is proposed in complement to existing atlas programmes, not in competition with them.',
            },
            {
                question: 'Why not let EMBL or ELIXIR do this?',
                answer: 'EMBL\'s remit is molecular biology, broadly construed. ELIXIR\'s is life-science data infrastructure. Both are excellent institutions with specific mandates that would be distorted by absorbing a compiler programme. The compiler requires tight integration of morphogenesis theory, perturbation foundries, modelling, validation benchmarks, regulatory engagement, and commercialization governance on a scale that maps cleanly to a new institution and awkwardly onto either existing one. CERB is designed to collaborate with EMBL and ELIXIR, not duplicate them.',
            },
            {
                question: 'What about bioethics concerns?',
                answer: 'The founding treaty explicitly excludes whole-organism human embryo manipulation, human germline modification, and any other category the Ethics Council designates as out of scope. Phase I work is bounded to in-vitro systems (organoids, wound-closure assays) and established model organisms with standard ethical oversight. A named Ethics Council, seated from Phase 0, advises the Conseil and the Director-General and publishes summaries of its deliberations. Bioethics is a governance design priority, not a critique to be deflected.',
            },
            {
                question: 'How will this be funded?',
                answer: 'Phase I (the preparatory action) is funded through FP10 at €40 to €80 million over 18 months, fallback via the 2027 ESFRI roadmap. Phases II and III (founding treaty and first operational node) are funded by member-state contributions under the Convention, on CERN\'s contribution-formula precedent. A co-located financing layer combining EIB, member-state sovereign funds, national development banks, and private European capital is required by the treaty to support translational and spin-out activity. The 10-year operating envelope is estimated at €2.5 to €4 billion total across member-state contributions.',
            },
            {
                question: 'Why Europe, and why now?',
                answer: 'Three scientific conditions coexist in 2026: reference maps of human cells now exist; morphogenesis theory is maturing into dynamical-systems and multi-scale causal frameworks; and the engineering agenda (synthetic morphogenesis, bioelectric interfaces, organoid engineering) has moved from novelty to tractable benchmark work. Three political conditions coincide: FP10 is in negotiation through 2026-2027, ESFRI\'s roadmap updates in 2027, and Europe is re-examining its research-sovereignty posture. The next decade will set the default jurisdiction for a technology whose industrial weight may exceed the Web\'s.',
            },
            {
                question: 'How is CERB different from a US or Chinese equivalent?',
                answer: 'No US or Chinese equivalent yet exists with compiler-style framing. NIH Bridge2AI standardises AI-ready biomedical data. DARPA has adjacent programmes. None articulates the compiler as the organising objective, and none has treaty-level governance or commercialization provisions of the kind CERB proposes. If a US or Chinese equivalent is announced, CERB\'s political argument shifts (sovereignty, industrial complement), but the scientific argument remains the same: Europe builds the institution that integrates the pieces into a compiler.',
            },
            {
                question: 'What is a "benchmark demonstrator" and why does it matter?',
                answer: 'A demonstrator is a bounded scientific task that tests the compiler idea on a small, concrete problem with a published baseline and pre-registered success criteria. The leading candidate is <strong>organoid pattern repair</strong>: given a developmental defect in a gastric, intestinal, or neural organoid, use a compiler-derived intervention program to restore correct morphology, and compare the result to published expert-heuristic rescue protocols. A parallel candidate is <strong>planarian axis reprogramming</strong>, reproducing published bioelectric-induction results with a compiler-designed intervention schedule. Without a demonstrator, CERB is philosophy. With one, the case for infrastructure investment becomes concrete.',
            },
            {
                question: 'Why the two-name structure, Conseil and Centre?',
                answer: 'CERN\'s founding history distinguished between the treaty body that governs the organisation and the laboratory that operates the research. CERB uses the same distinction: the <strong>Conseil Européen pour la Reprogrammation Biologique</strong> is the intergovernmental governing body, and the <strong>Centre Européen de Reprogrammation Biologique</strong> is the operating scientific institution. The two-name structure makes the governance distinct from the laboratory, which aligns decision-making authority with political accountability and scientific direction with the Centre\'s Director-General.',
            },
            {
                question: 'What happens if FP10 does not carry a CERB line?',
                answer: 'Fallback is the 2027 ESFRI roadmap update. Different audience, different funding mechanism, different timeline; the coalition and the position paper remain intact. If both FP10 and ESFRI miss, the proposal is preserved for the next framework programme cycle while the scientific demonstrators continue to mature. A mature demonstrator and a standing coalition are more durable than a single funding window.',
            },
            {
                question: 'Who is proposing this, and why Piatra . Institute?',
                answer: 'Piatra . Institute is an independent research institute. Its role in CERB is limited to Phase 0: producing the intellectual framing, drafting the position paper and governance blueprint, identifying and approaching the founding coalition, and coordinating the Phase-0 secretariat function. At Phase I, piatra hands coordination to a neutral formal secretariat (a large European research organisation or a purpose-built body) and steps back to an intellectual-contributor role. This is the small-institute catalyst pattern: start the fire, then pass it on. CERN\'s own founding ran through UNESCO and the European Cultural Conference, not through any single national institute.',
            },
        ],
        cta: {
            heading: 'how to engage',
            lead: 'Endorsements received before the position paper\'s formal publication are incorporated as signatories. Feedback that changes the substance of the proposal is publicly credited in the revised draft.',
            audiences: [
                {
                    label: 'Scientists and research institutions',
                    description: 'endorsement of the position paper, feedback on the technical whitepaper outline, interest in participating in benchmark demonstrators.',
                },
                {
                    label: 'Member-state science councils and ministries',
                    description: 'expressions of interest in the founding coalition, Letter-of-Intent conversations ahead of Phase I.',
                },
                {
                    label: 'Philanthropic and industry funders',
                    description: 'demonstrator-funding conversations (Wellcome, Novo Nordisk Foundation, EMBO, EMBL member-state channel, national research councils).',
                },
                {
                    label: 'Patient advocacy and civil society',
                    description: 'articulation of downstream clinical stakes; bioethics-framework input for the Ethics Council.',
                },
                {
                    label: 'Journalists and researchers wanting more detail',
                    description: 'press-kit materials include boilerplate, quotable descriptions at multiple lengths, and key facts for writing about CERB.',
                },
            ],
            contactEmail: 'cerb@piatra.institute',
            contactLabel: 'contact',
        },
        downloads: [
            {
                label: 'Position Paper (PDF)',
                href: '/policies/cerb-position-paper.pdf',
                description: 'the full case. From atlas to compiler, and keeping what Europe builds.',
            },
            {
                label: 'Phase-I Brief (PDF)',
                href: '/policies/cerb-phase-i-brief.pdf',
                description: 'the specific-ask document addressed to DG RTD, ITRE, and ESFRI. Line item, envelope, deliverables, fallback, signatories. Draft for comment; released before formal submission.',
            },
            {
                label: 'Executive Summary (PDF)',
                href: '/policies/cerb-executive-summary.pdf',
                description: 'the position paper distilled to a single page for time-poor readers.',
            },
            {
                label: 'Benchmark Demonstrator Concept (PDF)',
                href: '/policies/cerb-demonstrator.pdf',
                description: 'the bounded scientific task (organoid pattern repair, planarian axis reprogramming) that makes the compiler fundable. Pre-registration criteria and candidate evaluation.',
            },
            {
                label: 'Draft Convention Articles (PDF)',
                href: '/policies/cerb-treaty-articles-draft.pdf',
                description: 'first draft of six core Convention articles in CERN-Convention style, flagged for external legal review. Articles on the Commercialization Office and IP/Spin-outs are the distinguishing features.',
            },
            {
                label: 'Technical Whitepaper Outline (PDF)',
                href: '/policies/cerb-whitepaper-outline.pdf',
                description: 'structure and authorship plan for the 30-page peer-reviewed paper, for scientific reviewers and candidate authors.',
            },
            {
                label: 'Press Kit (PDF)',
                href: '/policies/cerb-press-kit.pdf',
                description: 'boilerplate, quotable descriptions at multiple lengths, and key facts for journalists.',
            },
            {
                label: 'Endorsement Response Template (PDF)',
                href: '/policies/cerb-endorsement-template.pdf',
                description: 'for recipients who wish to express support before formal submission. Specifies tiers, attribution preferences, and what signing commits to. Copy fields into an email reply or submit a signed PDF.',
            },
        ],
    },
    {
        path: 'romania-to-embl',
        name: 'Romania → EMBL Membership Roadmap 2026-2030',
        title: 'Romania → EMBL',
        subtitle: 'Accession Roadmap, 2026-2030',
        tagline: 'Building Romanian biomedical capacity inside European research infrastructure',
        date: '2026-03',
        status: 'roadmap published; execution under way',
        description: 'staged roadmap for Romania\'s accession to the European Molecular Biology Laboratory over 2026-2030, framed as a capacity-building commitment anchored in multi-year legislation.',
        pdf: '/policies/romania-to-embl-roadmap.pdf',
        pdfLabel: 'roadmap',
        executiveSummary: [
            'EMBL, the European Molecular Biology Laboratory, is the continent\'s flagship infrastructure for molecular biology, structural biology, spatial omics, sequencing, and graduate-level life-sciences training. Romania\'s accession over 2026-2030 gives Romanian scientists membership-level access to that infrastructure, and positions Romanian biomedical research alongside the European mainstream.',
            'The roadmap names four phased milestones: prospect-status application in 2026, associate membership in 2027, scientific-readiness build-out through 2028-2029, full membership in 2030. Each year carries a specific ask of the Ministry of Finance, a specific legislative commitment, and a specific scientific-community deliverable.',
            'The decisive work is Romanian-internal. The primary venues are the Ministry of Finance (the line item), the Cabinet (the political commitment), Parliament (ratification and multi-year legal anchoring), and the Romanian scientific community (readiness planning). The EMBL Council reviews accession applications on its own schedule; the application it reviews is what Romania prepares domestically.',
            'Stakes for Romania: talent retention and diaspora return, biotech-cluster formation around the research infrastructure, clinical-research sophistication, European scientific credentialing, and a seat on the EMBL Council once full membership is reached. Every year of delay accumulates cost as continuing talent drain.',
            'If full-member status proves unreachable by 2030, the fallback is to preserve associate-member status as a durable intermediate. Associate status delivers most of the training and circulation benefits; full membership adds voting rights and deeper programmatic integration.',
        ],
        sections: [
            {
                id: 'romanian-stake',
                title: 'Romania\'s stake in accession',
                paragraphs: [
                    'EMBL membership is a capacity-building instrument, not a prestige line. For Romania, it means direct access to instruments (cryo-EM, structural biology, spatial omics, high-throughput sequencing), training programmes, PhD pipelines, and credentialing networks that shape biomedical research, translational medicine, and biotech sectors for decades.',
                    'The decisive work is Romanian-internal. The Ministry of Finance holds the line item. The Cabinet holds the political commitment. Parliament ratifies the accession instrument and, ideally, anchors the multi-year commitment in law so it survives government change. The Romanian scientific community (Academy, universities, institutes) prepares the readiness case. These are the venues where the roadmap moves or stalls.',
                    'The EMBL Council reviews accession applications on its own schedule. What it reviews is what Romania prepares and submits. The roadmap\'s timing is set by Romanian budget cycles, parliamentary sessions, and the EMBL Council\'s quarterly review cadence, in that order.',
                ],
            },
            {
                id: 'what-embl-membership-delivers',
                title: 'What EMBL membership delivers for Romania',
                paragraphs: [
                    '<strong>Talent retention and circulation.</strong> EMBL membership means Romanian PhD students access EMBL\'s international training; postdocs access EMBL stations; returning researchers have a credential ladder that anchors them at home rather than abroad. Without membership, Romanian scientific diaspora continues one-way.',
                    '<strong>Infrastructure that cannot be nationally replicated.</strong> Cryo-EM facilities, structural-biology beamtime, large-scale sequencing instruments, spatial-omics platforms. National-scale equivalents are not financially feasible for a country of Romania\'s size. Multilateral access is the only route.',
                    '<strong>Biotech cluster seeding.</strong> Biomedical start-ups and mid-stage biotech companies form near training and research infrastructure. EMBL membership is a cluster catalyst, not a prestige line in a government press release.',
                    '<strong>Clinical research sophistication.</strong> Teaching hospitals and clinical research centres benefit from proximity to basic-research infrastructure. EMBL membership indirectly upgrades Romanian clinical-trial and translational-research capacity.',
                    '<strong>Scientific credentialing in Europe.</strong> Accession is a signal to peers, funders, and European programmes that Romania is a science-mainstream member state, not a peripheral participant. This matters for horizontal programmes (Horizon, FP10, ERC) where national-level scientific status shapes funding flows.',
                    '<strong>Reversal of the second-tier default.</strong> Without EMBL membership, Romania defaults to second-tier scientific status within Europe. Accession breaks that default. The failure case is not "stays neutral"; it is "slips backward relative to peers."',
                ],
            },
            {
                id: 'venues-and-deciders',
                title: 'Venues and deciders',
                paragraphs: [
                    'The decider is the Romanian government. <strong>MCID</strong> (the Ministry of Research, Innovation, and Digitalization) signs the national application and holds the line item. The <strong>Ministry of Finance</strong> approves the multiannual financial commitment and is, in practice, the most important single veto point. The <strong>Ministry of Foreign Affairs</strong> handles the intergovernmental signing. <strong>Parliament</strong> ratifies the accession instrument and, ideally, anchors the commitment in law so it survives government change. The <strong>Prime Minister\'s office</strong> typically endorses at the Cabinet level given the multi-year commitment.',
                    'The <strong>EMBL Council</strong> is the gatekeeper that approves the application at its own pace, quarterly review cycles. The Council is not the lever that moves; it is the gate that opens once Romania delivers a credible financial commitment and scientific-readiness demonstration.',
                    'Allies include the Romanian Academy of Sciences, leading Romanian life-sciences research institutes and universities, Romanian scientists already affiliated with EMBL stations or with EMBL alumni networks, patient-advocacy and health-research NGOs that benefit from improved biomedical research infrastructure, and Romanian-nationality members of the European Parliament on ITRE or ENVI committees.',
                ],
            },
            {
                id: 'what-romania-commits',
                title: 'What Romania commits',
                paragraphs: [
                    'A multi-year financial contribution scaled to national GDP, on the order of several million euros per year, rising with full-member status. The commitment is ratified in law rather than renegotiated annually, to protect the roadmap across government changes. A dedicated law or framework commitment, once passed, is harder to reverse than an annual budget-line change and survives ordinary government transitions.',
                    'Parallel investment in national life-sciences research capacity (universities, institutes, teaching hospitals) so that Romania meets scientific-readiness benchmarks on schedule. Coordination with the Academy and institute directors begins in 2026 Q2 and continues through the readiness build-out period.',
                    'A published annual progress brief that creates public accountability across electoral cycles. The brief documents what was committed, what was delivered, what moved, and what remains. Without it, the default trajectory is drift; with it, drift becomes visible.',
                ],
            },
            {
                id: 'what-romania-gains',
                title: 'What Romania gains',
                paragraphs: [
                    'Access to EMBL\'s instruments and training programmes for Romanian scientists, without the prohibitive capital cost of building national equivalents. A seat on the EMBL Council once full membership is reached, contributing Romanian priorities to EMBL\'s own strategy. A structured pathway for Romanian scientific diaspora to return with continuity of collaboration rather than as a step down in research access.',
                    'Upgraded biomedical-research capacity for Romanian universities, teaching hospitals, and clinical research centres. Proximity to basic-research infrastructure that improves translational-research sophistication over the following decades. Seeding of Romanian biotech clusters around the training and research infrastructure.',
                    'European scientific credentialing. Accession signals to peers, funders, and European programmes that Romania is a science-mainstream member state, which shapes funding flows in horizontal programmes (Horizon, FP10, ERC) where national-level scientific status matters.',
                ],
            },
            {
                id: 'risks-of-delay',
                title: 'Risks of delay',
                paragraphs: [
                    'Government change deprioritising accession is the primary risk. Mitigation is bipartisan groundwork now: written endorsements from both coalition and opposition research committees in Parliament, and a multi-year financial commitment anchored in dedicated legislation rather than in annual budget decisions.',
                    'Budget trimming during fiscal pressure is a secondary risk. Mitigation is the same legislative anchoring, plus explicit coordination with the Ministry of Finance on the multi-year framework during the annual budget cycle.',
                    'EMBL Council slow-walking the application can happen if Romania\'s readiness demonstration is incomplete. Mitigation is direct relationship-building with the Director-General\'s office and with member-state delegates, plus visible Romanian scientific deliverables during the prospect period.',
                    'Scientific-capacity gaps at milestone dates are addressable by parallel investment. If capacity is not ready at 2030, the fallback is to preserve associate-member status and continue building.',
                    'The roadmap-to-reality gap is the underlying risk all the others share: a roadmap is a document; reality is a budget line, a ratified treaty, and a Council decision. Each year\'s progress brief forces a public accounting of which of those have happened.',
                ],
            },
        ],
        timeline: {
            heading: 'timeline',
            phases: [
                {
                    phase: 'Phase A: Application',
                    dates: '2026',
                    milestones: [
                        'Prospect-status application submitted to EMBL',
                        'First budget-line commitment in the annual budget law',
                        'Parliamentary briefing; bipartisan endorsement secured',
                        'First annual progress brief drafted for 2027 Q1 publication',
                    ],
                },
                {
                    phase: 'Phase B: Prospect to Associate',
                    dates: '2027',
                    milestones: [
                        'EMBL Council review; readiness demonstration presented',
                        'Associate-member status granted (target)',
                        'National life-sciences capacity plan finalised and published',
                        'Second budget-line commitment in the 2028 annual budget',
                        'First annual progress brief published; parliamentary accountability hearing',
                    ],
                },
                {
                    phase: 'Phase C: Readiness build-out',
                    dates: '2028-2029',
                    milestones: [
                        'Scientific-readiness checkpoints against full-member criteria',
                        'National investment in cryo-EM, spatial-omics, sequencing, training infrastructure',
                        'Romanian scientists at EMBL stations; EMBL scientists at Romanian institutes',
                        'Clinical-research-centre partnerships with EMBL-affiliated translational programmes',
                        'Annual progress briefs 2028 and 2029; mid-term roadmap review',
                    ],
                },
                {
                    phase: 'Phase D: Full membership',
                    dates: '2030',
                    milestones: [
                        'Associate-to-full-member transition: Council review; full-member status granted if readiness met',
                        'Romanian seat on EMBL Council',
                        'Final annual progress brief; closeout of the 2026-2030 roadmap',
                        'Romanian scientific status within Europe: mainstream member state',
                    ],
                },
                {
                    phase: 'Fallback: Associate as durable intermediate',
                    dates: 'if 2030 unreachable',
                    milestones: [
                        'Preserve associate-member status',
                        'Continue readiness build-out on a revised timeline',
                        'Annual progress briefs continue; commitment remains in law',
                        'Associate status delivers the majority of training, circulation, and credentialing benefits',
                    ],
                    note: 'Associate membership is the floor; full membership is the strategic goal.',
                },
            ],
            footer: 'Romania is an EMBL full member when four things are simultaneously true: a ratified accession instrument deposited with EMBL; a Romanian Council delegate in post; Romanian scientists active at EMBL stations and EMBL scientists active at Romanian institutes; a multi-year contribution line anchored in Romanian law, surviving at least one government transition.',
        },
        faq: [
            {
                question: 'How much does EMBL membership cost, and who pays?',
                answer: 'EMBL member-state contributions are negotiated with the Council and scaled to national GDP and scientific capacity. For a country of Romania\'s size, the annual contribution is on the order of several million euros per year, rising with full-member status. The payer is the Ministry of Finance, via an MCID line item, subject to parliamentary ratification in the annual budget law. The financial envelope should be anchored in a multi-year framework rather than renegotiated annually, to protect the commitment across government changes.',
            },
            {
                question: 'Isn\'t this fiscal room that could go to more pressing priorities (healthcare, education, defence)?',
                answer: 'The money spent on EMBL membership is not in competition with primary healthcare, school reconstruction, or border defence at the ministry level; it is research-infrastructure spending that upgrades the scientific base healthcare and defence eventually rest on. The same argument applied to Romanian accession to EU structural-research programmes, to Romanian participation in ESA, and to Romanian cooperation with CERN. The comparator is not "spend on hospitals instead" but "spend on a foreign scientific agency alone" (ineffective) versus "spend on a multilateral infrastructure that returns instrument access, training, and credentialing at scale" (effective).',
            },
            {
                question: 'Why not seek cheaper alternatives, such as associate membership at CERN or CEEPUS-level arrangements?',
                answer: 'Romania already participates in CERN and in regional CEEPUS programmes. These do not overlap with EMBL\'s remit. EMBL provides molecular-biology and life-sciences infrastructure (cryo-EM, structural biology, spatial omics, sequencing, organoid facilities, PhD training in those areas) that CERN, ESA, and CEEPUS do not. Choosing one does not substitute for another. The relevant comparison is "EMBL member state" versus "not an EMBL member state," not "EMBL" versus "some other non-biological infrastructure."',
            },
            {
                question: 'Does this require giving up national sovereignty over scientific priorities?',
                answer: 'No. EMBL members retain full sovereignty over their national research priorities and funding decisions. Membership gives Romanian scientists access to EMBL infrastructure and programmes; it does not give EMBL authority over Romanian research strategy. Romania also gains a seat on the EMBL Council, meaning Romanian priorities contribute to EMBL\'s own strategy.',
            },
            {
                question: 'What happens if the government changes mid-roadmap?',
                answer: 'Government-formation cycles will almost certainly intervene between 2026 and 2030. The mitigation is bipartisan groundwork now: securing written endorsements from both coalition and opposition research committees in Parliament, and anchoring the multi-year financial commitment in law rather than in annual budget decisions alone. A dedicated law or framework commitment, once passed, is harder to reverse than a budget-line change and survives ordinary government transitions.',
            },
            {
                question: 'Can Romania meet EMBL\'s scientific-readiness criteria by 2030?',
                answer: 'Scientific readiness is a parallel track running alongside the financial commitment. National life-sciences research capacity (universities, institutes, teaching hospitals) needs targeted investment during 2026-2029 to meet full-member criteria by 2030. The roadmap assumes this investment happens in coordination with the Romanian Academy and institute directors. If it does not, the fallback is associate-member status, which delivers most of the training and circulation benefits without requiring the same readiness level.',
            },
            {
                question: 'What does "associate membership" actually mean compared to full membership?',
                answer: 'Associate membership grants Romanian scientists access to EMBL training programmes, PhD positions, conference participation, and instrument access at EMBL stations, at a reduced contribution level. It does not grant Council voting rights or deep programmatic integration. Full membership adds voting rights, fuller participation in EMBL strategic decisions, and preferential access to flagship programmes. For most Romanian biomedical capacity-building purposes, associate membership is sufficient. Full membership is the strategic goal; associate is the floor if full proves unreachable.',
            },
            {
                question: 'How does Romanian scientific diaspora benefit?',
                answer: 'Diaspora return is one of the central stakes. EMBL membership creates a structured pathway for Romanian scientists abroad to return to Romania with continuity of collaboration: they can continue using EMBL instruments from Romanian institutes, apply for EMBL-affiliated positions domestically, and participate in EMBL training without relocation. Without membership, returning is a step down in research access; with membership, returning is competitive. The diaspora becomes a resource rather than a leakage.',
            },
            {
                question: 'What happens to Romanian patients and the Romanian healthcare system?',
                answer: 'The benefits to patients are indirect but real. Romanian teaching hospitals and clinical research centres gain proximity to basic-research infrastructure, upgrading clinical-trial capacity, translational-research sophistication, and access to cutting-edge diagnostic and therapeutic pipelines. EMBL membership is not a direct healthcare intervention, but it upgrades the scientific base on which Romanian healthcare institutions draw over the following decades.',
            },
            {
                question: 'Why does this roadmap matter, if Romania could negotiate these steps without a public document?',
                answer: 'A published roadmap creates public accountability. It names dates, milestones, and commitments so the government and Parliament can be held to them across electoral cycles. It lets the scientific community, diaspora, and journalists track progress without depending on inside information. Without the roadmap, the default trajectory is drift: commitments slip quietly, government changes reset the work, and the 2030 window closes without accession. The roadmap is the instrument that makes drift visible.',
            },
        ],
        cta: {
            heading: 'how to engage',
            lead: 'The decision is primarily Romanian-internal. Engagement from Romanian government, Parliament, the scientific community, diaspora, and civil society shapes whether the 2026-2030 window delivers on its milestones.',
            audiences: [
                {
                    label: 'Romanian ministries and Parliament',
                    description: 'briefing requests, Letter-of-Intent conversations, budget-cycle coordination, parliamentary-question and ratification work.',
                },
                {
                    label: 'Romanian Academy, universities, life-sciences institutes',
                    description: 'endorsement, readiness-planning input, annual-progress-brief contributions, EMBL-readiness investment coordination.',
                },
                {
                    label: 'Romanian scientific diaspora and EMBL alumni',
                    description: 'support for the credentialing and talent-return arguments; ambassadorship within EMBL member-state networks; co-signatories on public endorsements.',
                },
                {
                    label: 'Patient-advocacy and health-research organisations',
                    description: 'articulation of the biomedical-capacity stakes for Romanian patients and the healthcare system; bioethics-framework input.',
                },
                {
                    label: 'Journalists and researchers wanting more detail',
                    description: 'press-kit materials include boilerplate, quotable descriptions at multiple lengths, and key facts for writing about the roadmap.',
                },
            ],
            contactEmail: 'romania-to-embl@piatra.institute',
            contactLabel: 'contact',
        },
        downloads: [
            {
                label: 'Roadmap 2026-2030 (PDF)',
                href: '/policies/romania-to-embl-roadmap.pdf',
                description: 'the authoritative roadmap document. Romania\'s staged accession to EMBL, 2026-2030.',
            },
            {
                label: 'Executive Summary (PDF)',
                href: '/policies/romania-to-embl-executive-summary.pdf',
                description: 'the roadmap distilled to its stakes and phased asks, for time-poor readers.',
            },
            {
                label: 'Frequently Asked Questions (PDF)',
                href: '/policies/romania-to-embl-faq.pdf',
                description: 'anticipated Romanian-audience objections (fiscal cost, sovereignty, sectoral priorities, parliamentary continuity, associate vs. full membership) with answers.',
            },
            {
                label: 'Public Timeline (PDF)',
                href: '/policies/romania-to-embl-timeline.pdf',
                description: 'the 2026-2030 phased arc rendered for public audiences, with milestones per phase.',
            },
            {
                label: 'Press Kit (PDF)',
                href: '/policies/romania-to-embl-press-kit.pdf',
                description: 'boilerplate, quotable descriptions at multiple lengths, and key facts for Romanian and European science journalists.',
            },
        ],
    },
    {
        path: 'open-adas-dacia',
        name: 'Open ADAS Dacia: openpilot for the post-2026 Dacia range',
        title: 'Open ADAS Dacia',
        subtitle: 'An Open-Source Engineering Offer for the Post-2026 Dacia Range',
        tagline: 'openpilot for Dacia, engineered in Romania, published open source',
        date: '2026-05',
        status: 'draft, open for endorsement',
        description: 'Piatra . Institute proposes to engineer and publish, under an open-source licence, an openpilot port supporting the post-2026 Dacia range (Sandero, Logan, Duster, Bigster, the upcoming Striker), in exchange for managed engineering access from Renault Group and Dacia and operational cooperation from a Romanian fleet partner.',
        pdf: '/policies/open-adas-dacia-position-paper.pdf',
        pdfLabel: 'position paper',
        executiveSummary: [
            'Renault Group has a problem it cannot solve on its own and an opportunity it has not yet taken. The problem: grey-market openpilot ports happen anyway. comma.ai\'s openpilot supports more than 300 cars across 30+ manufacturers; whenever a commercially interesting model becomes a target, a port is attempted regardless of whether the manufacturer authorised it. Each unauthorised port is a UN Regulation No. 155 conformance risk, an insurance risk, a regulatory risk, and a reputational risk. The opportunity: the first major manufacturer that authorises a managed-access third-party openpilot port captures category leadership in open driver-assistance software at zero cash outlay.',
            'Piatra . Institute proposes to be the Romanian engineering counterparty that makes that move possible. The institute does the engineering, holds the safety case, carries the cybersecurity discipline, interlocutes with the Romanian Auto Register (RAR) on the regulatory framework, and publishes the result under its own attribution. Renault Group provides managed engineering access on terms appropriate to its UN R155 cybersecurity-management-system posture. A Romanian fleet operator (Autonom or peer) provides vehicles, operational data, and insurance framework, in exchange for first deployment of the port across its Dacia fleet.',
            'The institute does not request cash funding from any party. The institute funds its own running costs through ordinary Romanian state research grants. Long-term sustainability comes from revenue arrangements that the institute negotiates separately, when the deployment ecosystem matures: hardware-kit royalties, licensed safety-stack components, service revenue, or co-developed hardware with the manufacturer. The port itself remains open source under an Apache 2.0 / MIT-family licence regardless of the revenue form.',
            'The deliverable is staged across the post-2026 Dacia vehicle family. Bigster first as the proof of platform compatibility. CMF-B platform extension to Sandero, Logan, Duster, and the upcoming Striker, with platform-level abstractions so that family-level support is the natural extension rather than a separate project. Open-source publication under Piatra . Institute\'s attribution, intended to land in the openpilot mainline as the supported configuration for the Dacia platform.',
            'The institute is supported, on documented contribution scopes, by Romanian technical universities (UTC Cluj-Napoca, Politehnica Bucharest, TU Iași), by RAR as regulatory interlocutor, by the Romanian Academy\'s technical-sciences section as institutional reviewer, and by the Romanian fleet partner. Each supporting institution has a defined contribution and a defined return. None is a peer of the institute on the engineering work, by design. The institute is the principal entity. The dossier is the institutional shape that makes the offer credible to the manufacturer, the regulator, the insurer, and the open-source community.',
        ],
        sections: [
            {
                id: 'the-proposition',
                title: 'The proposition',
                paragraphs: [
                    'Piatra . Institute proposes to engineer and publish, under an open-source licence, an openpilot port that supports the post-2026 Dacia range (Sandero, Logan, Duster, Bigster, the upcoming Striker), in exchange for managed engineering access from Renault Group and Dacia and operational cooperation from a Romanian fleet partner. No cash funding from the manufacturer is requested. The institute keeps the right to negotiate, separately and later, a revenue share on hardware kits, devices, or licensed safety-stack components built around the port.',
                    'The institute writes the code. The institute does the safety and cybersecurity work. The institute publishes the result openly, under its own attribution. The manufacturer authorises specific engineering operations under documented terms; the fleet partner provides vehicles, data, and insurance framework. Nobody writes the institute a cheque; the institute earns its long-run sustainability from the work itself, through the revenue arrangements that follow when openpilot-on-Dacia begins to ship as a product.',
                ],
            },
            {
                id: 'why-this-is-the-right-move',
                title: 'Why this is the right move for Dacia and Renault Group',
                paragraphs: [
                    'Renault Group has a problem it cannot solve on its own and an opportunity it has not yet taken. The problem is that grey-market openpilot ports happen anyway. comma.ai\'s openpilot supports more than 300 cars across 30+ manufacturers; whenever a Dacia or Renault model becomes commercially interesting enough to motivate community work, a port will be attempted regardless of whether the manufacturer authorised it. Each unauthorised port is a UN R155 conformance risk for the manufacturer, an insurance risk for the driver, a regulatory risk for the type-approval authority, and a reputational risk for everyone in the chain.',
                    'The opportunity is to lead instead of resist. The first major manufacturer that authorises a managed-access third-party openpilot port captures category leadership in open driver-assistance software at zero cash outlay. That manufacturer becomes the example regulatory authorities cite when they discuss how third-party automotive software should integrate with European cybersecurity rules. That manufacturer earns goodwill from the open-source automotive community of a kind no advertising budget produces.',
                    'Dacia is positioned for that move better than any other manufacturer in Europe. The post-2026 range shares the CMF-B platform, so a port engineered for one model generalises across the family at platform level. Mioveni manufactures more Dacia vehicles than at any time in its history. Romania has the engineering talent, the regulatory interlocutor (RAR), and an institute (Piatra) with the case to make the offer credible. The window is the next two years.',
                ],
            },
            {
                id: 'the-ask',
                title: 'The ask',
                paragraphs: [
                    '<strong>Primary ask, to Renault Group and Dacia: managed engineering access</strong> on terms appropriate to the manufacturer\'s UN R155 cybersecurity-management-system posture. The form of access can be any of the standard mechanisms a mature manufacturer makes available to a credible research partner: a test or development electronic control unit; signed diagnostic certificates; engineering CAN documentation under non-disclosure agreement; hardware-in-the-loop or simulator interfaces; proving-ground-only authorisation; or a managed gateway access mechanism. The institute is not asking for production cryptographic keys; the no-key-extraction commitment is contractually binding.',
                    '<strong>Fallback ask: documentation and minimal cooperation.</strong> If managed access proves too sensitive at this point in the relationship, the institute requests engineering CAN documentation under NDA at platform level, a single point of technical contact at Dacia engineering, and a non-objection to passive logging on owned and fleet vehicles. Even at this minimum, the institute can do useful work and produce useful outputs.',
                    '<strong>Ask to a Romanian fleet partner: in-kind contribution</strong> of vehicles, operational data, and insurance framework. No cash. The fleet operator gets, in return, first commercial deployment of the openpilot port across its Dacia fleet, differentiated capability that no peer fleet operator has during the head-start period, and a long-term partnership with the institute.',
                    'The institute does not ask Renault Group, Dacia, the fleet operator, or the Romanian state for cash funding on behalf of the manufacturer. Engineering access is the scarce resource and the appropriate currency. Cash funding would convert the relationship into contract research, constrain open-source publication, complicate the institute\'s institutional independence, and slow the work.',
                ],
            },
            {
                id: 'the-deliverable',
                title: 'The deliverable',
                paragraphs: [
                    '<strong>Bigster first.</strong> Bigster is the proof of platform compatibility. Current production, the first Dacia C-segment vehicle, offered with factory lane-keeping and (in hybrid versions) with adaptive cruise. The Bigster port is the technical anchor of the programme.',
                    '<strong>CMF-B platform extension.</strong> Sandero, Logan, Duster, the upcoming Striker. The platform is shared, and a Bigster port written with platform-level abstractions extends across the family with vehicle-specific calibration rather than full re-engineering. The institute commits to platform-level abstractions in the engineering work so that the family-level port is the natural extension.',
                    '<strong>Open-source publication.</strong> Apache 2.0 / MIT in the openpilot-ecosystem-compatible family, under Piatra . Institute\'s attribution. The port is intended to land in the openpilot mainline as the supported configuration for the Dacia platform. Manufacturer-confidential material is kept confidential; the institute publishes its own engineering work.',
                    '<strong>Documentation and the safety case.</strong> Alongside the code, the institute publishes the safety and cybersecurity documentation appropriate to UN R155, ISO 26262, and ISO/SAE 21434 conformance. The documentation is the credibility infrastructure that distinguishes the institute\'s port from a community port.',
                ],
            },
            {
                id: 'the-future-revenue-model',
                title: 'The future revenue model',
                paragraphs: [
                    'The institute does not request cash funding. The institute does intend to negotiate, separately and later, revenue arrangements that support its long-term sustainability from the work that follows the port. The form is a function of how the deployment ecosystem develops.',
                    '<strong>Hardware-kit royalties.</strong> A device manufacturer (Romanian or otherwise) building hardware kits that pair with the port and run the openpilot stack on Dacia vehicles. The institute negotiates a royalty per unit, in proportion to the institute\'s contribution to the kit\'s design and software stack.',
                    '<strong>Licensed safety-stack components.</strong> Specific safety-critical components of the institute\'s engineering (the watchdog, the driver-takeover protocol implementation, the safety case template) licensed to other parties under terms that fund the institute\'s continuing work.',
                    '<strong>Service revenue.</strong> Calibration, integration, regulatory-conformance support, or training services provided by the institute to fleet operators or to third parties deploying the port.',
                    '<strong>Co-developed hardware.</strong> A Renault- or Dacia-branded hardware kit, sold through Renault dealers or through Dacia\'s normal commercial channels, with a revenue-share between the institute and the manufacturer in proportion to the institute\'s contribution.',
                    'Whichever form develops, the principle is that the port itself remains open source, the revenue attaches to value-added components or services around the port, and the institute\'s share funds its continuing work as one of the Romanian institutional anchors of the open-driver-assistance ecosystem.',
                ],
            },
            {
                id: 'technical-realism',
                title: 'Technical realism: the five stages',
                paragraphs: [
                    '<strong>Stage 1. Read-only and passive logging.</strong> Owned or fleet Bigster vehicles, ASOS-licensed diagnostic tools, passive CAN logging during normal driving. Output: Bigster ADAS feature matrix, CMF-B bus-topology report, logged corpus that supports every later stage. Feasible without manufacturer cooperation.',
                    '<strong>Stage 2. Bus mapping and stock-ADAS decoding.</strong> Determination of where the relevant signals sit on the vehicle\'s bus architecture; comparison to nearby Renault and Dacia architectures to confirm what is platform-shared.',
                    '<strong>Stage 3. Authentication audit.</strong> A documented determination of whether actuator commands use rolling counters and checksums (tractable) or cryptographic authentication under Secure Onboard Communication (requires manufacturer cooperation). The result determines what kind of access is essential for the port to land.',
                    '<strong>Stage 4. Simulator and hardware-in-the-loop prototyping.</strong> The closed-loop control-algorithm prototype layer, where the safety architecture, the watchdog logic, the driver-takeover protocol, and the fault containment mechanism are developed.',
                    '<strong>Stage 5. Closed-course active control.</strong> The first real port, on a small fleet of test vehicles operating on a closed course, under documented safety case and ISO 26262 conformance. The output is the first usable Dacia openpilot port. Public-road compatibility is the natural extension once the closed-course validation is complete and the regulatory framework with RAR is in place.',
                ],
            },
            {
                id: 'the-open-source-commitment',
                title: 'The open-source commitment',
                paragraphs: [
                    'The port is published openly. This is a commitment that affects the institute, the manufacturer, the fleet partner, and the broader open-source automotive software community.',
                    'For the institute, open-source publication is the institutional position. The institute does not believe it should accept funding terms that would compel proprietary publication of safety-critical automotive software. Open-source publication is what makes the port credible to the openpilot community, to other manufacturers that might later adopt the same approach, and to the regulatory authorities that benefit from inspectable code.',
                    'For the manufacturer, open-source publication does not compromise proprietary material. The institute does not republish manufacturer-confidential CAN documentation, manufacturer cryptographic credentials, or any material that the manufacturer\'s NDA covers. The institute publishes its own engineering work; the manufacturer\'s proprietary material remains the manufacturer\'s.',
                    'For the fleet partner, open-source publication does not compromise commercial advantage. The fleet partner gets first deployment of the port in operation, the operational data and lessons learned, the insurance framework already in place, and the long-term partnership with the institute. The first-deployment advantage is durable.',
                ],
            },
            {
                id: 'the-longer-horizon',
                title: 'The longer horizon',
                paragraphs: [
                    'The post-2026 Dacia range is one of the most consequential automotive launches in Romania\'s industrial history. It is the moment at which Mioveni transitions from being a B-segment volume manufacturer to being a multi-segment European producer with a unified platform across the family. Dacia\'s commercial position at this moment is strong. The manufacturer\'s relationship to its software stack, to its cybersecurity posture, and to the open-source automotive community is the unsettled question.',
                    'The institute\'s offer is to settle that question in a way that benefits Dacia, that benefits Renault Group, that benefits Romania, that benefits the open-source automotive community, and that benefits any driver of a post-2026 Dacia who would prefer the option of running supervised driver-assistance software the openpilot community has spent ten years validating across hundreds of vehicles.',
                    'The offer is on the table. The window is the next two years. Whether the manufacturer takes the offer, whether the fleet partner contributes, are decisions taken by those parties on their own terms. The institute does the work regardless of the answers. The work is faster and lands harder if the answers are yes. It is slower and narrower if the answers are no. It does not stop. This is what Romania can do, with what Romania has, in the window that is open. The argument is not for caution. The argument is for the work.',
                ],
            },
        ],
        timeline: {
            heading: 'timeline',
            phases: [
                {
                    phase: 'Phase 0: Frame and rally',
                    dates: '2026 Q2 to 2026 Q4',
                    milestones: [
                        'Position paper, executive summary, programme brief, safety-and-cybersecurity concept, partnership-architecture, FAQ, press kit, public timeline, and endorsement template published',
                        'Initial endorsements secured from a small group of Romanian institutional partners (target 4 to 6 endorsements)',
                        'Bilateral introductions to Renault Group and Dacia engineering at Mioveni; first conversation with comma.ai and the openpilot upstream',
                        'RAR regulatory-design dialogue opened; first conversation with a Romanian fleet operator',
                    ],
                },
                {
                    phase: 'Phase 1: Foundation',
                    dates: '2027',
                    milestones: [
                        'In access scenario: structured engineering dialogue under NDA with Renault Group; first scoped engineering programme on closed-course infrastructure with the fleet partner\'s vehicles',
                        'In documentation-only fallback scenario: ASOS subscription and SERMI registration; passive CAN logging on owned and fleet vehicles begins; first technical reports (Bigster ADAS feature matrix, CMF-B bus-topology report) published',
                        'Simulator and hardware-in-the-loop prototype environment operational by end of Phase 1',
                        'First annual progress report; scientific and policy advisory committee constituted',
                    ],
                },
                {
                    phase: 'Phase 2: Build',
                    dates: '2028-2029',
                    milestones: [
                        'In access scenario: closed-course active-control stage on small fleet; authentication audit (Stage 3) completed; simulator and HIL infrastructure (Stage 4) mature; first usable Bigster port delivered',
                        'In documentation-only scenario: simulator and HIL infrastructure becomes the institute\'s main engineering deliverable; control-algorithm prototypes validated in simulation; Romanian research-vehicle modification regime finalised with RAR',
                        'External CSMS audit conducted; first full safety case for any closed-course active-control work',
                        'Open-source publication of institute contributions begins on the institute\'s public repository; upstream contributions to the openpilot project',
                    ],
                },
                {
                    phase: 'Phase 3: Extend and deploy',
                    dates: '2030-2031',
                    milestones: [
                        'Port extended to additional CMF-B platform vehicles: Sandero, Logan, Duster, the upcoming Striker',
                        'First commercial deployment of the Bigster port with the Romanian fleet partner',
                        'First substantive revenue conversations begin: hardware-kit royalties, licensed safety-stack components, service revenue, co-developed hardware',
                        'In access scenario: manufacturer dialogue extends to additional vehicle types and to the first official authorisation of public-road deployment',
                    ],
                },
                {
                    phase: 'Phase 4: Consolidation',
                    dates: '2032 onwards',
                    milestones: [
                        'Stable Romanian institutional capability in automotive cybersecurity, functional safety, and supervised driver-assistance research',
                        'Port deployed across multiple Dacia vehicle types; fleet-partner deployment generating real-world data',
                        'Stabilised revenue model funding the institute\'s continuing work',
                        'Demonstrated that the open driver-assistance ecosystem can scale through institutional partnerships with manufacturers, not only through community ports',
                    ],
                },
            ],
            footer: 'The timeline depends on three external windows the institute does not control: the Renault Group response to the first manufacturer conversation; the post-PNRR successor instrument design through 2026 and 2027 (which affects the institute\'s Romanian state research-funding context); and the EU AI Act and UN R155 implementation cycle. The institute\'s tactical work is to be ready in time to use each of these windows, and to recover gracefully if any single window closes.',
        },
        faq: [
            {
                question: 'Is this an attempt to port openpilot to a Dacia?',
                answer: 'Yes, openly. The institute proposes to engineer and publish, under an open-source licence, an openpilot port that supports the post-2026 Dacia range, in cooperation with Renault Group and Dacia where access is forthcoming, and in a more limited form where it is not. The deliverable is the port. The dossier is the institutional shape that makes the port credible, defensible, and adoptable rather than a grey-market community port that the manufacturer cannot acknowledge.',
            },
            {
                question: 'Why is the primary ask engineering access rather than cash funding?',
                answer: 'Cash funding would convert the relationship into a contract-research arrangement, which would constrain the open-source publication, complicate the institute\'s institutional independence, and slow the work. Access is faster, cleaner, and aligned with the open-source publication model. Engineering access is also the scarce resource for this kind of work, in a way cash is not. The institute can fund its running costs through ordinary Romanian state research grants; what the institute cannot procure on its own is the manufacturer\'s authorisation to engage with vehicle systems at the depth required for a credible port.',
            },
            {
                question: 'How does Piatra fund itself if not from the manufacturer?',
                answer: 'Through ordinary Romanian state research grants, applied for and managed independently of this programme. The institute applies, on its normal cadence, for MCID research grants, post-PNRR-instrument allocations, and Horizon Europe or successor-framework funding for specific work packages where the research framing aligns. None of this funding is requested as part of this dossier. Beyond running costs, the institute intends to develop a long-term revenue base from the work that follows the port: hardware-kit royalties, licensed safety-stack components, service revenue, and co-developed hardware with the manufacturer.',
            },
            {
                question: 'What happens to revenue when devices, kits, or hardware ship?',
                answer: 'The institute negotiates revenue arrangements separately, on its own behalf, with the parties involved (a hardware-kit manufacturer, a licensee of safety-stack components, a fleet operator deploying the port at scale, the original manufacturer for co-developed hardware). The institute\'s commitments at the architectural level are: the port itself remains open source, no revenue arrangement requires proprietary republication of the institute\'s contributions, the categories of revenue arrangement are public, and the existence of any revenue arrangement above a defined materiality threshold is disclosed in the institute\'s annual progress report. The first substantive revenue conversations begin at the start of Phase 3, when the deployment ecosystem begins to take concrete shape.',
            },
            {
                question: 'Why open source?',
                answer: 'Three reasons. The institutional reason: the institute does not believe it should accept funding terms or partnership terms that would compel proprietary publication of safety-critical automotive software. The engineering reason: the openpilot ecosystem is open source, and an institute-engineered port that lands in the openpilot mainline is more useful and more thoroughly reviewed than a closed port. The political reason: open-source publication makes the institute\'s offer different in kind from a normal contract supplier, which is what justifies the access ask and what makes the manufacturer\'s category leadership real. The licence is Apache 2.0 by default, with MIT for components that interoperate where Apache is incompatible.',
            },
            {
                question: 'Why not just do a community port the way other openpilot-supported cars were ported?',
                answer: 'Two reasons, both decisive. First, regulatory: UN Regulation No. 155 has been in full force for new vehicle types since July 2024 and applies to all new vehicles from July 2026. A community port that operates outside the manufacturer\'s regulatory frame fails any UN R155 audit, and a vehicle that fails a UN R155 audit cannot be legally registered, modified, or operated on a public road in any EU member state. Second, technical: modern Renault and Dacia vehicles use Security Gateway mechanisms for protected diagnostics, and actuator messages on the most recent platforms may be cryptographically authenticated under Secure Onboard Communication. If they are, the community-port approach is impossible without manufacturer cooperation.',
            },
            {
                question: 'What does Renault Group actually get?',
                answer: 'At the deepest level: category leadership as the first major manufacturer to authorise a managed-access third-party openpilot port, at zero cash outlay. A defensible UN R155 conformance posture vs. the alternative of grey-market community ports happening anyway. A Romanian engineering talent pipeline anchored at the institute, the universities, and the supplier ecosystem. Goodwill from the open-source automotive community. Optionality on co-developed hardware revenue. A signal to the next generation of automotive engineers that Renault and Dacia are the manufacturers willing to engage seriously with the open-source automotive software ecosystem.',
            },
            {
                question: 'What does the fleet operator get?',
                answer: 'First commercial deployment of the openpilot port across the operator\'s Dacia fleet once the technical and regulatory work is complete, with a documented head-start advantage of approximately 12 to 18 months over peer fleet operators. Differentiated capability that no peer fleet operator has during the head-start period. A long-term research and engineering partnership with the institute. Preferential terms on any future hardware kit, device, or licensed safety-stack component that emerges from the programme. The fleet operator\'s contribution is in-kind (vehicles, operational data, insurance framework). No cash request.',
            },
            {
                question: 'What if Renault Group says no to managed access?',
                answer: 'The institute proceeds with the fallback: engineering CAN documentation under NDA at platform level (if the manufacturer is willing to provide it), a single point of technical contact at Dacia engineering, and a non-objection to the institute\'s passive logging on owned and fleet vehicles. The institute\'s outputs in this scenario include the Bigster ADAS feature matrix, the CMF-B reverse-engineering report, the simulator and hardware-in-the-loop prototype environment, and the safety and cybersecurity documentation that supports a later upgrade to managed access. If even the documentation-only fallback is declined, the institute proceeds with what is feasible from passive logging on owned and fleet vehicles. The work is slower and narrower; it does not stop.',
            },
            {
                question: 'Why Bigster first, then the rest of the range?',
                answer: 'Bigster is the proof of platform compatibility: current production, the first Dacia C-segment vehicle, offered with factory lane-keeping and (in hybrid versions) with adaptive cruise. The CMF-B platform is shared across Sandero, Logan, Duster, Bigster, and the upcoming Striker. The institute commits to platform-level abstractions in the engineering work so that family-level support is the natural extension rather than a separate project for each model. Vehicle-specific calibration is per-model; platform-level engineering is shared.',
            },
            {
                question: 'What about the openpilot community and comma.ai?',
                answer: 'comma.ai\'s openpilot is an explicit ally of this programme. The institute\'s port is engineered to be upstream-friendly and is intended to land in the openpilot mainline as the supported configuration for the Dacia platform. The institute commits to the standard open-source community practices: clear contribution guidelines, public issue tracker, public security disclosure process, regular release cadence, public documentation. The institute\'s offer is not a replacement for the open-source ecosystem; it is a Romanian-anchored institutional contribution that expands the openpilot supported-cars list to a major European manufacturer\'s post-2026 range under terms that the manufacturer, the regulator, the insurer, and the fleet operator can all support.',
            },
            {
                question: 'Will the port work on public roads?',
                answer: 'Closed-course validation comes first. Public-road compatibility is the natural extension once the closed-course safety case is complete and the regulatory framework with RAR is in place. The proposal does not include public-road actuator experimentation in the Phase 0 to Phase 2 scope. Phase 3 (extend and deploy) introduces the first fleet deployment under a documented safety case, regulatory framework, and insurance arrangement. This is staging, not permanent exclusion. The goal is a publicly usable openpilot port for the post-2026 Dacia range. The path goes through closed-course first because the safety case has to be earned.',
            },
        ],
        cta: {
            heading: 'how to engage',
            lead: 'The decision asked is not "give us your keys" or "give us cash" but "engage with the Romanian engineering offer that this dossier represents." The institute does the work; what each party provides is access, vehicles, regulatory cover, or institutional weight.',
            audiences: [
                {
                    label: 'Renault Group and Dacia engineering',
                    description: 'discussion of a managed-access engineering programme on Bigster-platform vehicles, framed as an open-source port engineered by Piatra . Institute under ISO 26262, ISO/SAE 21434, and UN R155 conformance. Initial conversations under NDA, scoped to which managed-access mechanisms are appropriate. No cash funding requested.',
                },
                {
                    label: 'Romanian fleet operators',
                    description: 'in-kind partnership: vehicles, operational data, insurance framework, in exchange for first deployment of the port across the operator\'s Dacia fleet and a long-term partnership with the institute. Autonom is the natural first candidate; equivalent peers are welcome.',
                },
                {
                    label: 'comma.ai and the openpilot community',
                    description: 'upstream-friendly engagement on the port, with the intent that it lands in the openpilot mainline as the supported configuration for the Dacia platform. The institute engages as a peer of other community contributors.',
                },
                {
                    label: 'Romanian Auto Register (RAR)',
                    description: 'regulatory interlocution on a Romanian research-vehicle modification regime that supports the staged path from closed-course testing to public-road compatibility.',
                },
                {
                    label: 'Romanian technical universities',
                    description: 'UTC Cluj-Napoca, Politehnica Bucharest, TU Iași, and others with automotive, embedded-systems, or cybersecurity programmes. Engineering-depth contribution, postdoctoral and student involvement, joint-publication potential.',
                },
                {
                    label: 'Romanian Academy and civil society',
                    description: 'institutional review and legitimacy from the technical-sciences section; input on driver-takeover protocols and transparency commitments from consumer-safety organisations.',
                },
                {
                    label: 'Romanian and European journalists',
                    description: 'press-kit materials include boilerplate, quotable descriptions at multiple lengths, and key facts for writing about the programme.',
                },
            ],
            contactEmail: 'open-adas-dacia@piatra.institute',
            contactLabel: 'contact',
        },
        downloads: [
            {
                label: 'Position Paper (PDF)',
                href: '/policies/open-adas-dacia-position-paper.pdf',
                description: 'the full case. An open-source engineering offer for the post-2026 Dacia range, in exchange for managed engineering access from Renault Group and operational cooperation from a Romanian fleet partner.',
            },
            {
                label: 'Executive Summary (PDF)',
                href: '/policies/open-adas-dacia-executive-summary.pdf',
                description: 'the position paper distilled to 750 words for time-poor readers.',
            },
            {
                label: 'Programme Brief (PDF)',
                href: '/policies/open-adas-dacia-programme-brief.pdf',
                description: 'the specific-ask document addressed primarily to Renault Group cybersecurity and engineering leadership and to a Romanian fleet operator. Names the access ask, the in-kind ask, the fallback documentation-only path, the deliverable, the staged delivery, the future revenue model, the signatories.',
            },
            {
                label: 'Safety and Cybersecurity Concept (PDF)',
                href: '/policies/open-adas-dacia-safety-and-cybersecurity-concept.pdf',
                description: 'the technical frame at the depth the OEM expects. Threat model, hazard analysis aligned to ISO 26262, cybersecurity engineering aligned to ISO/SAE 21434, UN R155 conformance approach, no-key-extraction commitments.',
            },
            {
                label: 'Partnership Architecture (PDF)',
                href: '/policies/open-adas-dacia-partnership-architecture.pdf',
                description: 'how Piatra . Institute relates to its supporting institutions, the manufacturer, the fleet partner, and the open-source community. Roles, responsibilities, data flows, intellectual property, liability and insurance, governance, the future revenue model.',
            },
            {
                label: 'Frequently Asked Questions (PDF)',
                href: '/policies/open-adas-dacia-faq.pdf',
                description: 'anticipated objections, in two registers (Romanian institutional and OEM cybersecurity).',
            },
            {
                label: 'Public Timeline (PDF)',
                href: '/policies/open-adas-dacia-timeline-public.pdf',
                description: 'the five-phase arc over approximately seven years, organised around access milestones and engineering deliverables, with go and no-go checkpoints at each phase boundary.',
            },
            {
                label: 'Press Kit (PDF)',
                href: '/policies/open-adas-dacia-press-kit.pdf',
                description: 'boilerplate, quotable descriptions at multiple lengths, and key facts for Romanian and European automotive and policy journalists.',
            },
            {
                label: 'Endorsement Response Template (PDF)',
                href: '/policies/open-adas-dacia-endorsement-template.pdf',
                description: 'for institutional, scientific, fleet-operator, and civil-society endorsers. Copy fields into an email reply or submit a signed PDF.',
            },
        ],
    },
];


export const findPolicyByPath = (path: string): Policy | undefined => {
    return policies.find(p => p.path === path);
};
