import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'rent-vs-return',
        statement: 'Economic rent (windfall profits from monopoly position, war, or scarcity) can be taxed with less damage to investment incentives than ordinary entrepreneurial returns.',
        citation: 'IMF, 2022 — Excess Profit Taxes: Historical Perspective and Contemporary Relevance; standard public finance theory (Ramsey, Mirrlees)',
        confidence: 'established',
        falsifiability: 'Evidence that excess-profits taxes consistently reduce productive investment at rates comparable to broad profit caps.',
    },
    {
        id: 'simulation-linearity',
        statement: 'The coupled sector dynamics can be approximated by additive impulse terms with sigmoid-gated deployment, without requiring a full agent-based or general-equilibrium model.',
        citation: 'Computational simplification — analogous to reduced-form macroeconomic models (Romer, 1990; Aghion & Howitt, 1992)',
        confidence: 'contested',
        falsifiability: 'An agent-based model of the same sector interactions producing qualitatively different regime rankings under identical parameter sweeps.',
    },
    {
        id: 'sector-independence',
        statement: 'Sectors interact primarily through knowledge spillovers, energy externalities, and materials externalities. Direct competitive displacement between sectors is not modeled.',
        citation: 'Simplification — cross-sector competition is modeled indirectly via shared resource constraints (capital cost, energy)',
        confidence: 'speculative',
        falsifiability: 'Evidence that AI investment directly crowds out biotech or space investment through capital or talent competition beyond what shared parameters capture.',
    },
    {
        id: 'broad-controls-shortage',
        statement: 'Broad administrative profit caps in volatile markets tend to produce shortages because the state cannot observe true replacement costs across thousands of firms in real time.',
        citation: 'Norton Rose Fulbright, 2014 — Venezuela Fair Prices Law; Joskow, 2006 — Regulation of Natural Monopolies',
        confidence: 'established',
        falsifiability: 'A broad profit cap regime in a volatile competitive market that does not produce measurable shortage, quality decline, or black market activity within 3 years.',
    },
    {
        id: 'utility-regulation',
        statement: 'Rate-of-return regulation in natural monopolies can lower prices and raise consumer surplus relative to an unregulated monopoly, despite Averch-Johnson overinvestment distortions.',
        citation: 'World Bank, natural monopoly regulation review; Averch & Johnson, 1962; Joskow, 2006',
        confidence: 'established',
        falsifiability: 'Empirical cases where well-designed utility regulation consistently produces worse consumer outcomes than unregulated monopoly pricing.',
    },
];
