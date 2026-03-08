import type { IgneousTexture, SedType, GrainSize, ChemComposition, OrganicType, Protolith, Pressure } from './index';
import { ROCKS, type Rock } from './data';

export interface ClassificationResult {
    rock: Rock;
    why: string;
    neighbors: Rock[];
}

function findRock(id: string): Rock {
    return ROCKS.find((r) => r.id === id) ?? ROCKS[0];
}

function getNeighbors(rock: Rock): Rock[] {
    return rock.neighbors.map((nid) => ROCKS.find((r) => r.id === nid)).filter(Boolean) as Rock[];
}

function normalizeTernary(ol: number, opx: number, cpx: number) {
    const sum = ol + opx + cpx;
    if (sum === 0) return { ol: 0, opx: 0, cpx: 0 };
    return {
        ol: (ol / sum) * 100,
        opx: (opx / sum) * 100,
        cpx: (cpx / sum) * 100,
    };
}

// ────────────────────────────────────────────────────────────────
// IGNEOUS
// ────────────────────────────────────────────────────────────────

interface IgneousParams {
    sio2: number;
    texture: IgneousTexture;
    highAlkali: boolean;
    vesicular: boolean;
    veryCoarse: boolean;
    ol: number;
    opx: number;
    cpx: number;
}

export function classifyIgneous(params: IgneousParams): ClassificationResult {
    const { sio2, texture, highAlkali, vesicular, veryCoarse, ol, opx, cpx } = params;

    // Special textures override
    if (texture === 'glassy') {
        if (vesicular) {
            const rock = findRock('pumice');
            return { rock, why: 'Glassy texture with vesicular structure indicates explosive eruption trapping gas in rapidly cooling glass.', neighbors: getNeighbors(rock) };
        }
        const rock = findRock('obsidian');
        return { rock, why: 'Glassy texture with no crystals indicates extremely rapid cooling of silica-rich lava.', neighbors: getNeighbors(rock) };
    }

    if (vesicular && texture === 'volcanic') {
        const rock = findRock('pumice');
        return { rock, why: 'Volcanic texture with abundant vesicles (gas bubbles) points to pumice from explosive eruption.', neighbors: getNeighbors(rock) };
    }

    if (veryCoarse && texture === 'plutonic') {
        const rock = findRock('pegmatite');
        return { rock, why: 'Very coarse grain size (>2 cm) in a plutonic setting indicates late-stage, volatile-rich crystallization forming pegmatite.', neighbors: getNeighbors(rock) };
    }

    // Ultramafic (SiO2 < 45%)
    if (sio2 < 45) {
        // Volcanic ultramafic
        if (texture === 'volcanic') {
            const rock = findRock('komatiite');
            return { rock, why: `SiO₂ = ${sio2}% (ultramafic) with volcanic texture. Very hot mantle-derived eruption forming komatiite.`, neighbors: getNeighbors(rock) };
        }

        // Plutonic ultramafic — use ternary classification
        const norm = normalizeTernary(ol, opx, cpx);

        if (norm.ol >= 90) {
            const rock = findRock('dunite');
            return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Olivine = ${norm.ol.toFixed(0)}% dominates overwhelmingly (≥90%), defining dunite.`, neighbors: getNeighbors(rock) };
        }

        if (norm.ol >= 40) {
            if (norm.opx > norm.cpx * 1.3) {
                const rock = findRock('harzburgite');
                return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Ol = ${norm.ol.toFixed(0)}% with Opx > Cpx — a harzburgite, the residual mantle peridotite.`, neighbors: getNeighbors(rock) };
            }
            if (norm.cpx > norm.opx * 1.3) {
                const rock = findRock('wehrlite');
                return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Ol = ${norm.ol.toFixed(0)}% with Cpx > Opx — a wehrlite, a clinopyroxene-bearing peridotite.`, neighbors: getNeighbors(rock) };
            }
            const rock = findRock('lherzolite');
            return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Ol = ${norm.ol.toFixed(0)}% with both pyroxenes present — lherzolite, the "fertile" mantle rock.`, neighbors: getNeighbors(rock) };
        }

        if (norm.opx >= 70) {
            const rock = findRock('orthopyroxenite');
            return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Low olivine with Opx = ${norm.opx.toFixed(0)}% dominant — an orthopyroxenite.`, neighbors: getNeighbors(rock) };
        }

        if (norm.cpx >= 70) {
            const rock = findRock('clinopyroxenite');
            return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Low olivine with Cpx = ${norm.cpx.toFixed(0)}% dominant — a clinopyroxenite.`, neighbors: getNeighbors(rock) };
        }

        const rock = findRock('websterite');
        return { rock, why: `SiO₂ = ${sio2}% (ultramafic). Low olivine with both pyroxenes roughly equal — a websterite.`, neighbors: getNeighbors(rock) };
    }

    // Mafic (45-52%)
    if (sio2 < 52) {
        if (texture === 'plutonic') {
            const rock = findRock('gabbro');
            return { rock, why: `SiO₂ = ${sio2}% (mafic) with plutonic texture. Slow cooling at depth forms coarse-grained gabbro.`, neighbors: getNeighbors(rock) };
        }
        if (texture === 'hypabyssal') {
            const rock = findRock('diabase');
            return { rock, why: `SiO₂ = ${sio2}% (mafic) with hypabyssal texture. Intermediate cooling in dikes/sills forms diabase.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('basalt');
        return { rock, why: `SiO₂ = ${sio2}% (mafic) with volcanic texture. Rapid surface cooling forms fine-grained basalt.`, neighbors: getNeighbors(rock) };
    }

    // Intermediate (52-63%)
    if (sio2 < 63) {
        if (highAlkali) {
            if (texture === 'plutonic') {
                const rock = findRock('syenite');
                return { rock, why: `SiO₂ = ${sio2}% (intermediate) + high alkali + plutonic. Alkali feldspar dominance defines syenite.`, neighbors: getNeighbors(rock) };
            }
            const rock = findRock('trachyte');
            return { rock, why: `SiO₂ = ${sio2}% (intermediate) + high alkali + volcanic. Fine-grained alkali-rich lava forms trachyte.`, neighbors: getNeighbors(rock) };
        }
        if (texture === 'plutonic') {
            const rock = findRock('diorite');
            return { rock, why: `SiO₂ = ${sio2}% (intermediate) + plutonic texture. Plagioclase + hornblende form coarse-grained diorite.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('andesite');
        return { rock, why: `SiO₂ = ${sio2}% (intermediate) with volcanic texture. Common at subduction zones as andesite.`, neighbors: getNeighbors(rock) };
    }

    // Felsic (≥63%)
    if (texture === 'plutonic') {
        if (sio2 >= 70) {
            const rock = findRock('granite');
            return { rock, why: `SiO₂ = ${sio2}% (felsic, ≥70%) + plutonic. Quartz + feldspar + mica in a coarse-grained texture defines granite.`, neighbors: getNeighbors(rock) };
        }
        if (sio2 >= 66) {
            const rock = findRock('granodiorite');
            return { rock, why: `SiO₂ = ${sio2}% (felsic, 66-70%) + plutonic. More plagioclase than alkali feldspar places this as granodiorite.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('tonalite');
        return { rock, why: `SiO₂ = ${sio2}% (felsic, 63-66%) + plutonic. Plagioclase-dominant with quartz defines tonalite.`, neighbors: getNeighbors(rock) };
    }

    // Felsic volcanic
    if (sio2 >= 70) {
        const rock = findRock('rhyolite');
        return { rock, why: `SiO₂ = ${sio2}% (felsic, ≥70%) + volcanic. Fine-grained, silica-rich lava forms rhyolite.`, neighbors: getNeighbors(rock) };
    }
    const rock = findRock('dacite');
    return { rock, why: `SiO₂ = ${sio2}% (felsic, 63-70%) + volcanic. Intermediate-to-felsic volcanic forming dacite.`, neighbors: getNeighbors(rock) };
}


// ────────────────────────────────────────────────────────────────
// SEDIMENTARY
// ────────────────────────────────────────────────────────────────

interface SedimentaryParams {
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
}

export function classifySedimentary(params: SedimentaryParams): ClassificationResult {
    const { sedType, grainSize, fissile, rounded, glacial, feldspathic, poorlySorted, chemComposition, mgRich, biogenic, hotSpring, organicType } = params;

    // ── Clastic ──
    if (sedType === 'clastic') {
        if (grainSize === 'gravel') {
            if (glacial) {
                const rock = findRock('tillite');
                return { rock, why: 'Gravel-sized + glacial origin. Unsorted mix of all grain sizes from glacial deposition, lithified into tillite.', neighbors: getNeighbors(rock) };
            }
            if (rounded) {
                const rock = findRock('conglomerate');
                return { rock, why: 'Gravel-sized clasts (>2 mm) that are rounded indicate significant transport distance, forming conglomerate.', neighbors: getNeighbors(rock) };
            }
            const rock = findRock('breccia');
            return { rock, why: 'Gravel-sized clasts (>2 mm) that are angular indicate short transport, forming breccia.', neighbors: getNeighbors(rock) };
        }

        if (grainSize === 'sand') {
            if (feldspathic) {
                const rock = findRock('arkose');
                return { rock, why: 'Sand-sized grains with >25% feldspar content. Rapid erosion of granitic source forms arkose.', neighbors: getNeighbors(rock) };
            }
            if (poorlySorted) {
                const rock = findRock('graywacke');
                return { rock, why: 'Sand-sized grains, poorly sorted with abundant rock fragments and clay matrix. Turbidite-origin graywacke.', neighbors: getNeighbors(rock) };
            }
            const rock = findRock('sandstone');
            return { rock, why: 'Sand-sized grains (0.063–2 mm), well-sorted. Classic quartz-rich sandstone.', neighbors: getNeighbors(rock) };
        }

        if (grainSize === 'silt') {
            const rock = findRock('siltstone');
            return { rock, why: 'Silt-sized particles (0.004–0.063 mm). Moderate-energy deposition forming siltstone.', neighbors: getNeighbors(rock) };
        }

        // Clay
        if (fissile) {
            const rock = findRock('shale');
            return { rock, why: 'Clay-sized particles with fissile layering. Parallel clay mineral alignment creates shale\'s characteristic splitting.', neighbors: getNeighbors(rock) };
        }

        const rock = findRock('mudstone');
        return { rock, why: 'Clay-sized particles, non-fissile. Blocky fracture distinguishes mudstone from shale.', neighbors: getNeighbors(rock) };
    }

    // ── Chemical ──
    if (sedType === 'chemical') {
        if (chemComposition === 'carbonate') {
            if (mgRich) {
                const rock = findRock('dolostone');
                return { rock, why: 'Carbonate composition with high Mg content. Diagenetic Mg-replacement of limestone forms dolostone.', neighbors: getNeighbors(rock) };
            }
            if (biogenic) {
                const rock = findRock('chalk');
                return { rock, why: 'Carbonate from biogenic sources (coccolithophores). Soft, white, fine-grained chalk.', neighbors: getNeighbors(rock) };
            }
            if (hotSpring) {
                const rock = findRock('travertine');
                return { rock, why: 'Carbonate precipitated from hot spring waters. Banded texture defines travertine.', neighbors: getNeighbors(rock) };
            }
            const rock = findRock('limestone');
            return { rock, why: 'Calcium carbonate (CaCO₃) precipitated from warm shallow seas. The most common carbonate rock.', neighbors: getNeighbors(rock) };
        }

        if (chemComposition === 'siliceous') {
            const rock = findRock('chert');
            return { rock, why: 'Siliceous chemical precipitate. Microcrystalline quartz/chalcedony with conchoidal fracture.', neighbors: getNeighbors(rock) };
        }

        // Evaporite
        if (mgRich) {
            const rock = findRock('gypsum-rock');
            return { rock, why: 'Evaporite deposit. Hydrated calcium sulfate precipitates as gypsum.', neighbors: getNeighbors(rock) };
        }
        const rock = findRock('rock-salt');
        return { rock, why: 'Evaporite deposit. NaCl crystallizes from evaporating saline water as rock salt (halite).', neighbors: getNeighbors(rock) };
    }

    // ── Organic ──
    if (organicType === 'plant') {
        const rock = findRock('coal');
        return { rock, why: 'Organic sedimentary from compressed plant matter. Progressive burial converts peat to coal.', neighbors: getNeighbors(rock) };
    }
    if (organicType === 'shell') {
        const rock = findRock('coquina');
        return { rock, why: 'Shell fragments accumulated and loosely cemented. Wave-concentrated biogenic carbonate forms coquina.', neighbors: getNeighbors(rock) };
    }
    const rock = findRock('diatomite');
    return { rock, why: 'Siliceous organic sediment from diatom frustules. Light, porous, high silica content.', neighbors: getNeighbors(rock) };
}


// ────────────────────────────────────────────────────────────────
// METAMORPHIC
// ────────────────────────────────────────────────────────────────

interface MetamorphicParams {
    protolith: Protolith;
    grade: number;
    pressure: Pressure;
    contact: boolean;
}

export function classifyMetamorphic(params: MetamorphicParams): ClassificationResult {
    const { protolith, grade, pressure, contact } = params;

    // ── Contact metamorphism overrides ──
    if (contact) {
        if (protolith === 'calcareous') {
            const rock = findRock('skarn');
            return { rock, why: 'Contact metamorphism of calcareous rock. Hot fluids from intrusion react with carbonate to form Ca-Mg-Fe silicate skarn.', neighbors: getNeighbors(rock) };
        }
        const rock = findRock('hornfels');
        return { rock, why: `Contact metamorphism of ${protolith} protolith. Baking adjacent to an intrusion produces hard, fine-grained hornfels with no foliation.`, neighbors: getNeighbors(rock) };
    }

    // ── Pelitic (shale/mudstone) ──
    if (protolith === 'pelitic') {
        if (grade < 20) {
            const rock = findRock('slate');
            return { rock, why: `Grade = ${grade} (very low). Clay minerals begin to align, producing perfect slaty cleavage.`, neighbors: getNeighbors(rock) };
        }
        if (grade < 40) {
            const rock = findRock('phyllite');
            return { rock, why: `Grade = ${grade} (low-medium). Fine micas grow larger, giving a silky sheen — phyllite.`, neighbors: getNeighbors(rock) };
        }
        if (grade < 65) {
            const rock = findRock('schist');
            return { rock, why: `Grade = ${grade} (medium). Visible mica flakes and strong foliation define schist. Garnets may appear.`, neighbors: getNeighbors(rock) };
        }
        if (grade < 85) {
            const rock = findRock('gneiss');
            return { rock, why: `Grade = ${grade} (high). Compositional banding of light (feldspar/quartz) and dark (biotite/hornblende) layers defines gneiss.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('migmatite');
        return { rock, why: `Grade = ${grade} (ultra-high). Partial melting begins — the rock is part metamorphic, part igneous. Migmatite.`, neighbors: getNeighbors(rock) };
    }

    // ── Mafic (basalt/gabbro) ──
    if (protolith === 'mafic') {
        if (pressure === 'high') {
            if (grade < 40) {
                const rock = findRock('blueschist');
                return { rock, why: `Mafic protolith at high pressure, grade = ${grade} (low). Cold, fast subduction produces blue amphibole — blueschist.`, neighbors: getNeighbors(rock) };
            }
            const rock = findRock('eclogite');
            return { rock, why: `Mafic protolith at high pressure, grade = ${grade} (high). Deep subduction produces red garnet + green omphacite — eclogite.`, neighbors: getNeighbors(rock) };
        }
        if (grade < 35) {
            const rock = findRock('greenschist');
            return { rock, why: `Mafic protolith, grade = ${grade} (low). Chlorite + epidote + actinolite give the characteristic green color — greenschist.`, neighbors: getNeighbors(rock) };
        }
        if (grade < 70) {
            const rock = findRock('amphibolite');
            return { rock, why: `Mafic protolith, grade = ${grade} (medium-high). Hornblende + plagioclase dominate — amphibolite.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('granulite');
        return { rock, why: `Mafic protolith, grade = ${grade} (very high). Anhydrous minerals and granular texture — granulite facies.`, neighbors: getNeighbors(rock) };
    }

    // ── Quartzose (sandstone) ──
    if (protolith === 'quartzose') {
        const rock = findRock('quartzite');
        return { rock, why: `Quartzose protolith at grade = ${grade}. Quartz grains recrystallize and interlock, forming extremely hard quartzite.`, neighbors: getNeighbors(rock) };
    }

    // ── Calcareous (limestone) ──
    if (protolith === 'calcareous') {
        const rock = findRock('marble');
        return { rock, why: `Calcareous protolith at grade = ${grade}. Calcite recrystallizes into interlocking crystals — marble.`, neighbors: getNeighbors(rock) };
    }

    // ── Ultramafic (peridotite) ──
    if (protolith === 'ultramafic') {
        if (grade < 50) {
            const rock = findRock('serpentinite');
            return { rock, why: `Ultramafic protolith, grade = ${grade} (low-medium). Hydration of olivine produces serpentine minerals — serpentinite.`, neighbors: getNeighbors(rock) };
        }
        const rock = findRock('soapstone');
        return { rock, why: `Ultramafic protolith, grade = ${grade} (higher). CO₂ metasomatism converts serpentine to talc — soapstone.`, neighbors: getNeighbors(rock) };
    }

    // ── Felsic (granite) ──
    if (grade < 65) {
        const rock = findRock('gneiss');
        return { rock, why: `Felsic protolith, grade = ${grade}. Regional metamorphism produces banded gneiss from granitic composition.`, neighbors: getNeighbors(rock) };
    }
    if (grade < 85) {
        const rock = findRock('gneiss');
        return { rock, why: `Felsic protolith, grade = ${grade} (high). Strong compositional banding in high-grade gneiss.`, neighbors: getNeighbors(rock) };
    }
    const rock = findRock('migmatite');
    return { rock, why: `Felsic protolith, grade = ${grade} (ultra-high). Partial melting of granite-composition rock forms migmatite.`, neighbors: getNeighbors(rock) };
}
