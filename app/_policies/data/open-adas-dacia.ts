import type { PolicyContent } from '../data';


export const openAdasDaciaContent: PolicyContent = {
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
        contactEmail: 'openadas@piatra.institute',
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
};
