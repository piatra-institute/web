export type PresetKey = 'overview' | 'universal-templates' | 'action-hierarchy' | 'topology-surgery';
export type SortOption = 'name' | 'coverage' | 'difficulty';
export type Field = 'Group theory' | 'Ring / algebra' | 'Category theory' | 'Topology';
export type Difficulty = 'Foundational' | 'Core' | 'Intermediate' | 'Advanced';

export interface Mode {
    key: string;
    label: string;
    summary: string;
}

export interface Product {
    id: string;
    name: string;
    notation: string;
    field: Field[];
    mode: string[];
    difficulty: Difficulty;
    summary: string;
    oneLiner: string;
    intuition: string;
    useWhen: string[];
    compareTo: string;
    example: string;
}

export interface Params {
    search: string;
    selectedField: string;
    selectedMode: string;
    sortBy: SortOption;
    preset: PresetKey;
}

export const DEFAULT_PARAMS: Params = {
    search: '',
    selectedField: 'All',
    selectedMode: 'all',
    sortBy: 'name',
    preset: 'overview',
};

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'overview': {
        label: 'Full atlas',
        question: 'What is the complete landscape of product constructions?',
        expectation: 'All 25 constructions across 4 fields and 11 modes, sorted alphabetically.',
    },
    'universal-templates': {
        label: 'Universal templates',
        question: 'What are the four fundamental categorical shapes?',
        expectation: 'Product, coproduct, pullback, and pushout — the master patterns most constructions specialize.',
    },
    'action-hierarchy': {
        label: 'Action hierarchy',
        question: 'How does control complexity increase from semidirect to wreath to Zappa–Szép?',
        expectation: 'Three levels: one-sided control, distributed repetition, and mutual reshaping.',
    },
    'topology-surgery': {
        label: 'Topological surgery',
        question: 'How do topologists combine spaces?',
        expectation: 'From Cartesian products through wedge sums and connected sums to fiber bundles.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'overview':
            return { ...DEFAULT_PARAMS, preset: key };
        case 'universal-templates':
            return { ...DEFAULT_PARAMS, search: '', selectedField: 'Category theory', selectedMode: 'all', sortBy: 'name', preset: key };
        case 'action-hierarchy':
            return { ...DEFAULT_PARAMS, search: '', selectedField: 'Group theory', selectedMode: 'action', sortBy: 'coverage', preset: key };
        case 'topology-surgery':
            return { ...DEFAULT_PARAMS, search: '', selectedField: 'Topology', selectedMode: 'all', sortBy: 'difficulty', preset: key };
    }
}

export const FIELDS: Field[] = ['Group theory', 'Ring / algebra', 'Category theory', 'Topology'];

export const modes: Mode[] = [
    { key: 'juxtaposition', label: 'Juxtaposition', summary: 'Put objects side by side with minimal interaction.' },
    { key: 'freedom', label: 'Freedom', summary: 'Combine with as few new relations as possible.' },
    { key: 'action', label: 'Action', summary: 'One object acts on, controls, or reindexes another.' },
    { key: 'mutual-action', label: 'Mutual action', summary: 'Both sides reshape each other.' },
    { key: 'gluing', label: 'Gluing', summary: 'Identify or glue along shared structure.' },
    { key: 'compatibility', label: 'Compatibility', summary: 'Keep only pairs that match over common data.' },
    { key: 'interaction', label: 'Interaction', summary: 'Internalize or universalize structured interaction.' },
    { key: 'partial-commutativity', label: 'Partial commutativity', summary: 'Some parts commute, others do not.' },
    { key: 'quotient-collapse', label: 'Quotient collapse', summary: 'Combine and then mod out by a quotient.' },
    { key: 'twisting', label: 'Twisting', summary: 'Locally product-like, globally twisted.' },
    { key: 'hierarchical-repetition', label: 'Hierarchical repetition', summary: 'Many local modules organized by a higher-level action.' },
];

