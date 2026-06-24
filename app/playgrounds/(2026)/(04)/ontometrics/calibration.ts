import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DEFAULT_WEIGHTS,
    computeMetrics,
    type OntologyState,
} from './logic';


// Ontometrics is fully deterministic: every metric is a closed-form function of
// the editor state. So calibration here checks that the implemented formulas
// reproduce hand-derivable targets on small, fully specified ontologies, rather
// than fitting any empirical dataset. Each `predicted` value is COMPUTED by
// computeMetrics; the `expected` value is the number derived by hand from the
// documented definitions. Metrics on [0,1] are reported as percentages.


function makeState(
    categories: OntologyState['categories'],
    cases: OntologyState['cases'],
    axioms: OntologyState['axioms'] = [],
    relations: OntologyState['relations'] = [],
): OntologyState {
    return {
        categories,
        relations,
        axioms,
        cases,
        weights: DEFAULT_WEIGHTS,
        preset: 'metaphysics',
    };
}

const CAT_A = { id: 'cat_a', name: 'A', description: '' };
const CAT_B = { id: 'cat_b', name: 'B', description: '' };


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Coverage: 2 cases, both assigned to one category each. Every case has at
    //    least one category, so coverage = assigned / total = 2/2 = 1 -> 100%.
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [
                { id: 'x1', name: 'one', note: '', categoryIds: ['cat_a'] },
                { id: 'x2', name: 'two', note: '', categoryIds: ['cat_b'] },
            ],
        );
        const m = computeMetrics(state);
        results.push({
            name: 'coverage of fully assigned ontology',
            description: 'Two cases, each assigned to one distinct category. Coverage = assigned / total = 2/2.',
            predicted: Number((m.coverage * 100).toFixed(2)),
            expected: 100,
            source: 'definition: coverage = (cases with at least one category) / (total cases)',
        });
    }

    // 2. Coverage with one orphan case: 1 of 2 cases assigned -> coverage = 1/2 = 50%.
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [
                { id: 'x1', name: 'one', note: '', categoryIds: ['cat_a'] },
                { id: 'x2', name: 'orphan', note: '', categoryIds: [] },
            ],
        );
        const m = computeMetrics(state);
        results.push({
            name: 'coverage with one unassigned case',
            description: 'One of two cases left unassigned. Coverage = 1/2.',
            predicted: Number((m.coverage * 100).toFixed(2)),
            expected: 50,
            source: 'definition: an unassigned case is uncovered',
        });
    }

    // 3. Discrimination of two cases with identical assignments: the single pair is
    //    not distinct, so discrimination = distinctPairs / pairs = 0/1 = 0 -> 0%.
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [
                { id: 'x1', name: 'one', note: '', categoryIds: ['cat_a'] },
                { id: 'x2', name: 'two', note: '', categoryIds: ['cat_a'] },
            ],
        );
        const m = computeMetrics(state);
        results.push({
            name: 'zero discrimination on identical cases',
            description: 'Two cases assigned to the same single category cannot be told apart by the ontology.',
            // Boolean target: discrimination is exactly 0; report 1 if the model agrees.
            predicted: m.discrimination === 0 ? 1 : 0,
            expected: 1,
            source: 'definition: distinct case pairs / total case pairs; identical assignments give 0 distinct pairs',
        });
    }

    // 4. Fit identity: Fit = 0.55*Coverage + 0.45*Discrimination. With coverage 1 and
    //    discrimination 1 (two distinct single-category cases), Fit = 1 -> 100%.
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [
                { id: 'x1', name: 'one', note: '', categoryIds: ['cat_a'] },
                { id: 'x2', name: 'two', note: '', categoryIds: ['cat_b'] },
            ],
        );
        const m = computeMetrics(state);
        const handFit = 0.55 * m.coverage + 0.45 * m.discrimination;
        results.push({
            name: 'fit reproduces 0.55*coverage + 0.45*discrimination',
            description: 'The reported fit equals the documented weighted sum of coverage and discrimination.',
            predicted: Number((m.fit * 100).toFixed(2)),
            expected: Number((handFit * 100).toFixed(2)),
            source: 'documented definition: Fit = 0.55 * Coverage + 0.45 * Discrimination',
        });
    }

    // 5. Disjointness violation: one case assigned to both A and B with a disjoint(A,B)
    //    axiom triggers exactly one violation -> 1.
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [{ id: 'x1', name: 'both', note: '', categoryIds: ['cat_a', 'cat_b'] }],
            [{ id: 'ax1', type: 'disjoint', left: 'A', right: 'B' }],
        );
        const m = computeMetrics(state);
        results.push({
            name: 'one disjointness violation detected',
            description: 'A single case assigned to two categories declared disjoint produces exactly one violation.',
            predicted: m.violations.length,
            expected: 1,
            source: 'definition: disjoint(L,R) is violated by any case holding both L and R',
        });
    }

    // 6. Harman index from axiom mix: 2 subtype axioms, 0 dependsOn ->
    //    (subtype - dependsOn) / (subtype + dependsOn) = 2/2 = +1 (pure overmining).
    {
        const state = makeState(
            [CAT_A, CAT_B],
            [{ id: 'x1', name: 'one', note: '', categoryIds: ['cat_a'] }],
            [
                { id: 'ax1', type: 'subtype', left: 'A', right: 'B' },
                { id: 'ax2', type: 'subtype', left: 'A', right: 'B' },
            ],
        );
        const m = computeMetrics(state);
        results.push({
            name: 'harman index of subtype-only axioms',
            description: 'Two subtype axioms and no dependence axioms give a pure overmining index of +1.',
            predicted: Number((m.harmanIndex * 100).toFixed(2)),
            expected: 100,
            source: 'definition: harmanIndex = (subtype - dependsOn) / (subtype + dependsOn)',
        });
    }

    return results;
}
