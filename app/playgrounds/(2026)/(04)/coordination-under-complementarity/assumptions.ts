import type { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'scale-mismatch',
        statement: 'Housing dysfunction is best explained as a scale mismatch: the system must function at the metro/regional level, but the strongest incentives, vetoes, and feedback loops operate at smaller units (parcel, neighborhood, municipality).',
        citation: 'Glaeser & Gyourko 2025 \u2014 Brookings housing supply analysis; Hsieh & Moretti 2019 \u2014 Housing Constraints and Spatial Misallocation',
        confidence: 'established' as const,
        falsifiability: 'Falsified if local-only governance is shown to produce optimal housing outcomes without cross-jurisdictional coordination in all contexts.',
    },
    {
        id: 'complementarity',
        statement: 'Housing supply requires synchronized complements: land, zoning, infrastructure, utilities, finance, permits, and political consent. If any node can block, the demand signal does not recruit coordinated supply.',
        citation: 'Milgrom & Roberts 1990 \u2014 The Economics of Modern Manufacturing; World Bank urban infrastructure reports',
        confidence: 'established' as const,
        falsifiability: 'Falsified if housing can be produced at scale with any single input available while all others are absent.',
    },
    {
        id: 'sheaf-gluing',
        statement: 'The simulation uses a sheaf-like metaphor: each scale has a "local section" (desired state), and the system is coherent only when these sections glue into a consistent global section. Failure to glue produces a cohomology defect.',
        citation: 'Bredon 1997 \u2014 Sheaf Theory; Robinson 2014 \u2014 Topological Signal Processing (sheaf cohomology for data fusion)',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if a coherent multiscale coordination model can be built that requires no notion of cross-scale consistency.',
    },
    {
        id: 'levin-hierarchy',
        statement: 'Lower scales can be recruited by higher-scale setpoints when repair capacity is strong, analogous to Michael Levin\u2019s model of morphogenetic hierarchy where cell-level behavior is guided by tissue-level bioelectric patterns.',
        citation: 'Levin 2019 \u2014 The computational boundary of a "self"; Levin 2022 \u2014 Technological Approach to Mind Everywhere',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if biological morphogenesis is shown to be purely bottom-up with no top-down pattern guidance.',
    },
    {
        id: 'nimby-dynamics',
        statement: 'Existing homeowners are organized, vote locally, and benefit from scarcity because it raises the value of their homes. The costs of undersupply are spread across would-be buyers and renters who are politically weaker in local decisions.',
        citation: 'Fischel 2001 \u2014 The Homevoter Hypothesis; Glaeser, Gyourko & Saks 2005 \u2014 Why Is Manhattan So Expensive?',
        confidence: 'established' as const,
        falsifiability: 'Falsified if existing homeowners are shown to consistently support densification that reduces their property values.',
    },
    {
        id: 'finance-misalignment',
        statement: 'Financial institutions can steer building toward balance-sheet logic rather than system need, producing overbuilding in some segments and underbuilding in others. China\u2019s property overhang is modeled as a variant of this pathology.',
        citation: 'IMF 2026 \u2014 China Article IV; Rogoff & Yang 2021 \u2014 Has China\u2019s Housing Production Peaked?',
        confidence: 'established' as const,
        falsifiability: 'Falsified if developer-finance incentives are shown to never produce systematic misallocation of housing stock.',
    },
    {
        id: 'functional-adaptation-rate',
        statement: 'The Functional Adaptation Rate (FAR) measures how much demand shock is absorbed by useful coordinated capacity (completions, mobility, infrastructure) versus converted into price inflation, queues, or informality.',
        citation: 'Model assumption \u2014 proposed metric synthesizing supply elasticity, migration responsiveness, and governance alignment',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if housing systems are shown to have no measurable difference in how they convert demand shocks into outcomes.',
    },
    {
        id: 'simulation-simplification',
        statement: 'The 7-scale simulation (Cell through Metro) uses simplified discrete-time dynamics. Real housing systems have continuous interactions, path dependence, and stochastic shocks not captured by this model.',
        citation: 'Model assumption \u2014 simplified for interactive exploration',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if this simplified model produces qualitatively wrong regime classifications compared to empirical data.',
    },
];