export const products: Product[] = [
    {
        id: 'direct-product',
        name: 'Direct product',
        notation: 'G × H / R × S / X × Y',
        field: ['Group theory', 'Ring / algebra', 'Category theory', 'Topology'],
        mode: ['juxtaposition'],
        difficulty: 'Foundational',
        summary: 'Combine objects side by side so each factor remains independently visible.',
        oneLiner: 'Independent coexistence.',
        intuition: 'You keep both objects at once, coordinate by coordinate, without forcing them to interact in any deeper way.',
        useWhen: ['The factors are genuinely independent', 'You want parallel symmetries or parallel state spaces', 'You want a baseline construction before adding interaction or gluing'],
        compareTo: 'Contrast with the free product, which maximizes freedom rather than independence.',
        example: 'In groups, (g₁, h₁)(g₂, h₂) = (g₁g₂, h₁h₂).',
    },
    {
        id: 'restricted-direct-product',
        name: 'Restricted direct product',
        notation: '∏′ Gᵢ',
        field: ['Group theory'],
        mode: ['juxtaposition'],
        difficulty: 'Intermediate',
        summary: 'An infinite direct product with the condition that almost all coordinates lie in chosen distinguished subgroups.',
        oneLiner: 'Controlled infinite coexistence.',
        intuition: 'Like an infinite direct product, but with a finiteness discipline so the construction stays tractable.',
        useWhen: ['You need infinitely many factors but want control over almost all coordinates', 'Arithmetic or adelic-style settings'],
        compareTo: 'More disciplined than a raw infinite product.',
        example: 'Adèlic constructions are built from restricted products.',
    },
    {
        id: 'semidirect-product',
        name: 'Semidirect product',
        notation: 'N ⋊ H',
        field: ['Group theory'],
        mode: ['action'],
        difficulty: 'Core',
        summary: 'One object acts on another, and the product remembers that action.',
        oneLiner: 'Controller plus substrate.',
        intuition: 'A direct product would keep the two groups independent; a semidirect product lets one factor reorganize the other.',
        useWhen: ['One layer acts on another', 'You are building nontrivial group extensions', 'There is a clean controller / state-space split'],
        compareTo: 'More interactive than a direct product, less distributed than a wreath product.',
        example: 'Euclidean motions combine translations and rotations via a semidirect product.',
    },
    {
        id: 'wreath-product',
        name: 'Wreath product',
        notation: 'G ≀ H ≅ G⁽ˣ⁾ ⋊ H',
        field: ['Group theory'],
        mode: ['action', 'hierarchical-repetition'],
        difficulty: 'Advanced',
        summary: 'Many copies of one object are indexed by a set, and a higher layer acts by permuting or reorganizing them.',
        oneLiner: 'Repeated local modules under higher coordination.',
        intuition: 'A semidirect product gives one substrate and one controller. A wreath product gives many local substrates plus a controller of their arrangement.',
        useWhen: ['The same local machine is repeated many times', 'A higher-scale process permutes or coordinates those copies', 'You need a formalism for distributed hierarchy'],
        compareTo: 'Compared with semidirect products, wreath products add replication across many indexed local factors.',
        example: 'Permutation groups and automata theory use wreath products heavily.',
    },
    {
        id: 'zappa-szep',
        name: 'Zappa–Szép product',
        notation: 'G ⋈ H',
        field: ['Group theory'],
        mode: ['mutual-action'],
        difficulty: 'Advanced',
        summary: 'A generalization of semidirect products where both factors act on each other and neither must be normal.',
        oneLiner: 'Co-determined multiplication.',
        intuition: 'Not one controller acting on one substrate; rather, both sides help define the multiplication law itself.',
        useWhen: ['No factor is naturally subordinate to the other', 'You want mutual reshaping rather than one-sided control'],
        compareTo: 'A more symmetric alternative to the semidirect product.',
        example: 'Useful when two substructures factor a group without the normality assumptions of semidirect products.',
    },
    {
        id: 'free-product',
        name: 'Free product',
        notation: 'G * H',
        field: ['Group theory', 'Category theory', 'Ring / algebra'],
        mode: ['freedom'],
        difficulty: 'Core',
        summary: 'Merge objects with as few new relations as possible.',
        oneLiner: 'Maximal freedom.',
        intuition: 'Instead of forcing components to commute or align, you keep only the relations already present inside each factor.',
        useWhen: ['You want the freest merger', 'You want noncommutative coexistence', 'You want a coproduct in group-like settings'],
        compareTo: 'The opposite pole from direct product.',
        example: 'In groups, words alternate between elements from each factor, modulo only the internal relations.',
    },
    {
        id: 'graph-product',
        name: 'Graph product',
        notation: 'ΠΓ Gᵥ',
        field: ['Group theory'],
        mode: ['partial-commutativity'],
        difficulty: 'Intermediate',
        summary: 'Attach a group to each vertex of a graph and make adjacent vertex groups commute.',
        oneLiner: 'Commutativity controlled by geometry.',
        intuition: 'The graph decides which factors may ignore each other and which must interact by commuting.',
        useWhen: ['Some pairs should commute but not all', 'You want a continuous bridge between free and direct products'],
        compareTo: 'No edges gives a free product; a complete graph gives a direct product.',
        example: 'Right-angled Artin groups are classic graph products.',
    },
    {
        id: 'amalgamated-free-product',
        name: 'Free product with amalgamation',
        notation: 'G *_A H',
        field: ['Group theory', 'Category theory'],
        mode: ['gluing'],
        difficulty: 'Intermediate',
        summary: 'Glue two objects along a shared subobject.',
        oneLiner: 'External gluing.',
        intuition: 'Take a free merger, then identify a common overlap so the two sides share a spine.',
        useWhen: ['Two structures share a meaningful common part', 'You want to encode gluing rather than independent coexistence'],
        compareTo: 'Free product plus an overlap constraint.',
        example: 'A basic construction in Bass–Serre theory.',
    },
    {
        id: 'hnn-extension',
        name: 'HNN extension',
        notation: '⟨G, t | t⁻¹At = B⟩',
        field: ['Group theory'],
        mode: ['gluing'],
        difficulty: 'Advanced',
        summary: 'Add a new element that identifies two isomorphic subgroups of the same object by conjugation.',
        oneLiner: 'Internal self-gluing.',
        intuition: 'Instead of gluing two different groups together, you build a bridge inside a single group between two matching regions.',
        useWhen: ['One structure must be glued to itself internally', 'Recursive or self-similar structure appears'],
        compareTo: 'The self-gluing analogue of amalgamated free products.',
        example: 'Baumslag–Solitar groups arise this way.',
    },
    {
        id: 'central-product',
        name: 'Central product',
        notation: '(G × H)/ΔZ',
        field: ['Group theory'],
        mode: ['quotient-collapse', 'gluing'],
        difficulty: 'Intermediate',
        summary: 'Take a direct product and identify chosen central subgroups.',
        oneLiner: 'Shared center collapsed.',
        intuition: 'Almost a direct product, except some central information is declared identical across the factors.',
        useWhen: ['The factors are mostly independent but share central data', 'You need a quotient-glued version of a direct product'],
        compareTo: 'A direct product with central overlap collapsed.',
        example: 'Common in finite group theory.',
    },
    {
        id: 'fiber-product-group',
        name: 'Fiber product',
        notation: 'G ×_Q H',
        field: ['Group theory', 'Ring / algebra', 'Category theory', 'Topology'],
        mode: ['compatibility'],
        difficulty: 'Core',
        summary: 'Keep only pairs that match over a shared target or quotient.',
        oneLiner: 'Synchronization by common image.',
        intuition: 'Not all pairs are allowed; only those that agree when viewed through a shared observable.',
        useWhen: ['Two objects must agree over common data', 'You care about matched states rather than all pairs'],
        compareTo: 'A filtered version of the direct product.',
        example: '{(g, h) : φ(g) = ψ(h)}.',
    },
    {
        id: 'tensor-product',
        name: 'Tensor product',
        notation: 'R ⊗ₖ S / V ⊗ W',
        field: ['Ring / algebra', 'Category theory'],
        mode: ['interaction'],
        difficulty: 'Core',
        summary: 'Universalize bilinear interaction rather than storing mere ordered pairs.',
        oneLiner: 'Interaction internalized.',
        intuition: 'A direct product keeps two coordinates. A tensor product turns structured bilinear interaction into an object in its own right.',
        useWhen: ['Bilinearity is central', 'You want to model interaction rather than coexistence', 'You are in a monoidal or linear setting'],
        compareTo: 'Deeper than direct products; not side-by-side but interaction-oriented.',
        example: 'The tensor product of vector spaces is universal for bilinear maps.',
    },
    {
        id: 'crossed-product',
        name: 'Crossed product',
        notation: 'A ⋊_α G',
        field: ['Ring / algebra'],
        mode: ['action', 'quotient-collapse'],
        difficulty: 'Advanced',
        summary: 'Combine an algebra with a group action, often together with twisting cocycle data.',
        oneLiner: 'Action plus twist.',
        intuition: 'The algebra remembers its own multiplication, but the external symmetry action is promoted into the combined object as well.',
        useWhen: ['Dynamics and symmetry both matter', 'Operator-algebraic or noncommutative settings appear'],
        compareTo: 'Like a semidirect idea for algebras, often with additional cocycle twisting.',
        example: 'Common in operator algebras and noncommutative geometry.',
    },
    {
        id: 'smash-product',
        name: 'Smash product',
        notation: 'A # H / X ∧ Y',
        field: ['Ring / algebra', 'Topology', 'Category theory'],
        mode: ['interaction', 'quotient-collapse'],
        difficulty: 'Advanced',
        summary: 'A product-shaped construction enhanced by a quotient or an action-based collapse.',
        oneLiner: 'Product plus collapse.',
        intuition: 'You first combine two structures, then identify a distinguished subpiece so the result behaves like a pointed or action-sensitive interaction space.',
        useWhen: ['You need a pointed or quotient-enhanced notion of interaction', 'Hopf algebra or based-space contexts are central'],
        compareTo: 'A more aggressive interaction than direct products, with collapsing built in.',
        example: 'In topology, X ∧ Y = (X × Y)/(X ∨ Y).',
    },
    {
        id: 'bicrossed-product',
        name: 'Bicrossed product',
        notation: '(varies)',
        field: ['Ring / algebra'],
        mode: ['mutual-action'],
        difficulty: 'Advanced',
        summary: 'A Hopf-algebraic mutual-action construction analogous to Zappa–Szép products.',
        oneLiner: 'Mutual deformation in Hopf form.',
        intuition: 'Each side acts on the other, and the combined object encodes that reciprocal structure.',
        useWhen: ['A one-sided action is too weak', 'Hopf-algebraic symmetry must be treated on both sides'],
        compareTo: 'The mutual-action cousin of smash or crossed products.',
        example: 'Matched-pair constructions in Hopf algebra.',
    },
    {
        id: 'categorical-product',
        name: 'Categorical product',
        notation: 'A × B',
        field: ['Category theory'],
        mode: ['juxtaposition'],
        difficulty: 'Foundational',
        summary: 'The universal object equipped with projections to both factors.',
        oneLiner: 'Best object mapping to both.',
        intuition: 'Not defined by internal elements but by a universal property: any other object mapping to both factors factors uniquely through it.',
        useWhen: ['You want a field-agnostic notion of product', 'Universal properties matter more than coordinates'],
        compareTo: 'Abstracts the direct product across categories.',
        example: 'In sets it is the Cartesian product; in groups it is the direct product.',
    },
    {
        id: 'coproduct',
        name: 'Coproduct',
        notation: 'A ⨿ B',
        field: ['Category theory', 'Group theory'],
        mode: ['freedom'],
        difficulty: 'Foundational',
        summary: 'The universal object receiving maps from both factors.',
        oneLiner: 'Freest object containing both.',
        intuition: 'The dual of a product: instead of projecting outward to both factors, it accepts them both with minimal imposed relations.',
        useWhen: ['You need the most permissive merger compatible with the category', 'You want the categorical version of free combination'],
        compareTo: 'In groups this is the free product; in sets it is disjoint union.',
        example: 'Sets use disjoint union; groups use free products.',
    },
    {
        id: 'pullback',
        name: 'Pullback',
        notation: 'A ×_C B',
        field: ['Category theory', 'Topology', 'Group theory', 'Ring / algebra'],
        mode: ['compatibility'],
        difficulty: 'Core',
        summary: 'The universal object of pairs that agree over a common target.',
        oneLiner: 'Universal compatibility.',
        intuition: 'A pullback is the cleanest abstract version of matching over shared data.',
        useWhen: ['Compatibility over a common target is the real issue', 'You want an abstract version of fiber products'],
        compareTo: 'The categorical master form of fiber products.',
        example: 'Given A → C ← B, the pullback captures compatible pairs.',
    },
    {
        id: 'pushout',
        name: 'Pushout',
        notation: 'A ⨿_C B',
        field: ['Category theory', 'Group theory', 'Topology'],
        mode: ['gluing'],
        difficulty: 'Core',
        summary: 'The universal gluing object along a shared source.',
        oneLiner: 'Universal amalgamation.',
        intuition: 'Take two structures that receive the same substructure, then glue them together along that shared input.',
        useWhen: ['You want gluing rather than matching', 'You want the categorical template behind amalgamation or quotient attachment'],
        compareTo: 'Dual to the pullback.',
        example: 'Topological attachment spaces are often pushouts.',
    },
    {
        id: 'monoidal-product',
        name: 'Monoidal product',
        notation: 'A ⊗ B',
        field: ['Category theory'],
        mode: ['interaction'],
        difficulty: 'Intermediate',
        summary: 'A chosen multiplication internal to a category.',
        oneLiner: 'Category-native multiplication.',
        intuition: 'A category may come with its own preferred way to combine objects, such as Cartesian product or tensor product.',
        useWhen: ['The category itself has a distinguished multiplication', 'You want a uniform abstraction of tensor-like combination'],
        compareTo: 'Broader than tensor products; tensor is one monoidal structure among many.',
        example: 'Vector spaces use tensor product; sets often use Cartesian product.',
    },
    {
        id: 'cartesian-product-space',
        name: 'Cartesian product',
        notation: 'X × Y',
        field: ['Topology'],
        mode: ['juxtaposition'],
        difficulty: 'Foundational',
        summary: 'The ordinary product space of all ordered pairs of points.',
        oneLiner: 'All pairs of points.',
        intuition: 'The topological version of side-by-side coexistence.',
        useWhen: ['You want independent coordinates on spaces', 'You want the baseline combination before quotienting or gluing'],
        compareTo: 'Foundation for smash products, bundles, and many quotient constructions.',
        example: 'A cylinder is S¹ × I.',
    },
    {
        id: 'wedge-sum',
        name: 'Wedge sum',
        notation: 'X ∨ Y',
        field: ['Topology'],
        mode: ['gluing'],
        difficulty: 'Intermediate',
        summary: 'Glue two based spaces at a single distinguished point.',
        oneLiner: 'Touch at one point.',
        intuition: 'Two spaces remain mostly separate but share one basepoint, like two loops pinned together.',
        useWhen: ['You need a light-touch gluing of based spaces', 'You want the quotient ingredient used in smash products'],
        compareTo: 'Much lighter gluing than a connected sum.',
        example: 'A figure-eight space is a wedge of two circles.',
    },
    {
        id: 'join',
        name: 'Join',
        notation: 'X * Y',
        field: ['Topology'],
        mode: ['interaction'],
        difficulty: 'Intermediate',
        summary: 'Connect every point of one space to every point of the other by line segments.',
        oneLiner: 'Interpolation by connection.',
        intuition: 'Where a Cartesian product stores pairs, a join builds bridges between every point of one space and every point of the other.',
        useWhen: ['Interpolation or suspension-like growth matters', 'You want a more geometric notion of combination'],
        compareTo: 'More connective and expansive than ordinary products.',
        example: 'The join of two spheres produces a higher-dimensional sphere.',
    },
    {
        id: 'connected-sum',
        name: 'Connected sum',
        notation: 'M # N',
        field: ['Topology'],
        mode: ['gluing'],
        difficulty: 'Intermediate',
        summary: 'Remove a ball from each manifold and glue along the resulting sphere boundaries.',
        oneLiner: 'Surgical splicing.',
        intuition: 'Instead of pairing points, you cut holes and stitch the spaces together through those openings.',
        useWhen: ['You want to combine manifolds by surgery', 'Global topological structure is the object of study'],
        compareTo: 'Far more geometric than product spaces.',
        example: 'The connected sum of two tori gives a genus-2 surface.',
    },
    {
        id: 'fiber-bundle',
        name: 'Fiber bundle / twisted product',
        notation: 'F ↪ E → B',
        field: ['Topology'],
        mode: ['twisting'],
        difficulty: 'Advanced',
        summary: 'Locally a product, globally twisted by transition data.',
        oneLiner: 'Local product, global obstruction.',
        intuition: 'Every small patch looks like a plain product, but globally the pieces may be stitched with twists that prevent a global factorization.',
        useWhen: ['Local product structure exists without global triviality', 'Geometry or topology carries hidden twist information'],
        compareTo: 'Semidirect-like in spirit, but geometric rather than purely algebraic.',
        example: 'The Möbius band is locally an interval bundle over a circle but globally twisted.',
    },
];

