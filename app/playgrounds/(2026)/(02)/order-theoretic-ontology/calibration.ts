import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    OntologyDataset,
    Relation,
    computePosetDiagnostics,
    computeRuleChecks,
    computeTransitiveClosurePairs,
    computeTransitiveReductionEdges,
} from './logic';


/**
 * Calibration against the textbook facts of order theory. Every `predicted`
 * value is computed by the same logic the playground runs; nothing is
 * hand-entered. We calibrate the deterministic structural core (reflexive
 * relations are implicit, so the checks here are antisymmetry, acyclicity,
 * transitive closure, and transitive reduction) on small posets whose answer
 * can be worked out by hand.
 *
 * The model treats "envelops" edges as the partial-order relation A <= B and
 * never adds the identity edges; antisymmetry is therefore detected as a pair
 * of distinct nodes that reach each other in the transitive closure (a 2-cycle),
 * which is exactly the order-theoretic definition's contrapositive.
 */

function node(id: string, label: string) {
    return { id, label };
}

function env(id: string, from: string, to: string): Relation {
    return { id, from, to, type: 'envelops', strength: 1 };
}

// A -> B -> C: a 3-element chain. A clean, valid partial order.
const CHAIN: OntologyDataset = {
    nodes: [node('a', 'A'), node('b', 'B'), node('c', 'C')],
    edges: [env('e1', 'a', 'b'), env('e2', 'b', 'c')],
    metaEdges: [],
};

// A <-> B: a 2-cycle. Violates antisymmetry and acyclicity.
const TWO_CYCLE: OntologyDataset = {
    nodes: [node('a', 'A'), node('b', 'B')],
    edges: [env('e1', 'a', 'b'), env('e2', 'b', 'a')],
    metaEdges: [],
};

// Diamond: A -> B, A -> C, B -> D, C -> D. D has two envelop parents.
const DIAMOND: OntologyDataset = {
    nodes: [node('a', 'A'), node('b', 'B'), node('c', 'C'), node('d', 'D')],
    edges: [
        env('e1', 'a', 'b'),
        env('e2', 'a', 'c'),
        env('e3', 'b', 'd'),
        env('e4', 'c', 'd'),
    ],
    metaEdges: [],
};

// A -> B -> C plus the redundant shortcut A -> C. Reduction must drop A -> C.
const CHAIN_WITH_SHORTCUT: OntologyDataset = {
    nodes: [node('a', 'A'), node('b', 'B'), node('c', 'C')],
    edges: [env('e1', 'a', 'b'), env('e2', 'b', 'c'), env('e3', 'a', 'c')],
    metaEdges: [],
};


export function buildCalibration(): CalibrationResult[] {
    const chainRules = computeRuleChecks(CHAIN);
    const cycleDiag = computePosetDiagnostics(TWO_CYCLE);
    const chainClosure = computeTransitiveClosurePairs(CHAIN);
    const diamondDiag = computePosetDiagnostics(DIAMOND);
    const shortcutReduction = computeTransitiveReductionEdges(CHAIN_WITH_SHORTCUT);

    return [
        {
            name: 'chain is a partial order',
            description:
                'the chain A <= B <= C is acyclic, antisymmetric, and single-parent, so it passes every order-theoretic rule check.',
            predicted: chainRules.isValid ? 1 : 0,
            expected: 1,
            source: 'a partial order is reflexive, antisymmetric, and transitive; a finite chain is the simplest total order.',
        },
        {
            name: '2-cycle breaks antisymmetry',
            description:
                'A <= B together with B <= A forces A = B. With distinct nodes this is exactly one antisymmetry-violating pair.',
            predicted: cycleDiag.antisymViolations.length,
            expected: 1,
            source: 'antisymmetry: a <= b and b <= a imply a = b; mutual reachability between distinct elements is its only failure mode.',
        },
        {
            name: '2-cycle is not acyclic',
            description:
                'the envelop graph A -> B -> A contains a directed cycle, so the Hasse / cover ordering does not exist.',
            predicted: cycleDiag.hasCycle ? 1 : 0,
            expected: 1,
            source: 'the cover relation of a poset is acyclic by construction; a cycle means no valid order can be drawn.',
        },
        {
            name: 'transitive closure of a 3-chain',
            description:
                'from A -> B -> C, transitivity implies the single non-direct pair A <= C. The closure adds exactly one implied edge.',
            predicted: chainClosure.length,
            expected: 1,
            source: 'transitivity: a <= b and b <= c imply a <= c; the only implied-not-direct pair in a 3-chain is (A, C).',
        },
        {
            name: 'diamond has one multi-parent node',
            description:
                'in the diamond A -> {B, C} -> D, only D is enveloped by two parents (B and C), so it is the single multi-parent node.',
            predicted: diamondDiag.multiParentCount,
            expected: 1,
            source: 'a join-semilattice diamond: the bottom element D is the meet of B and C and inherits two cover parents.',
        },
        {
            name: 'transitive reduction drops the shortcut',
            description:
                'A -> B -> C with the redundant A -> C reduces to two cover edges; the shortcut implied by the path is removed.',
            predicted: shortcutReduction.length,
            expected: 2,
            source: 'the transitive reduction of a DAG keeps only cover relations; A -> C is implied by A -> B -> C and is removed.',
        },
    ];
}
