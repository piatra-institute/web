import { expect, test } from 'vitest';

import {
    OntologyDataset,
    Relation,
    applyRepairSuggestion,
    computeRuleChecks,
    computeSnapshotDiff,
    computeTransitiveClosurePairs,
    computeTransitiveReductionEdges,
    suggestRepairs,
    validateDatasetForMode,
} from '../index';

function datasetWithChain(includeDirect = false): OntologyDataset {
    const edges: Relation[] = [
        { id: 'e_ab', from: 'a', to: 'b', type: 'envelops', strength: 0.9 },
        { id: 'e_bc', from: 'b', to: 'c', type: 'envelops', strength: 0.8 },
    ];
    if (includeDirect) {
        edges.push({ id: 'e_ac', from: 'a', to: 'c', type: 'envelops', strength: 0.4 });
    }

    return {
        nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
            { id: 'c', label: 'C' },
        ],
        edges,
        metaEdges: [],
    };
}

test('transitive closure returns implied envelop pairs', () => {
    const dataset = datasetWithChain(false);
    const implied = computeTransitiveClosurePairs(dataset);

    expect(implied.length).toBe(1);
    expect(implied[0].from).toBe('a');
    expect(implied[0].to).toBe('c');
});

test('transitive reduction removes implied explicit envelop edges', () => {
    const dataset = datasetWithChain(true);
    const reduced = computeTransitiveReductionEdges(dataset);

    expect(reduced.map((edge) => edge.id).sort()).toEqual(['e_ab', 'e_bc']);
});

test('strict mode blocks invalid poset structures', () => {
    const dataset: OntologyDataset = {
        nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
            { id: 'x', label: 'X' },
        ],
        edges: [
            { id: 'e_ab', from: 'a', to: 'b', type: 'envelops', strength: 0.8 },
            { id: 'e_ba', from: 'b', to: 'a', type: 'envelops', strength: 0.7 },
            { id: 'e_xb', from: 'x', to: 'b', type: 'envelops', strength: 0.6 },
        ],
        metaEdges: [],
    };

    const check = computeRuleChecks(dataset);
    expect(check.isValid).toBe(false);
    expect(check.blockingIssues.length).toBeGreaterThan(0);

    const strictValidation = validateDatasetForMode(dataset, 'strict_poset');
    const softValidation = validateDatasetForMode(dataset, 'soft_poset');

    expect(strictValidation.allowed).toBe(false);
    expect(softValidation.allowed).toBe(true);
});

test('repair suggestion improves at least one blocking rule', () => {
    const dataset: OntologyDataset = {
        nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B' },
        ],
        edges: [
            { id: 'e_ab', from: 'a', to: 'b', type: 'envelops', strength: 0.9 },
            { id: 'e_ba', from: 'b', to: 'a', type: 'envelops', strength: 0.2 },
        ],
        metaEdges: [],
    };

    const before = computeRuleChecks(dataset);
    const suggestions = suggestRepairs(dataset);

    expect(suggestions.length).toBeGreaterThan(0);

    const repaired = applyRepairSuggestion(dataset, suggestions[0]);
    const after = computeRuleChecks(repaired);

    expect(after.blockingIssues.length).toBeLessThanOrEqual(before.blockingIssues.length);
});

test('snapshot diff reports additions and changes', () => {
    const left: OntologyDataset = {
        nodes: [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
        ],
        edges: [
            { id: 'e_ab', from: 'a', to: 'b', type: 'envelops', strength: 0.5 },
        ],
        metaEdges: [],
    };

    const right: OntologyDataset = {
        nodes: [
            { id: 'a', label: 'Alpha prime' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
        ],
        edges: [
            { id: 'e_ab', from: 'a', to: 'b', type: 'envelops', strength: 0.7 },
            { id: 'e_bc', from: 'b', to: 'c', type: 'envelops', strength: 0.3 },
        ],
        metaEdges: [],
    };

    const diff = computeSnapshotDiff(left, right);

    expect(diff.addedNodes.length).toBe(1);
    expect(diff.changedNodes.length).toBe(1);
    expect(diff.addedEdges.length).toBe(1);
    expect(diff.changedEdges.length).toBe(1);
});
