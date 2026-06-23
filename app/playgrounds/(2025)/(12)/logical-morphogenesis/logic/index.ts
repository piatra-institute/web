// Self-referential truth-value dynamics. Each sentence updates its truth value
// from the previous step based on what it asserts about itself or another
// sentence. Iterating these updates turns logical paradoxes into temporal
// patterns: the Liar ("this sentence is false") oscillates with period 2, a
// truth-teller sits at a fixed point, and networks of mutual reference settle into
// cycles. These pure helpers reproduce the core update rule and cycle detection
// the playground's simulate() uses; full simulation logic lives in constants.ts.

export type LogicType =
    | 'CONST_TRUE'
    | 'CONST_FALSE'
    | 'LIAR_SELF'
    | 'TRUTH_TELLER_SELF'
    | 'ASSERT_TRUE'
    | 'ASSERT_FALSE'
    | 'IMPLIES_SELF_IF_TARGET'
    | 'IFF_TARGET';

// next truth value of a sentence given its own and its target's previous values
export function nextTruth(type: LogicType, selfPrev: boolean, targetPrev: boolean): boolean {
    switch (type) {
        case 'CONST_TRUE': return true;
        case 'CONST_FALSE': return false;
        case 'LIAR_SELF': return !selfPrev;
        case 'TRUTH_TELLER_SELF': return selfPrev;
        case 'ASSERT_TRUE': return targetPrev;
        case 'ASSERT_FALSE': return !targetPrev;
        case 'IMPLIES_SELF_IF_TARGET': return !targetPrev || selfPrev;
        case 'IFF_TARGET': return selfPrev === targetPrev;
        default: return false;
    }
}

const bitKey = (bits: boolean[]): string => bits.map((b) => (b ? '1' : '0')).join('');

export interface CycleInfo { found: boolean; startIndex: number; period: number; }

// detect the first repeated global state and report where the cycle starts and
// its period (the length of the eventual attractor)
export function detectCycle(history: boolean[][]): CycleInfo {
    const seen = new Map<string, number>();
    for (let t = 0; t < history.length; t++) {
        const k = bitKey(history[t]);
        const prev = seen.get(k);
        if (prev !== undefined) return { found: true, startIndex: prev, period: t - prev };
        seen.set(k, t);
    }
    return { found: false, startIndex: 0, period: 0 };
}

// iterate a single self-referential sentence (no external target) and return its
// truth history of length `steps`
export function iterateSelf(type: LogicType, initial: boolean, steps: number): boolean[] {
    const history: boolean[] = [initial];
    for (let t = 1; t < steps; t++) {
        history.push(nextTruth(type, history[t - 1], false));
    }
    return history;
}
