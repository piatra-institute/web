export type Domain = 'igneous' | 'sedimentary' | 'metamorphic';
export type ViewMode = 'classifier' | 'atlas' | 'graph';
export type IgneousTexture = 'plutonic' | 'volcanic' | 'hypabyssal' | 'glassy';
export type SedType = 'clastic' | 'chemical' | 'organic';
export type GrainSize = 'clay' | 'silt' | 'sand' | 'gravel';
export type ChemComposition = 'carbonate' | 'siliceous' | 'evaporite';
export type OrganicType = 'plant' | 'shell' | 'siliceous';
export type Protolith = 'pelitic' | 'mafic' | 'quartzose' | 'calcareous' | 'ultramafic' | 'felsic';
export type Pressure = 'low' | 'medium' | 'high';

export const DOMAIN_COLORS: Record<Domain, string> = {
    igneous: '#ef4444',
    sedimentary: '#eab308',
    metamorphic: '#84cc16',
};

export const DOMAIN_COLORS_DIM: Record<Domain, string> = {
    igneous: 'rgba(239, 68, 68, 0.15)',
    sedimentary: 'rgba(234, 179, 8, 0.15)',
    metamorphic: 'rgba(132, 204, 22, 0.15)',
};

export interface Params {
    viewMode: ViewMode;
    domain: Domain;
    // Igneous
    sio2: number;
    texture: IgneousTexture;
    highAlkali: boolean;
    vesicular: boolean;
    veryCoarse: boolean;
    ol: number;
    opx: number;
    cpx: number;
    // Sedimentary
    sedType: SedType;
    grainSize: GrainSize;
    fissile: boolean;
    rounded: boolean;
    glacial: boolean;
    feldspathic: boolean;
    poorlySorted: boolean;
    chemComposition: ChemComposition;
    mgRich: boolean;
    biogenic: boolean;
    hotSpring: boolean;
    organicType: OrganicType;
    // Metamorphic
    protolith: Protolith;
    grade: number;
    pressure: Pressure;
    contact: boolean;
    // Atlas/graph
    selectedRockId: string | null;
    atlasFilter: Domain | 'all';
}

export const DEFAULT_PARAMS: Params = {
    viewMode: 'classifier',
    domain: 'igneous',
    sio2: 70,
    texture: 'plutonic',
    highAlkali: false,
    vesicular: false,
    veryCoarse: false,
    ol: 80,
    opx: 10,
    cpx: 10,
    sedType: 'clastic',
    grainSize: 'sand',
    fissile: false,
    rounded: true,
    glacial: false,
    feldspathic: false,
    poorlySorted: false,
    chemComposition: 'carbonate',
    mgRich: false,
    biogenic: false,
    hotSpring: false,
    organicType: 'plant',
    protolith: 'pelitic',
    grade: 50,
    pressure: 'medium',
    contact: false,
    selectedRockId: null,
    atlasFilter: 'all',
};

export const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: 'classifier', label: 'Classifier' },
    { key: 'atlas', label: 'Atlas' },
    { key: 'graph', label: 'Rock Cycle' },
];

export const DOMAIN_OPTIONS: { key: Domain; label: string }[] = [
    { key: 'igneous', label: 'Igneous' },
    { key: 'sedimentary', label: 'Sedimentary' },
    { key: 'metamorphic', label: 'Metamorphic' },
];

export const TEXTURE_OPTIONS: { key: IgneousTexture; label: string }[] = [
    { key: 'plutonic', label: 'Plutonic' },
    { key: 'volcanic', label: 'Volcanic' },
    { key: 'hypabyssal', label: 'Hypabyssal' },
    { key: 'glassy', label: 'Glassy' },
];

export const SED_TYPE_OPTIONS: { key: SedType; label: string }[] = [
    { key: 'clastic', label: 'Clastic' },
    { key: 'chemical', label: 'Chemical' },
    { key: 'organic', label: 'Organic' },
];

export const GRAIN_SIZE_OPTIONS: { key: GrainSize; label: string }[] = [
    { key: 'clay', label: 'Clay' },
    { key: 'silt', label: 'Silt' },
    { key: 'sand', label: 'Sand' },
    { key: 'gravel', label: 'Gravel' },
];

export const CHEM_COMPOSITION_OPTIONS: { key: ChemComposition; label: string }[] = [
    { key: 'carbonate', label: 'Carbonate' },
    { key: 'siliceous', label: 'Siliceous' },
    { key: 'evaporite', label: 'Evaporite' },
];

export const ORGANIC_TYPE_OPTIONS: { key: OrganicType; label: string }[] = [
    { key: 'plant', label: 'Plant' },
    { key: 'shell', label: 'Shell' },
    { key: 'siliceous', label: 'Siliceous' },
];

export const PROTOLITH_OPTIONS: { key: Protolith; label: string }[] = [
    { key: 'pelitic', label: 'Pelitic (shale)' },
    { key: 'mafic', label: 'Mafic (basalt)' },
    { key: 'quartzose', label: 'Quartzose (sandstone)' },
    { key: 'calcareous', label: 'Calcareous (limestone)' },
    { key: 'ultramafic', label: 'Ultramafic (peridotite)' },
    { key: 'felsic', label: 'Felsic (granite)' },
];

export const PRESSURE_OPTIONS: { key: Pressure; label: string }[] = [
    { key: 'low', label: 'Low' },
    { key: 'medium', label: 'Medium' },
    { key: 'high', label: 'High' },
];

export { ROCKS, type Rock } from './data';
export { classifyIgneous, classifySedimentary, classifyMetamorphic, type ClassificationResult } from './classify';

export interface Preset {
    name: string;
    domain: Domain;
    params: Partial<Params>;
}

export const PRESETS: Preset[] = [
    {
        name: 'Granite',
        domain: 'igneous',
        params: { domain: 'igneous', sio2: 72, texture: 'plutonic', highAlkali: false },
    },
    {
        name: 'Basalt',
        domain: 'igneous',
        params: { domain: 'igneous', sio2: 49, texture: 'volcanic', highAlkali: false },
    },
    {
        name: 'Dunite',
        domain: 'igneous',
        params: { domain: 'igneous', sio2: 40, texture: 'plutonic', ol: 95, opx: 3, cpx: 2 },
    },
    {
        name: 'Obsidian',
        domain: 'igneous',
        params: { domain: 'igneous', sio2: 72, texture: 'glassy' },
    },
    {
        name: 'Sandstone',
        domain: 'sedimentary',
        params: { domain: 'sedimentary', sedType: 'clastic', grainSize: 'sand', rounded: true, feldspathic: false },
    },
    {
        name: 'Limestone',
        domain: 'sedimentary',
        params: { domain: 'sedimentary', sedType: 'chemical', chemComposition: 'carbonate', mgRich: false, biogenic: false },
    },
    {
        name: 'Marble',
        domain: 'metamorphic',
        params: { domain: 'metamorphic', protolith: 'calcareous', grade: 60, pressure: 'medium', contact: false },
    },
    {
        name: 'Eclogite',
        domain: 'metamorphic',
        params: { domain: 'metamorphic', protolith: 'mafic', grade: 85, pressure: 'high', contact: false },
    },
];