function scoreProduct(p: Product): number {
    let score = p.mode.length * 12 + p.field.length * 7;
    if (p.id === 'wreath-product') score += 10;
    if (p.id === 'tensor-product') score += 8;
    if (p.id === 'pullback') score += 8;
    if (p.id === 'pushout') score += 8;
    return score;
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
    Foundational: 1,
    Core: 2,
    Intermediate: 3,
    Advanced: 4,
};

export function filterProducts(params: Params): Product[] {
    const q = params.search.trim().toLowerCase();
    let items = products.filter(p => {
        const fieldOK = params.selectedField === 'All' || p.field.includes(params.selectedField as Field);
        const modeOK = params.selectedMode === 'all' || p.mode.includes(params.selectedMode);
        if (!fieldOK || !modeOK) return false;
        if (!q) return true;
        const text = [p.name, p.notation, p.summary, p.oneLiner, p.intuition, p.compareTo, ...p.field, ...p.mode].join(' ').toLowerCase();
        return text.includes(q);
    });

    if (params.sortBy === 'name') {
        items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else if (params.sortBy === 'coverage') {
        items = [...items].sort((a, b) => scoreProduct(b) - scoreProduct(a));
    } else if (params.sortBy === 'difficulty') {
        items = [...items].sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    }

    return items;
}

export interface MatrixRow {
    field: Field;
    cells: { key: string; count: number }[];
}

export function computeMatrix(): MatrixRow[] {
    return FIELDS.map(field => ({
        field,
        cells: modes.map(m => ({
            key: m.key,
            count: products.filter(p => p.field.includes(field) && p.mode.includes(m.key)).length,
        })),
    }));
}

export function modeCount(modeKey: string): number {
    return products.filter(p => p.mode.includes(modeKey)).length;
}

export function nearbyConstructions(selected: Product): Product[] {
    return products
        .filter(p => p.id !== selected.id)
        .filter(p => p.mode.some(m => selected.mode.includes(m)) || p.field.some(f => selected.field.includes(f)))
        .slice(0, 8);
}

export function computeNarrative(params: Params, filtered: Product[]): string {
    const total = products.length;
    if (params.selectedField === 'All' && params.selectedMode === 'all' && !params.search) {
        return `Showing all ${total} constructions across ${FIELDS.length} fields and ${modes.length} modes of combination.`;
    }
    const parts: string[] = [`${filtered.length} of ${total} constructions visible.`];
    if (params.selectedField !== 'All') {
        parts.push(`Field: ${params.selectedField}.`);
    }
    if (params.selectedMode !== 'all') {
        const m = modes.find(m => m.key === params.selectedMode);
        if (m) parts.push(`Mode: ${m.label} — ${m.summary.toLowerCase()}`);
    }
    if (params.search) {
        parts.push(`Search: “${params.search}”.`);
    }
    return parts.join(' ');
}
