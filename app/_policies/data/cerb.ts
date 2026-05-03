import type { PolicyContent } from '../data';


export const cerbContent: PolicyContent = {
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
};
