import type { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'institutions-matter',
        statement: 'Long-run cross-country income differences are primarily explained by differences in institutions (property rights, contract enforcement, state capacity) rather than by geography, culture, or factor accumulation alone.',
        citation: 'Acemoglu, Johnson & Robinson 2001 — The Colonial Origins of Comparative Development (AER); Acemoglu & Robinson 2012 — Why Nations Fail',
        confidence: 'established' as const,
        falsifiability: 'Falsified if cross-country income variation is shown to be explained by geographic or factor endowments alone, with institutions reducing to proxies for deeper causes.',
    },
    {
        id: 'productivity-residual',
        statement: 'Most of the cross-country variation in output per worker is explained by total factor productivity (TFP), not by differences in physical or human capital. This is the “productivity residual” at the heart of development accounting.',
        citation: 'Hall & Jones 1999 — Why Do Some Countries Produce So Much More Output per Worker than Others? (QJE); Caselli 2005 — Accounting for Cross-Country Income Differences',
        confidence: 'established' as const,
        falsifiability: 'Falsified if development accounting is shown to reduce cross-country income differences to factor accumulation with no residual role for productivity.',
    },
    {
        id: 'counterfactual-not-causal',
        statement: 'The playground produces counterfactual benchmarks, not causal estimates. Transferring Poland’s growth path to Romania does not prove Romania “lost exactly $X” through bad choices.',
        citation: 'Holland 1986 — Statistics and Causal Inference; Morgan & Winship 2014 — Counterfactuals and Causal Inference',
        confidence: 'established' as const,
        falsifiability: 'Falsified if counterfactual economic paths are shown to recover true causal effects without exchangeability assumptions.',
    },
    {
        id: 'target-remains-target',
        statement: 'The target country keeps its own 1990 starting GDP per capita and population path. Copying Poland’s aggregate GDP onto Romania would conflate population size with per-person growth trajectory.',
        citation: 'Model assumption — separates per-capita compounding from demographic path',
        confidence: 'established' as const,
        falsifiability: 'Falsified if it can be shown that aggregate GDP comparisons without population normalization are more informative than per-capita comparisons.',
    },
    {
        id: 'growth-anchors',
        statement: 'Each country’s historical growth is approximated by five anchor periods (early transition, convergence, crisis, recovery, recent). This collapses annual volatility into a stepwise trajectory.',
        citation: 'Stylized simplification — calibrated against World Bank/FRED real GDP per capita series, constant 2010 USD',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if granular annual data produces qualitatively different counterfactual conclusions than the 5-anchor approximation.',
    },
    {
        id: 'synthetic-control',
        statement: 'Multi-country blending (synthetic control) provides a more defensible comparison than single-country transfer because it averages out idiosyncratic features of any one economy.',
        citation: 'Abadie, Diamond & Hainmueller 2010 — Synthetic Control Methods for Comparative Case Studies',
        confidence: 'established' as const,
        falsifiability: 'Falsified if blended comparators consistently produce worse counterfactual estimates than carefully chosen single comparators.',
    },
    {
        id: 'policy-basket',
        statement: 'A weighted bundle of 7 policy dimensions (institutions, investment, education, export complexity, macro stability, state capacity, EU absorption) captures the main cross-country variation in reform trajectories.',
        citation: 'Acemoglu & Robinson 2012 — Why Nations Fail; Rodrik 2007 — One Economics, Many Recipes',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if reform outcomes are shown to depend primarily on dimensions not represented in this basket (e.g., natural resource endowments, geographic position).',
    },
    {
        id: 'convergence-drag',
        statement: 'A “convergence drag” term (subtracted percentage points per year) reflects translation costs, local veto points, administrative friction, and political resistance to imported reforms.',
        citation: 'Rodrik 2008 — The Real Exchange Rate and Economic Growth; Acemoglu, Aghion & Zilibotti 2006 — Distance to Frontier',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if imported institutional reforms show no systematic friction across contexts.',
    },
    {
        id: 'confidence-bands',
        statement: 'Uncertainty compounds over time with a square-root rule, producing widening confidence bands for longer counterfactual horizons. This reflects epistemic humility about long-run projections.',
        citation: 'Model assumption — square-root uncertainty growth is a standard stylization for compounded stochastic paths',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if empirical counterfactual projections show linear or constant uncertainty growth rather than square-root compounding.',
    },
    {
        id: 'reverse-framing',
        statement: 'The framework is symmetric: the same machinery that asks “what if Romania had been like Poland?” can ask “what if Poland had been like Romania?”. Reverse framing is a check against treating the model country as a normative ideal.',
        citation: 'Model assumption — epistemic humility about ex post winners',
        confidence: 'established' as const,
        falsifiability: 'Falsified if reverse-framed counterfactuals are shown to be meaningless or asymmetric in principled ways.',
    },
];
