import type { SampleCase } from './index';

export const SAMPLE_CASES: SampleCase[] = [
    {
        name: 'Classical Mechanics',
        types: ['HM', 'CF', 'OB'],
        description: 'Hamiltonian dynamics on finite-dimensional phase spaces with full observability. The paradigm of deterministic, reversible, fully predictable science.',
        profile: { dimensionality: 2, stochasticity: 0, nonlinearity: 2, observability: 4, controllability: 3, openness: 0, adaptation: 0, endogeneity: 0, reflexivity: 0, predictability: 4 },
    },
    {
        name: 'Quantum Mechanics',
        types: ['HM', 'IF', 'ST', 'PO'],
        description: 'Unitary evolution in infinite-dimensional Hilbert space, with stochastic measurement collapse and inherent partial observability. Deterministic between measurements, irreducibly random at measurement.',
        profile: { dimensionality: 4, stochasticity: 3, nonlinearity: 1, observability: 1, controllability: 1, openness: 1, adaptation: 0, endogeneity: 0, reflexivity: 0, predictability: 2 },
    },
    {
        name: 'Chemistry in a Beaker',
        types: ['CF', 'LN', 'OB'],
        description: 'Finite-dimensional concentration space, approximately linearizable near equilibrium, with good observability via spectroscopy. The most controllable of the natural sciences.',
        profile: { dimensionality: 2, stochasticity: 0, nonlinearity: 1, observability: 4, controllability: 3, openness: 1, adaptation: 0, endogeneity: 0, reflexivity: 0, predictability: 4 },
    },
    {
        name: 'Weather Forecasting',
        types: ['IF', 'CH', 'ST', 'PO'],
        description: 'Infinite-dimensional fluid dynamics with chaotic sensitivity, stochastic forcing, and partial observability. Prediction degrades exponentially beyond ~10 days.',
        profile: { dimensionality: 4, stochasticity: 3, nonlinearity: 4, observability: 1, controllability: 0, openness: 2, adaptation: 0, endogeneity: 0, reflexivity: 0, predictability: 0 },
    },
    {
        name: 'Epidemiology',
        types: ['NL', 'ST', 'OP', 'AD'],
        description: 'Nonlinear transmission dynamics with stochastic variation, open boundaries (travel, mutation), and adaptive behavior (social distancing, vaccine response). R₀ is a threshold, not a constant.',
        profile: { dimensionality: 2, stochasticity: 3, nonlinearity: 4, observability: 2, controllability: 1, openness: 4, adaptation: 3, endogeneity: 1, reflexivity: 1, predictability: 1 },
    },
    {
        name: 'Ecology',
        types: ['OP', 'NL', 'FB', 'AD'],
        description: 'Open systems with nonlinear population dynamics, predator-prey feedback, and adaptive behavior (niche construction, phenotypic plasticity). Stability is the exception, not the rule.',
        profile: { dimensionality: 2, stochasticity: 2, nonlinearity: 4, observability: 2, controllability: 1, openness: 4, adaptation: 3, endogeneity: 1, reflexivity: 0, predictability: 1 },
    },
    {
        name: 'Gene Regulation',
        types: ['NL', 'ST', 'FB', 'HR'],
        description: 'Nonlinear regulatory networks with intrinsic stochasticity (few-molecule effects), feedback loops (autoregulation), and hierarchical organization (operons within regulons within genomes).',
        profile: { dimensionality: 3, stochasticity: 3, nonlinearity: 3, observability: 2, controllability: 1, openness: 2, adaptation: 2, endogeneity: 1, reflexivity: 0, predictability: 1 },
    },
    {
        name: 'Neural Network Training',
        types: ['CF', 'NL', 'GD', 'OC'],
        description: 'High-dimensional but finite parameter space, nonlinear loss landscape, gradient-based optimization. The training dynamics are a gradient flow on a rugged landscape.',
        profile: { dimensionality: 3, stochasticity: 1, nonlinearity: 3, observability: 3, controllability: 3, openness: 1, adaptation: 1, endogeneity: 0, reflexivity: 0, predictability: 3 },
    },
    {
        name: 'Robot Controller',
        types: ['HY', 'CT', 'OB', 'FB'],
        description: 'Hybrid state space (continuous motion + discrete mode switches), full controllability and observability, tight feedback loops. Engineering turns theory into reliability.',
        profile: { dimensionality: 2, stochasticity: 1, nonlinearity: 2, observability: 4, controllability: 4, openness: 1, adaptation: 1, endogeneity: 0, reflexivity: 0, predictability: 3 },
    },
    {
        name: 'Urban Traffic',
        types: ['DC', 'NL', 'FB', 'NW'],
        description: 'Decentralized decisions by individual drivers, nonlinear flow dynamics (congestion phase transitions), feedback from navigation apps, network topology determines bottlenecks.',
        profile: { dimensionality: 3, stochasticity: 2, nonlinearity: 3, observability: 2, controllability: 1, openness: 2, adaptation: 2, endogeneity: 1, reflexivity: 1, predictability: 1 },
    },
    {
        name: 'Central Bank Economy',
        types: ['OP', 'FB', 'AD', 'EN', 'RF'],
        description: 'Open macroeconomic system with feedback (interest rate → inflation → employment), adaptive expectations, endogenous institutions, and reflexive self-fulfilling dynamics (confidence → growth → confidence).',
        profile: { dimensionality: 3, stochasticity: 3, nonlinearity: 3, observability: 1, controllability: 1, openness: 4, adaptation: 3, endogeneity: 4, reflexivity: 3, predictability: 0 },
    },
    {
        name: 'Financial Markets',
        types: ['RF', 'CH', 'PF', 'EN', 'PO'],
        description: 'Reflexive dynamics (price reflects beliefs about price), chaotic sensitivity to information, performative models (Black-Scholes changed options markets), endogenous rules (regulation co-evolves with markets).',
        profile: { dimensionality: 3, stochasticity: 3, nonlinearity: 4, observability: 1, controllability: 0, openness: 4, adaptation: 3, endogeneity: 4, reflexivity: 4, predictability: 0 },
    },
    {
        name: 'Election Forecasting',
        types: ['GT', 'RF', 'PF', 'PO'],
        description: 'Game-theoretic strategic voting, reflexive polling effects (polls change votes), performative predictions (forecasts depress or mobilize turnout), fundamentally partially observable preferences.',
        profile: { dimensionality: 3, stochasticity: 3, nonlinearity: 3, observability: 1, controllability: 0, openness: 3, adaptation: 2, endogeneity: 3, reflexivity: 4, predictability: 0 },
    },
    {
        name: 'Language Evolution',
        types: ['AD', 'EN', 'SO', 'NW'],
        description: 'Adaptive learning by speakers, endogenous rule creation (grammar evolves from use), self-organizing regularization, network effects (prestige dialects spread through social graphs).',
        profile: { dimensionality: 3, stochasticity: 2, nonlinearity: 3, observability: 2, controllability: 0, openness: 3, adaptation: 4, endogeneity: 4, reflexivity: 1, predictability: 1 },
    },
    {
        name: 'Psychotherapy',
        types: ['S2', 'AD', 'RF', 'PO'],
        description: 'The therapist is part of the system being treated (second-order). Adaptive responses to therapeutic intervention, reflexive self-modeling, fundamentally partially observable internal states.',
        profile: { dimensionality: 3, stochasticity: 3, nonlinearity: 3, observability: 1, controllability: 0, openness: 4, adaptation: 3, endogeneity: 3, reflexivity: 4, predictability: 0 },
    },
];
