import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    BITMAP,
    bitsToNode,
    flipA,
    flipAB,
    defaultEdges,
    buildAdjacencyMatrix,
    type NodeId,
    type RelType,
} from './logic';


/**
 * The Greimas square has a fixed, checkable relational skeleton. None of the
 * values below are hand-written: each `predicted` is computed by the same
 * group-theoretic and graph functions that drive the live diagram. The
 * particle flow is stochastic and is deliberately not calibrated; only the
 * deterministic combinatorial core (negation, the relation lattice, closure)
 * is verified here.
 *
 * A boolean structural fact is reported as 1 (holds) against an expected 1.
 */

// contradiction is the first-bit flip (a): S1 <-> nS1, S2 <-> nS2.
function contradictoryOf(n: NodeId): NodeId {
    return bitsToNode(...flipA(BITMAP[n]));
}

// contrariety / sub-contrariety is the both-bit flip (ab): S1 <-> S2, nS1 <-> nS2.
function contraryOf(n: NodeId): NodeId {
    return bitsToNode(...flipAB(BITMAP[n]));
}

// look up the typed relation the default square assigns to an ordered pair.
function relationBetween(from: NodeId, to: NodeId): RelType | null {
    const adj = buildAdjacencyMatrix(defaultEdges());
    const rels = adj.map.get(`${from}->${to}`) ?? [];
    return rels.length > 0 ? rels[0].type : null;
}


export function buildCalibration(): CalibrationResult[] {
    const allNodes: NodeId[] = ['S1', 'S2', 'nS1', 'nS2'];

    // 1. negation is an involution: the contradictory of the contradictory
    // returns the original position, for every corner of the square.
    const involutionHolds = allNodes.every(
        (n) => contradictoryOf(contradictoryOf(n)) === n,
    );

    // 2. the contradictory of S1 is exactly the position labelled nS1
    // (the square's defining diagonal of contradiction).
    const s1ContradictsNotS1 = contradictoryOf('S1') === 'nS1' ? 1 : 0;

    // 3. S1 and S2 stand in contrariety; the typed edge between them must be
    // 'contrariety', and they must be each other's contrary under flipAB.
    const s1ContraryS2 =
        contraryOf('S1') === 'S2' && relationBetween('S1', 'S2') === 'contrariety'
            ? 1
            : 0;

    // 4. the lower pair nS1, nS2 stands in sub-contrariety; the typed edge
    // must be 'subcontrariety'.
    const notS1SubcontraryNotS2 =
        relationBetween('nS1', 'nS2') === 'subcontrariety' ? 1 : 0;

    // 5. closure: encoding each corner to two bits and decoding round-trips to
    // the same corner, so the four positions form a closed set with no leak.
    const closureHolds = allNodes.every(
        (n) => bitsToNode(BITMAP[n][0], BITMAP[n][1]) === n,
    );

    return [
        {
            name: 'negation is an involution',
            description:
                'the contradictory of the contradictory returns the original position, for all four corners (double negation cancels).',
            predicted: involutionHolds ? 1 : 0,
            expected: 1,
            source: 'structuralist semiotics: contradiction as an involution; Klein four-group, every generator its own inverse.',
        },
        {
            name: 'S1 contradicts nS1',
            description:
                'the contradictory of S1 computed from the bit encoding is exactly the position labelled not-S1.',
            predicted: s1ContradictsNotS1,
            expected: 1,
            source: 'Greimas and Rastier 1968: the contradiction diagonal S1 / not-S1.',
        },
        {
            name: 'S1 contrary to S2',
            description:
                'S1 and S2 are each other\'s contrary under the diagonal action, and the typed edge between them is contrariety.',
            predicted: s1ContraryS2,
            expected: 1,
            source: 'Greimas square: contrary axis on the upper deixis (S1 vs S2).',
        },
        {
            name: 'nS1 sub-contrary to nS2',
            description:
                'the typed edge between the two negative terms is sub-contrariety (they cannot both be false).',
            predicted: notS1SubcontraryNotS2,
            expected: 1,
            source: 'logical square of opposition: the lower edge is sub-contrariety.',
        },
        {
            name: 'four-position closure',
            description:
                'encoding each corner to two bits and decoding returns the same corner; the square is a closed set of exactly four positions.',
            predicted: closureHolds ? 1 : 0,
            expected: 1,
            source: 'V4 = Z2 x Z2: the four corners are the whole group, closed under the generating flips.',
        },
    ];
}
