export interface Molecule {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    type: 'C' | 'F' | 'A' | 'D' | 'G';
    color: string;
    boundTo: any;
}

export interface Autogen {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    enclosedMolecules: Molecule[];
    isFormed: boolean;
    isForming: boolean;
    fragility: number;
    fragilityThreshold: number;
}

export interface Template {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    length: number;
    bindingSites: BindingSite[];
}

export interface BindingSite {
    type: 'C' | 'F';
    position: number;
    boundMolecule: Molecule | null;
}

export interface Effect {
    x: number;
    y: number;
    type: 'flash' | 'shatter';
    life: number;
    radius: number;
}

export function createMolecule(x: number, y: number, type: Molecule['type']): Molecule {
    const colors = {
        C: '#84cc16', // lime-400
        F: '#bef264', // lime-300
        A: '#65a30d', // lime-600
        D: '#65a30d', // lime-600
        G: '#d9f99d'  // lime-200
    };
    
    return {
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 5,
        type,
        color: colors[type] || '#f97316',
        boundTo: null
    };
}

export function createAutogen(x: number, y: number): Autogen {
    return {
        x,
        y,
        radius: 0,
        maxRadius: 60,
        enclosedMolecules: [],
        isFormed: false,
        isForming: false,
        fragility: 0,
        fragilityThreshold: 20
    };
}

export function createTemplate(canvasWidth: number, canvasHeight: number): Template {
    const bindingSites: BindingSite[] = [];
    for (let i = 0; i < 10; i++) {
        bindingSites.push({ type: 'C', position: 0.1 + i * 0.08, boundMolecule: null });
        bindingSites.push({ type: 'F', position: 0.14 + i * 0.08, boundMolecule: null });
    }
    
    return {
        x1: 50,
        y1: canvasHeight / 2,
        x2: canvasWidth - 50,
        y2: canvasHeight / 2,
        length: canvasWidth - 100,
        bindingSites
    };
}

export function createEffect(x: number, y: number, type: 'flash' | 'shatter'): Effect {
    return {
        x,
        y,
        type,
        life: 10,
        radius: 5
    };
}

export function distanceBetween(obj1: { x: number; y: number }, obj2: { x: number; y: number }): number {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function moveMolecule(molecule: Molecule, autogens: Autogen[], canvasWidth: number, canvasHeight: number): void {
    if (molecule.boundTo) return;
    
    const isContained = autogens.some(ag => ag.isFormed && ag.enclosedMolecules.includes(molecule));
    if (isContained) return;
    
    molecule.x += molecule.vx;
    molecule.y += molecule.vy;
    
    if (molecule.x - molecule.radius < 0 || molecule.x + molecule.radius > canvasWidth) {
        molecule.vx *= -1;
    }
    if (molecule.y - molecule.radius < 0 || molecule.y + molecule.radius > canvasHeight) {
        molecule.vy *= -1;
    }
}

export function checkReaction(m1: Molecule, m2: Molecule, level: number): { 
    products: Molecule[], 
    consumed: Molecule[] 
} | null {
    if (level >= 3) return null;
    
    const types = [m1.type, m2.type].sort().join('');
    
    if (types === 'AC') {
        const substrate = m1.type === 'A' ? m1 : m2;
        const catalyst = m1.type === 'C' ? m1 : m2;
        return {
            products: [createMolecule(catalyst.x, catalyst.y, 'C')],
            consumed: [substrate]
        };
    } else if (types === 'DF') {
        const substrate = m1.type === 'D' ? m1 : m2;
        const catalyst = m1.type === 'F' ? m1 : m2;
        return {
            products: [createMolecule(substrate.x + 10, substrate.y + 10, 'G')],
            consumed: [substrate]
        };
    }
    
    return null;
}

export function formAutogen(autogen: Autogen, molecules: Molecule[]): Molecule[] {
    autogen.isForming = true;
    const consumedMolecules: Molecule[] = [];
    
    molecules.forEach(m => {
        if (['C', 'F'].includes(m.type) && distanceBetween(autogen, m) < autogen.maxRadius) {
            if (!autogen.enclosedMolecules.includes(m)) {
                autogen.enclosedMolecules.push(m);
            }
        }
    });
    
    return consumedMolecules;
}

export function updateAutogenFormation(autogen: Autogen): string {
    if (!autogen.isForming || autogen.isFormed) return '';
    
    autogen.radius += 1;
    if (autogen.radius >= autogen.maxRadius) {
        autogen.radius = autogen.maxRadius;
        autogen.isFormed = true;
        autogen.isForming = false;
        return 'Autogen formed! It is now inert.';
    }
    
    return '';
}

export function disruptAutogen(autogen: Autogen): void {
    if (!autogen.isFormed) return;
    
    autogen.enclosedMolecules.forEach(m => {
        m.boundTo = null;
    });
    autogen.enclosedMolecules = [];
}

export function checkTemplateReaction(
    template: Template, 
    molecules: Molecule[]
): { 
    products: Molecule[], 
    consumed: Molecule[], 
    effects: Effect[], 
    unboundSites: number[] 
} | null {
    const result = {
        products: [] as Molecule[],
        consumed: [] as Molecule[],
        effects: [] as Effect[],
        unboundSites: [] as number[]
    };
    
    for (let i = 0; i < template.bindingSites.length - 1; i++) {
        const site1 = template.bindingSites[i];
        const site2 = template.bindingSites[i + 1];
        
        if (site1.boundMolecule && site2.boundMolecule) {
            const reactionX = (site1.boundMolecule.x + site2.boundMolecule.x) / 2;
            
            // Check if we have C and F adjacent
            if ((site1.type === 'C' && site2.type === 'F') || (site1.type === 'F' && site2.type === 'C')) {
                const substrateA = molecules.find(m => 
                    m.type === 'A' && !m.boundTo && Math.abs(m.x - reactionX) < 50
                );
                const substrateD = molecules.find(m => 
                    m.type === 'D' && !m.boundTo && Math.abs(m.x - reactionX) < 50
                );
                
                // React if we have either substrate
                if (substrateA || substrateD) {
                    result.effects.push(createEffect(reactionX, template.y1, 'flash'));
                    
                    if (substrateA) {
                        result.products.push(createMolecule(substrateA.x, substrateA.y, 'C'));
                        result.consumed.push(substrateA);
                    }
                    if (substrateD) {
                        result.products.push(createMolecule(reactionX, template.y1 + 20, 'G'));
                        result.consumed.push(substrateD);
                    }
                    
                    // Only unbind if both reactions happened
                    if (substrateA && substrateD) {
                        result.unboundSites.push(i, i + 1);
                    }
                    
                    return result;
                }
            }
        }
    }
    
    return null;
}