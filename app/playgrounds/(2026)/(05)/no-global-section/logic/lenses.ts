export type LensKey = 'sheaf' | 'stalk' | 'monodromy' | 'obstruction' | 'derived';

export interface Lens {
    key: LensKey;
    label: string;
    formula: string;
    description: string;
    foregrounds: string;
}

export const LENSES: Record<LensKey, Lens> = {
    sheaf: {
        key: 'sheaf',
        label: 'sheaf',
        formula: 'F: Open(X)^op to C',
        description:
            'A sheaf assigns local meanings to regions, then asks whether they agree on overlaps. Narrative becomes a gluing problem rather than a representation problem.',
        foregrounds: 'compatibility of local sections across overlaps',
    },
    stalk: {
        key: 'stalk',
        label: 'stalk',
        formula: 'F_x = colim over neighborhoods U of x of F(U)',
        description:
            'A stalk is the infinitesimal local truth at a point. Ithaca, Eurydice, Rastignac’s Paris, Ulrich’s possibility, Castel’s tunnel: each is a germ where the entire story condenses.',
        foregrounds: 'the specific local point where meaning becomes binding',
    },
    monodromy: {
        key: 'monodromy',
        label: 'monodromy',
        formula: 'rho: pi_1(X) to Aut(F_x)',
        description:
            'Move around a closed loop in the base space and return changed. War, grief, ambition, irony, and obsession transport the self around nontrivial circuits and leave it with a different automorphism each time.',
        foregrounds: 'how the self is twisted by traversing the same situation twice',
    },
    obstruction: {
        key: 'obstruction',
        label: 'obstruction',
        formula: 'alpha in H^1(X, Aut(F))',
        description:
            'When local sections cannot glue, the mismatch is not a mistake. It is the story’s structure, classified by a cohomology class that measures exactly how much global coherence is impossible.',
        foregrounds: 'the precise size of the gap between local truths',
    },
    derived: {
        key: 'derived',
        label: 'derived',
        formula: 'R-Gamma(F), Ext, Tor, spectral residue',
        description:
            'Derived thinking keeps the failure terms. The interesting object is not just what exists, but what almost existed and left an obstruction behind. The residue is part of the story.',
        foregrounds: 'what almost was, and what its absence still does',
    },
};

export const LENS_KEYS: LensKey[] = ['sheaf', 'stalk', 'monodromy', 'obstruction', 'derived'];
