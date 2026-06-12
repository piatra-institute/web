export interface WardToggles {
    /** scale invariance removes terms whose coupling carries mass dimension. */
    scaleInvariance: boolean;
    /** conformal invariance removes non-Weyl curvature couplings. */
    conformalInvariance: boolean;
    /** diffeomorphism invariance removes non-covariant, frame-fixed terms. */
    diffeoInvariance: boolean;
    /** single-coupling mode merges the surviving dimensionless couplings into one. */
    singleCoupling: boolean;
}


export interface LagrangianTerm {
    id: string;
    /** KaTeX source for the term. */
    latex: string;
    label: string;
    /** mass dimension of the term's coupling constant in 4D (0 = dimensionless). */
    couplingDim: number;
    /** is this a generally covariant scalar, or a frame-fixed expression? */
    covariant: boolean;
    /** does the term couple to spacetime curvature? */
    curvatureCoupling: boolean;
    /** is the curvature coupling the Weyl-squared (conformally invariant) form? */
    isWeyl: boolean;
}


export const LAGRANGIAN_TERMS: LagrangianTerm[] = [
    {
        id: 'quartic',
        latex: '\\lambda\\,\\varphi^4',
        label: 'quartic self-interaction',
        couplingDim: 0,
        covariant: true,
        curvatureCoupling: false,
        isWeyl: false,
    },
    {
        id: 'kinetic',
        latex: '(\\partial\\varphi)^2',
        label: 'scalar kinetic term',
        couplingDim: 0,
        covariant: true,
        curvatureCoupling: false,
        isWeyl: false,
    },
    {
        id: 'mass',
        latex: 'm^2\\,\\varphi^2',
        label: 'scalar mass term',
        couplingDim: 2,
        covariant: true,
        curvatureCoupling: false,
        isWeyl: false,
    },
    {
        id: 'einstein-hilbert',
        latex: 'M_P^2\\,R',
        label: 'Einstein-Hilbert term',
        couplingDim: 2,
        covariant: true,
        curvatureCoupling: true,
        isWeyl: false,
    },
    {
        id: 'cosmological',
        latex: '\\Lambda',
        label: 'cosmological constant',
        couplingDim: 4,
        covariant: true,
        curvatureCoupling: false,
        isWeyl: false,
    },
    {
        id: 'r-squared',
        latex: '\\alpha\\,R^2',
        label: 'curvature-squared term',
        couplingDim: 0,
        covariant: true,
        curvatureCoupling: true,
        isWeyl: false,
    },
    {
        id: 'weyl',
        latex: 'C_{\\mu\\nu\\rho\\sigma}^2',
        label: 'Weyl-squared (conformal) action',
        couplingDim: 0,
        covariant: true,
        curvatureCoupling: true,
        isWeyl: true,
    },
    {
        id: 'frame-fixed',
        latex: '(\\partial_t\\varphi)^2',
        label: 'preferred-frame kinetic term',
        couplingDim: 0,
        covariant: false,
        curvatureCoupling: false,
        isWeyl: false,
    },
];


export type TermStatus = 'kept' | 'merged' | 'removed';

export interface TermVerdict {
    term: LagrangianTerm;
    status: TermStatus;
    reason: string;
}


export function classifyTerm(term: LagrangianTerm, t: WardToggles): TermVerdict {
    if (t.diffeoInvariance && !term.covariant) {
        return { term, status: 'removed', reason: 'not generally covariant: forbidden by diffeomorphism invariance.' };
    }
    if (t.scaleInvariance && term.couplingDim !== 0) {
        return {
            term,
            status: 'removed',
            reason: `coupling has mass dimension ${term.couplingDim}: forbidden by scale invariance.`,
        };
    }
    if (t.conformalInvariance && term.couplingDim !== 0) {
        return {
            term,
            status: 'removed',
            reason: `dimensionful coupling: forbidden by conformal invariance.`,
        };
    }
    if (t.conformalInvariance && term.curvatureCoupling && !term.isWeyl) {
        return {
            term,
            status: 'removed',
            reason: 'non-Weyl curvature coupling: forbidden by conformal invariance (only the Weyl-squared form survives).',
        };
    }
    if (t.singleCoupling && term.couplingDim === 0) {
        return {
            term,
            status: 'merged',
            reason: 'dimensionless survivor: absorbed into the single gauge-like coupling.',
        };
    }
    return { term, status: 'kept', reason: 'allowed by the active symmetries.' };
}


export interface WardSummary {
    verdicts: TermVerdict[];
    kept: number;
    merged: number;
    removed: number;
    /** number of independent surviving couplings (merged terms collapse to one). */
    independentCouplings: number;
}


export function wardSummary(t: WardToggles): WardSummary {
    const verdicts = LAGRANGIAN_TERMS.map((term) => classifyTerm(term, t));
    const kept = verdicts.filter((v) => v.status === 'kept').length;
    const merged = verdicts.filter((v) => v.status === 'merged').length;
    const removed = verdicts.filter((v) => v.status === 'removed').length;
    const independentCouplings = kept + (merged > 0 ? 1 : 0);
    return { verdicts, kept, merged, removed, independentCouplings };
}
