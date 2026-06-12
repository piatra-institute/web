export type ClaimStatus = 'exact' | 'known' | 'speculative';

export const STATUS_LABEL: Record<ClaimStatus, string> = {
    exact: 'exact in toy model',
    known: 'known physics',
    speculative: 'speculative / paper claim',
};

export const STATUS_COLOR: Record<ClaimStatus, string> = {
    exact: '#a3e635',
    known: '#facc15',
    speculative: '#f97316',
};


export interface TriangleNode {
    id: 'qg' | 'ps' | 'phi4';
    latex: string;
    label: string;
    blurb: string;
}

export const TRIANGLE_NODES: TriangleNode[] = [
    {
        id: 'qg',
        latex: 'QG_{\\gamma\\downarrow 0}',
        label: 'constrained quantum gravity',
        blurb: 'a special limiting version of quantum gravity, restricted here to the conformally flat sector.',
    },
    {
        id: 'ps',
        latex: '\\mathrm{PS}',
        label: 'perfect-square action',
        blurb: 'a dimension-zero scalar theory whose action can be written as a perfect square.',
    },
    {
        id: 'phi4',
        latex: '\\lVert\\varphi\\rVert_4^4',
        label: '4D scalar phi-fourth',
        blurb: 'a quartic scalar theory in four dimensions, where the coupling is dimensionless.',
    },
];


export interface TriangleEdge {
    from: TriangleNode['id'];
    to: TriangleNode['id'];
    label: string;
    status: ClaimStatus;
    note: string;
}

export const TRIANGLE_EDGES: TriangleEdge[] = [
    {
        from: 'qg',
        to: 'ps',
        label: 'Ward identity (diffeo)',
        status: 'speculative',
        note: 'the proposal claims diffeomorphism invariance drives the UV gravity action into a perfect-square form. shown so far only for conformally flat metrics.',
    },
    {
        from: 'ps',
        to: 'phi4',
        label: 'single coupling',
        status: 'speculative',
        note: 'the perfect-square scalar action is claimed to rewrite as a 4D quartic theory controlled by one dimensionless coupling, by analogy with gauge theory.',
    },
    {
        from: 'qg',
        to: 'phi4',
        label: 'conformal reduction',
        status: 'known',
        note: 'that conformally flat gravity reduces to the dynamics of a single scalar conformal factor is standard; the full correspondence to phi-fourth is the speculative part.',
    },
];


export interface LedgerItem {
    claim: string;
    status: ClaimStatus;
    detail: string;
}

export const STATUS_LEDGER: LedgerItem[] = [
    {
        claim: 'a conformal factor changes scale, not causal structure',
        status: 'known',
        detail: 'light cones are invariant under g -> Omega^2 g; this is textbook conformal geometry.',
    },
    {
        claim: 'conformally flat means the Weyl tensor vanishes',
        status: 'known',
        detail: 'in 4D, C_{mu nu rho sigma} = 0 iff the metric is conformally flat. the free spin-2 gravitational field lives in the Weyl tensor.',
    },
    {
        claim: 'K = -Omega^{-2} Laplacian(ln Omega) for a 2D conformal slice',
        status: 'exact',
        detail: 'the curvature heatmap computes exactly this; it is validated against analytic constant-curvature metrics in the calibration panel.',
    },
    {
        claim: 'in 4D the phi-fourth coupling is dimensionless and runs by 3 lambda^2 / 16 pi^2',
        status: 'known',
        detail: 'standard one-loop result; reproduced in the flow tab. this is why a single coupling is structurally attractive.',
    },
    {
        claim: 'symmetry compresses the space of allowed Lagrangian terms',
        status: 'exact',
        detail: 'the Ward game shows scale, conformal, and diffeomorphism invariance deleting and merging terms, a toy of the proposal\'s Ward-identity statement.',
    },
    {
        claim: 'constrained quantum gravity equals a perfect-square scalar theory',
        status: 'speculative',
        detail: 'the central correspondence of the proposal. shown so far only for conformally flat metrics, and still research-level, not textbook physics.',
    },
    {
        claim: 'the correspondence extends to low energies including mass and Einstein-Hilbert terms',
        status: 'speculative',
        detail: 'claimed for the conformally flat sector only; the genuinely spin-2 part of gravity is not yet covered.',
    },
];
