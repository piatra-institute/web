'use client';

import { useMemo } from 'react';

import {
    type Params,
    type Domain,
    type ClassificationResult,
    type Rock,
    ROCKS,
    DOMAIN_COLORS,
    DOMAIN_COLORS_DIM,
    DOMAIN_OPTIONS,
} from '../../logic';


interface ViewerProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    result: ClassificationResult | null;
}

export default function Viewer({ params, onParamsChange, result }: ViewerProps) {
    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {params.viewMode === 'classifier' && result && (
                <ClassifierView params={params} onParamsChange={onParamsChange} result={result} />
            )}
            {params.viewMode === 'atlas' && (
                <AtlasView params={params} onParamsChange={onParamsChange} />
            )}
            {params.viewMode === 'graph' && (
                <GraphView params={params} result={result} />
            )}
        </div>
    );
}


// ════════════════════════════════════════════════════════════════
// CLASSIFIER VIEW
// ════════════════════════════════════════════════════════════════

function ClassifierView({ params, onParamsChange, result }: { params: Params; onParamsChange: (p: Params) => void; result: ClassificationResult }) {
    return (
        <div className="flex flex-col items-center gap-8 py-8">
            {/* Result card */}
            <div className="w-full max-w-2xl border border-lime-500/20 bg-black/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <span
                        className="text-xs px-2 py-0.5 border font-medium"
                        style={{
                            borderColor: DOMAIN_COLORS[result.rock.domain],
                            color: DOMAIN_COLORS[result.rock.domain],
                        }}
                    >
                        {result.rock.domain}
                    </span>
                    <span className="text-lime-200/40 text-xs">{result.rock.subdomain}</span>
                </div>
                <h2 className="text-3xl text-lime-100 font-light tracking-wide mb-2">{result.rock.name}</h2>
                <p className="text-lime-200/60 text-sm leading-relaxed mb-3">{result.rock.description}</p>
                <div className="border-t border-lime-500/10 pt-3 mt-3">
                    <p className="text-lime-200/70 text-xs leading-relaxed">{result.why}</p>
                </div>
                {result.rock.minerals.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {result.rock.minerals.map((m) => (
                            <span key={m} className="text-[10px] px-1.5 py-0.5 border border-lime-500/10 text-lime-200/40">
                                {m}
                            </span>
                        ))}
                    </div>
                )}
                {result.neighbors.length > 0 && (
                    <div className="mt-3">
                        <span className="text-lime-200/30 text-[10px]">neighbors: </span>
                        {result.neighbors.map((n, i) => (
                            <span key={n.id}>
                                <button
                                    className="text-[10px] text-lime-400/60 hover:text-lime-400 cursor-pointer transition-colors"
                                    onClick={() => onParamsChange({ ...params, selectedRockId: n.id })}
                                >
                                    {n.name}
                                </button>
                                {i < result.neighbors.length - 1 && <span className="text-lime-200/20 text-[10px]"> · </span>}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Domain-specific diagram */}
            {params.domain === 'igneous' && params.sio2 < 45 && params.texture !== 'volcanic' && params.texture !== 'glassy' && !params.veryCoarse && (
                <TernaryDiagram ol={params.ol} opx={params.opx} cpx={params.cpx} resultId={result.rock.id} />
            )}
            {params.domain === 'igneous' && (params.sio2 >= 45 || params.texture === 'volcanic') && !params.vesicular && params.texture !== 'glassy' && !params.veryCoarse && (
                <SiO2BarDiagram sio2={params.sio2} texture={params.texture} highAlkali={params.highAlkali} resultId={result.rock.id} />
            )}
            {params.domain === 'sedimentary' && (
                <SedimentaryTree params={params} resultId={result.rock.id} />
            )}
            {params.domain === 'metamorphic' && (
                <PTDiagram grade={params.grade} pressure={params.pressure} protolith={params.protolith} contact={params.contact} resultId={result.rock.id} />
            )}
        </div>
    );
}


// ────────────────────────────────────────────────────────────────
// Ternary Diagram (Ol-Opx-Cpx)
// ────────────────────────────────────────────────────────────────

function TernaryDiagram({ ol, opx, cpx, resultId }: { ol: number; opx: number; cpx: number; resultId: string }) {
    const sum = ol + opx + cpx || 1;
    const nOl = (ol / sum) * 100;
    const nOpx = (opx / sum) * 100;
    const nCpx = (cpx / sum) * 100;

    // Triangle: Ol top(250,20), Opx bottom-left(50,370), Cpx bottom-right(450,370)
    const W = 500, H = 400;
    const apex = { x: 250, y: 30 };
    const left = { x: 50, y: 370 };
    const right = { x: 450, y: 370 };

    const toXY = (pOl: number, pOpx: number, pCpx: number) => {
        const s = pOl + pOpx + pCpx || 1;
        const a = pOl / s, b = pOpx / s, c = pCpx / s;
        return {
            x: apex.x * a + left.x * b + right.x * c,
            y: apex.y * a + left.y * b + right.y * c,
        };
    };

    const pos = toXY(nOl, nOpx, nCpx);

    // Field boundaries (simplified IUGS):
    // Ol=90 line (dunite above)
    // Ol=40 line (peridotite above, pyroxenite below)
    // Within peridotite: Opx:Cpx ratio boundaries
    const ol90L = toXY(90, 10, 0);
    const ol90R = toXY(90, 0, 10);
    const ol40L = toXY(40, 60, 0);
    const ol40R = toXY(40, 0, 60);

    // For pyroxenite region: Opx=90 and Cpx=90 lines... simplified as vertical divisions
    // Cpx ratio boundaries in peridotite: equal line
    const olMidL = toXY(70, 30, 0);
    const olMidR = toXY(70, 0, 30);
    const pyrMid = toXY(0, 50, 50);
    const olMidCenter = toXY(40, 30, 30);

    const fields = [
        { label: 'Dunite', pos: toXY(95, 2.5, 2.5), id: 'dunite' },
        { label: 'Harzburgite', pos: toXY(65, 30, 5), id: 'harzburgite' },
        { label: 'Lherzolite', pos: toXY(60, 20, 20), id: 'lherzolite' },
        { label: 'Wehrlite', pos: toXY(65, 5, 30), id: 'wehrlite' },
        { label: 'Orthopyroxenite', pos: toXY(10, 85, 5), id: 'orthopyroxenite' },
        { label: 'Websterite', pos: toXY(10, 45, 45), id: 'websterite' },
        { label: 'Clinopyroxenite', pos: toXY(10, 5, 85), id: 'clinopyroxenite' },
    ];

    return (
        <div className="w-full max-w-lg">
            <div className="text-lime-200/40 text-xs text-center mb-2">Ultramafic Ternary — Ol / Opx / Cpx</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {/* Triangle */}
                <polygon
                    points={`${apex.x},${apex.y} ${left.x},${left.y} ${right.x},${right.y}`}
                    fill="rgba(132, 204, 22, 0.03)"
                    stroke="rgba(132, 204, 22, 0.3)"
                    strokeWidth="1"
                />

                {/* Field boundaries */}
                <line x1={ol90L.x} y1={ol90L.y} x2={ol90R.x} y2={ol90R.y} stroke="rgba(132, 204, 22, 0.2)" strokeWidth="0.5" strokeDasharray="4,4" />
                <line x1={ol40L.x} y1={ol40L.y} x2={ol40R.x} y2={ol40R.y} stroke="rgba(132, 204, 22, 0.2)" strokeWidth="0.5" strokeDasharray="4,4" />
                {/* Center divider in peridotite and pyroxenite */}
                <line x1={olMidCenter.x} y1={olMidCenter.y} x2={pyrMid.x} y2={pyrMid.y} stroke="rgba(132, 204, 22, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />

                {/* Field labels */}
                {fields.map((f) => (
                    <text
                        key={f.id}
                        x={f.pos.x}
                        y={f.pos.y}
                        textAnchor="middle"
                        fontSize="10"
                        fill={f.id === resultId ? 'rgb(132, 204, 22)' : 'rgba(132, 204, 22, 0.35)'}
                        fontWeight={f.id === resultId ? 'bold' : 'normal'}
                    >
                        {f.label}
                    </text>
                ))}

                {/* Vertex labels */}
                <text x={apex.x} y={apex.y - 8} textAnchor="middle" fontSize="12" fill="rgba(132, 204, 22, 0.7)">Ol</text>
                <text x={left.x - 8} y={left.y + 14} textAnchor="middle" fontSize="12" fill="rgba(132, 204, 22, 0.7)">Opx</text>
                <text x={right.x + 8} y={right.y + 14} textAnchor="middle" fontSize="12" fill="rgba(132, 204, 22, 0.7)">Cpx</text>

                {/* Current position */}
                <circle cx={pos.x} cy={pos.y} r="6" fill="rgb(132, 204, 22)" />
                <circle cx={pos.x} cy={pos.y} r="10" fill="none" stroke="rgb(132, 204, 22)" strokeWidth="1" opacity="0.5" />
            </svg>
        </div>
    );
}


// ────────────────────────────────────────────────────────────────
// SiO2 Bar Diagram
// ────────────────────────────────────────────────────────────────

function SiO2BarDiagram({ sio2, texture, highAlkali, resultId }: { sio2: number; texture: string; highAlkali: boolean; resultId: string }) {
    const W = 700, H = 200;
    const barY = 30;
    const barH = 140;
    const minSiO2 = 45, maxSiO2 = 80;

    const toX = (v: number) => 40 + ((v - minSiO2) / (maxSiO2 - minSiO2)) * (W - 80);

    const zones = [
        { label: 'Mafic', start: 45, end: 52, color: 'rgba(239, 68, 68, 0.08)' },
        { label: 'Intermediate', start: 52, end: 63, color: 'rgba(234, 179, 8, 0.06)' },
        { label: 'Felsic', start: 63, end: 80, color: 'rgba(132, 204, 22, 0.06)' },
    ];

    const rocks = [
        // Plutonic row (top)
        { name: 'Gabbro', sio2: 48, y: barY + 30, id: 'gabbro', row: 'plutonic' },
        { name: 'Diorite', sio2: 57, y: barY + 30, id: 'diorite', row: 'plutonic' },
        { name: 'Syenite', sio2: 57, y: barY + 50, id: 'syenite', row: 'plutonic', alkali: true },
        { name: 'Tonalite', sio2: 64, y: barY + 30, id: 'tonalite', row: 'plutonic' },
        { name: 'Granodiorite', sio2: 68, y: barY + 30, id: 'granodiorite', row: 'plutonic' },
        { name: 'Granite', sio2: 73, y: barY + 30, id: 'granite', row: 'plutonic' },
        // Volcanic row (bottom)
        { name: 'Basalt', sio2: 48, y: barY + 90, id: 'basalt', row: 'volcanic' },
        { name: 'Andesite', sio2: 57, y: barY + 90, id: 'andesite', row: 'volcanic' },
        { name: 'Trachyte', sio2: 57, y: barY + 110, id: 'trachyte', row: 'volcanic', alkali: true },
        { name: 'Dacite', sio2: 66, y: barY + 90, id: 'dacite', row: 'volcanic' },
        { name: 'Rhyolite', sio2: 73, y: barY + 90, id: 'rhyolite', row: 'volcanic' },
    ];

    const curX = toX(Math.max(minSiO2, Math.min(maxSiO2, sio2)));

    return (
        <div className="w-full max-w-2xl">
            <div className="text-lime-200/40 text-xs text-center mb-2">SiO₂ Classification — Plutonic (top) / Volcanic (bottom)</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {/* Zones */}
                {zones.map((z) => (
                    <rect
                        key={z.label}
                        x={toX(z.start)} y={barY}
                        width={toX(z.end) - toX(z.start)} height={barH}
                        fill={z.color}
                        stroke="rgba(132, 204, 22, 0.15)"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Zone labels */}
                {zones.map((z) => (
                    <text
                        key={z.label + '-label'}
                        x={(toX(z.start) + toX(z.end)) / 2}
                        y={barY + barH + 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(132, 204, 22, 0.4)"
                    >
                        {z.label}
                    </text>
                ))}

                {/* Row labels */}
                <text x={30} y={barY + 35} textAnchor="end" fontSize="9" fill="rgba(132, 204, 22, 0.3)">Plutonic</text>
                <text x={30} y={barY + 95} textAnchor="end" fontSize="9" fill="rgba(132, 204, 22, 0.3)">Volcanic</text>

                {/* Divider */}
                <line x1={40} y1={barY + barH / 2} x2={W - 40} y2={barY + barH / 2} stroke="rgba(132, 204, 22, 0.1)" strokeWidth="0.5" />

                {/* Rock labels */}
                {rocks.map((r) => {
                    const isResult = r.id === resultId;
                    const isAlkali = r.alkali;
                    if (isAlkali && !highAlkali && !isResult) return null;
                    return (
                        <text
                            key={r.id}
                            x={toX(r.sio2)}
                            y={r.y}
                            textAnchor="middle"
                            fontSize={isResult ? '11' : '9'}
                            fill={isResult ? 'rgb(132, 204, 22)' : 'rgba(132, 204, 22, 0.35)'}
                            fontWeight={isResult ? 'bold' : 'normal'}
                        >
                            {r.name}{isAlkali ? ' *' : ''}
                        </text>
                    );
                })}

                {/* SiO2 axis ticks */}
                {[45, 50, 52, 55, 60, 63, 65, 70, 75, 80].map((v) => (
                    <g key={v}>
                        <line x1={toX(v)} y1={barY - 4} x2={toX(v)} y2={barY} stroke="rgba(132, 204, 22, 0.2)" strokeWidth="0.5" />
                        <text x={toX(v)} y={barY - 8} textAnchor="middle" fontSize="8" fill="rgba(132, 204, 22, 0.3)">{v}%</text>
                    </g>
                ))}

                {/* Current position marker */}
                <line x1={curX} y1={barY} x2={curX} y2={barY + barH} stroke="rgb(132, 204, 22)" strokeWidth="1.5" opacity="0.7" />
                <circle cx={curX} cy={barY + (texture === 'plutonic' || texture === 'hypabyssal' ? barH * 0.25 : barH * 0.75)} r="5" fill="rgb(132, 204, 22)" />
            </svg>
        </div>
    );
}


// ────────────────────────────────────────────────────────────────
// Sedimentary Tree
// ────────────────────────────────────────────────────────────────

function SedimentaryTree({ params, resultId }: { params: Params; resultId: string }) {
    const W = 700, H = 320;

    interface TreeNode {
        label: string;
        x: number;
        y: number;
        id?: string;
        active: boolean;
        children?: TreeNode[];
    }

    const isClastic = params.sedType === 'clastic';
    const isChemical = params.sedType === 'chemical';
    const isOrganic = params.sedType === 'organic';

    const tree: TreeNode = {
        label: 'Sedimentary', x: W / 2, y: 30, active: true,
        children: [
            {
                label: 'Clastic', x: 120, y: 100, active: isClastic,
                children: [
                    { label: 'Clay', x: 40, y: 170, active: isClastic && params.grainSize === 'clay',
                        children: [
                            { label: 'Shale', x: 20, y: 240, id: 'shale', active: isClastic && params.grainSize === 'clay' && params.fissile },
                            { label: 'Mudstone', x: 70, y: 240, id: 'mudstone', active: isClastic && params.grainSize === 'clay' && !params.fissile },
                        ]
                    },
                    { label: 'Silt', x: 110, y: 170, active: isClastic && params.grainSize === 'silt',
                        children: [
                            { label: 'Siltstone', x: 110, y: 240, id: 'siltstone', active: isClastic && params.grainSize === 'silt' },
                        ]
                    },
                    { label: 'Sand', x: 175, y: 170, active: isClastic && params.grainSize === 'sand',
                        children: [
                            { label: 'Sandstone', x: 145, y: 240, id: 'sandstone', active: isClastic && params.grainSize === 'sand' && !params.feldspathic && !params.poorlySorted },
                            { label: 'Arkose', x: 195, y: 240, id: 'arkose', active: isClastic && params.grainSize === 'sand' && params.feldspathic },
                            { label: 'Graywacke', x: 250, y: 240, id: 'graywacke', active: isClastic && params.grainSize === 'sand' && params.poorlySorted },
                        ]
                    },
                    { label: 'Gravel', x: 230, y: 170, active: isClastic && params.grainSize === 'gravel',
                        children: [
                            { label: 'Conglomerate', x: 280, y: 240, id: 'conglomerate', active: isClastic && params.grainSize === 'gravel' && params.rounded && !params.glacial },
                            { label: 'Breccia', x: 345, y: 240, id: 'breccia', active: isClastic && params.grainSize === 'gravel' && !params.rounded && !params.glacial },
                            { label: 'Tillite', x: 220, y: 280, id: 'tillite', active: isClastic && params.grainSize === 'gravel' && params.glacial },
                        ]
                    },
                ]
            },
            {
                label: 'Chemical', x: 430, y: 100, active: isChemical,
                children: [
                    { label: 'Carbonate', x: 380, y: 170, active: isChemical && params.chemComposition === 'carbonate',
                        children: [
                            { label: 'Limestone', x: 360, y: 240, id: 'limestone', active: isChemical && params.chemComposition === 'carbonate' && !params.mgRich && !params.biogenic && !params.hotSpring },
                            { label: 'Dolostone', x: 420, y: 240, id: 'dolostone', active: isChemical && params.chemComposition === 'carbonate' && params.mgRich },
                            { label: 'Chalk', x: 440, y: 280, id: 'chalk', active: isChemical && params.chemComposition === 'carbonate' && params.biogenic },
                            { label: 'Travertine', x: 360, y: 280, id: 'travertine', active: isChemical && params.chemComposition === 'carbonate' && params.hotSpring },
                        ]
                    },
                    { label: 'Siliceous', x: 490, y: 170, active: isChemical && params.chemComposition === 'siliceous',
                        children: [
                            { label: 'Chert', x: 490, y: 240, id: 'chert', active: isChemical && params.chemComposition === 'siliceous' },
                        ]
                    },
                    { label: 'Evaporite', x: 560, y: 170, active: isChemical && params.chemComposition === 'evaporite',
                        children: [
                            { label: 'Rock Salt', x: 540, y: 240, id: 'rock-salt', active: isChemical && params.chemComposition === 'evaporite' && !params.mgRich },
                            { label: 'Gypsum', x: 610, y: 240, id: 'gypsum-rock', active: isChemical && params.chemComposition === 'evaporite' && params.mgRich },
                        ]
                    },
                ]
            },
            {
                label: 'Organic', x: 630, y: 100, active: isOrganic,
                children: [
                    { label: 'Coal', x: 600, y: 170, id: 'coal', active: isOrganic && params.organicType === 'plant' },
                    { label: 'Coquina', x: 650, y: 170, id: 'coquina', active: isOrganic && params.organicType === 'shell' },
                    { label: 'Diatomite', x: 680, y: 220, id: 'diatomite', active: isOrganic && params.organicType === 'siliceous' },
                ]
            },
        ]
    };

    const lines: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];
    const nodes: { label: string; x: number; y: number; id?: string; active: boolean; isResult: boolean }[] = [];

    function walk(node: TreeNode) {
        const isResult = node.id === resultId;
        nodes.push({ label: node.label, x: node.x, y: node.y, id: node.id, active: node.active, isResult });
        if (node.children) {
            for (const child of node.children) {
                lines.push({ x1: node.x, y1: node.y + 8, x2: child.x, y2: child.y - 8, active: node.active && child.active });
                walk(child);
            }
        }
    }
    walk(tree);

    return (
        <div className="w-full max-w-2xl">
            <div className="text-lime-200/40 text-xs text-center mb-2">Sedimentary Classification Tree</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {lines.map((l, i) => (
                    <line
                        key={i}
                        x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                        stroke={l.active ? 'rgba(132, 204, 22, 0.5)' : 'rgba(132, 204, 22, 0.1)'}
                        strokeWidth={l.active ? 1.5 : 0.5}
                    />
                ))}
                {nodes.map((n, i) => (
                    <text
                        key={i}
                        x={n.x} y={n.y}
                        textAnchor="middle"
                        fontSize={n.isResult ? '11' : '9'}
                        fill={n.isResult ? 'rgb(132, 204, 22)' : n.active ? 'rgba(132, 204, 22, 0.7)' : 'rgba(132, 204, 22, 0.2)'}
                        fontWeight={n.isResult ? 'bold' : 'normal'}
                    >
                        {n.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}


// ────────────────────────────────────────────────────────────────
// P-T Diagram (Metamorphic)
// ────────────────────────────────────────────────────────────────

function PTDiagram({ grade, pressure, protolith, contact, resultId }: { grade: number; pressure: string; protolith: string; contact: boolean; resultId: string }) {
    const W = 600, H = 400;
    const padL = 60, padR = 30, padT = 30, padB = 50;
    const gW = W - padL - padR;
    const gH = H - padT - padB;

    // grade -> x, pressure -> y (inverted: high pressure at top)
    const toX = (g: number) => padL + (g / 100) * gW;
    const pressureVal = pressure === 'low' ? 20 : pressure === 'medium' ? 50 : 80;
    const toY = (p: number) => padT + gH - (p / 100) * gH;

    const facies = [
        { label: 'Zeolite', x1: 0, x2: 20, y1: 0, y2: 40, color: 'rgba(132,204,22,0.03)' },
        { label: 'Greenschist', x1: 15, x2: 45, y1: 10, y2: 50, color: 'rgba(132,204,22,0.05)' },
        { label: 'Amphibolite', x1: 40, x2: 75, y1: 15, y2: 55, color: 'rgba(132,204,22,0.06)' },
        { label: 'Granulite', x1: 70, x2: 100, y1: 10, y2: 45, color: 'rgba(132,204,22,0.07)' },
        { label: 'Blueschist', x1: 10, x2: 45, y1: 55, y2: 85, color: 'rgba(100,150,255,0.06)' },
        { label: 'Eclogite', x1: 40, x2: 100, y1: 60, y2: 100, color: 'rgba(239,68,68,0.05)' },
        { label: 'Contact\n(hornfels)', x1: 20, x2: 60, y1: 0, y2: 15, color: 'rgba(234,179,8,0.05)' },
    ];

    const curX = toX(grade);
    const curY = contact ? toY(5) : toY(pressureVal);

    return (
        <div className="w-full max-w-xl">
            <div className="text-lime-200/40 text-xs text-center mb-2">P–T Space — Metamorphic Facies</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {/* Facies regions */}
                {facies.map((f) => (
                    <g key={f.label}>
                        <rect
                            x={toX(f.x1)} y={toY(f.y2)}
                            width={toX(f.x2) - toX(f.x1)} height={toY(f.y1) - toY(f.y2)}
                            fill={f.color}
                            stroke="rgba(132,204,22,0.1)"
                            strokeWidth="0.5"
                        />
                        <text
                            x={(toX(f.x1) + toX(f.x2)) / 2}
                            y={(toY(f.y1) + toY(f.y2)) / 2}
                            textAnchor="middle"
                            fontSize="9"
                            fill="rgba(132,204,22,0.3)"
                        >
                            {f.label.split('\n').map((line, i) => (
                                <tspan key={i} x={(toX(f.x1) + toX(f.x2)) / 2} dy={i === 0 ? 0 : 12}>{line}</tspan>
                            ))}
                        </text>
                    </g>
                ))}

                {/* Axes */}
                <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(132,204,22,0.3)" strokeWidth="0.5" />
                <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(132,204,22,0.3)" strokeWidth="0.5" />
                <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="10" fill="rgba(132,204,22,0.5)">Grade (temperature →)</text>
                <text x={15} y={H / 2} textAnchor="middle" fontSize="10" fill="rgba(132,204,22,0.5)" transform={`rotate(-90,15,${H / 2})`}>Pressure →</text>

                {/* Protolith pathway */}
                {protolith === 'pelitic' && !contact && (
                    <g>
                        {[
                            { label: 'Slate', g: 10, p: 35 },
                            { label: 'Phyllite', g: 30, p: 37 },
                            { label: 'Schist', g: 52, p: 40 },
                            { label: 'Gneiss', g: 75, p: 42 },
                            { label: 'Migmatite', g: 92, p: 35 },
                        ].map((r, i, arr) => (
                            <g key={r.label}>
                                {i > 0 && (
                                    <line
                                        x1={toX(arr[i - 1].g)} y1={toY(arr[i - 1].p)}
                                        x2={toX(r.g)} y2={toY(r.p)}
                                        stroke="rgba(132,204,22,0.25)"
                                        strokeWidth="1"
                                        strokeDasharray="4,3"
                                    />
                                )}
                                <circle cx={toX(r.g)} cy={toY(r.p)} r="3" fill="rgba(132,204,22,0.4)" />
                                <text x={toX(r.g)} y={toY(r.p) - 8} textAnchor="middle" fontSize="8" fill="rgba(132,204,22,0.5)">{r.label}</text>
                            </g>
                        ))}
                    </g>
                )}
                {protolith === 'mafic' && !contact && (
                    <g>
                        {[
                            { label: 'Greenschist', g: 25, p: 30 },
                            { label: 'Amphibolite', g: 55, p: 35 },
                            { label: 'Granulite', g: 85, p: 30 },
                        ].map((r, i, arr) => (
                            <g key={r.label}>
                                {i > 0 && (
                                    <line
                                        x1={toX(arr[i - 1].g)} y1={toY(arr[i - 1].p)}
                                        x2={toX(r.g)} y2={toY(r.p)}
                                        stroke="rgba(132,204,22,0.25)" strokeWidth="1" strokeDasharray="4,3"
                                    />
                                )}
                                <circle cx={toX(r.g)} cy={toY(r.p)} r="3" fill="rgba(132,204,22,0.4)" />
                                <text x={toX(r.g)} y={toY(r.p) - 8} textAnchor="middle" fontSize="8" fill="rgba(132,204,22,0.5)">{r.label}</text>
                            </g>
                        ))}
                        {/* High-P branch */}
                        <line x1={toX(25)} y1={toY(30)} x2={toX(25)} y2={toY(70)} stroke="rgba(100,150,255,0.3)" strokeWidth="1" strokeDasharray="4,3" />
                        <text x={toX(25)} y={toY(72)} textAnchor="middle" fontSize="8" fill="rgba(100,150,255,0.5)">Blueschist</text>
                        <line x1={toX(25)} y1={toY(70)} x2={toX(65)} y2={toY(80)} stroke="rgba(239,68,68,0.3)" strokeWidth="1" strokeDasharray="4,3" />
                        <text x={toX(65)} y={toY(82)} textAnchor="middle" fontSize="8" fill="rgba(239,68,68,0.5)">Eclogite</text>
                    </g>
                )}

                {/* Current position */}
                <circle cx={curX} cy={curY} r="6" fill="rgb(132, 204, 22)" />
                <circle cx={curX} cy={curY} r="10" fill="none" stroke="rgb(132, 204, 22)" strokeWidth="1" opacity="0.5" />
            </svg>
        </div>
    );
}


// ════════════════════════════════════════════════════════════════
// ATLAS VIEW
// ════════════════════════════════════════════════════════════════

function AtlasView({ params, onParamsChange }: { params: Params; onParamsChange: (p: Params) => void }) {
    const filtered = useMemo(() => {
        if (params.atlasFilter === 'all') return ROCKS;
        return ROCKS.filter((r) => r.domain === params.atlasFilter);
    }, [params.atlasFilter]);

    return (
        <div className="py-8 px-4">
            <div className="text-lime-200/40 text-xs mb-4 text-center">{filtered.length} rocks</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {filtered.map((rock) => (
                    <button
                        key={rock.id}
                        onClick={() => onParamsChange({ ...params, selectedRockId: rock.id, viewMode: 'classifier', domain: rock.domain })}
                        className="text-left p-4 border border-lime-500/10 hover:border-lime-500/30 transition-colors bg-black/40 cursor-pointer"
                        style={{ borderLeftColor: DOMAIN_COLORS[rock.domain], borderLeftWidth: 3 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lime-100 text-sm font-medium">{rock.name}</span>
                            <span className="text-[10px] px-1 py-0.5 border text-lime-200/30" style={{ borderColor: DOMAIN_COLORS[rock.domain] + '40' }}>
                                {rock.subdomain}
                            </span>
                        </div>
                        <p className="text-lime-200/50 text-xs leading-relaxed">{rock.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {rock.minerals.slice(0, 3).map((m) => (
                                <span key={m} className="text-[9px] text-lime-200/30">{m}</span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}


// ════════════════════════════════════════════════════════════════
// GRAPH VIEW (Rock Cycle)
// ════════════════════════════════════════════════════════════════

interface GraphNode {
    id: string;
    label: string;
    x: number;
    y: number;
    domain: Domain;
}

interface GraphEdge {
    from: string;
    to: string;
    label: string;
    type: 'intra' | 'inter';
}

function GraphView({ params, result }: { params: Params; result: ClassificationResult | null }) {
    const W = 800, H = 600;

    const nodes: GraphNode[] = [
        // Igneous cluster (top center)
        { id: 'granite', label: 'Granite', x: 320, y: 80, domain: 'igneous' },
        { id: 'basalt', label: 'Basalt', x: 440, y: 60, domain: 'igneous' },
        { id: 'gabbro', label: 'Gabbro', x: 380, y: 130, domain: 'igneous' },
        { id: 'rhyolite', label: 'Rhyolite', x: 260, y: 50, domain: 'igneous' },
        { id: 'andesite', label: 'Andesite', x: 500, y: 110, domain: 'igneous' },
        { id: 'dunite', label: 'Dunite', x: 440, y: 170, domain: 'igneous' },
        { id: 'obsidian', label: 'Obsidian', x: 280, y: 140, domain: 'igneous' },
        // Sedimentary cluster (bottom left)
        { id: 'sandstone', label: 'Sandstone', x: 100, y: 380, domain: 'sedimentary' },
        { id: 'shale', label: 'Shale', x: 160, y: 430, domain: 'sedimentary' },
        { id: 'limestone', label: 'Limestone', x: 80, y: 460, domain: 'sedimentary' },
        { id: 'conglomerate', label: 'Conglomerate', x: 200, y: 350, domain: 'sedimentary' },
        { id: 'coal', label: 'Coal', x: 50, y: 520, domain: 'sedimentary' },
        { id: 'chert', label: 'Chert', x: 230, y: 490, domain: 'sedimentary' },
        // Metamorphic cluster (bottom right)
        { id: 'slate', label: 'Slate', x: 550, y: 350, domain: 'metamorphic' },
        { id: 'schist', label: 'Schist', x: 620, y: 400, domain: 'metamorphic' },
        { id: 'gneiss', label: 'Gneiss', x: 680, y: 350, domain: 'metamorphic' },
        { id: 'marble', label: 'Marble', x: 560, y: 460, domain: 'metamorphic' },
        { id: 'quartzite', label: 'Quartzite', x: 630, y: 490, domain: 'metamorphic' },
        { id: 'eclogite', label: 'Eclogite', x: 720, y: 440, domain: 'metamorphic' },
        { id: 'serpentinite', label: 'Serpentinite', x: 700, y: 510, domain: 'metamorphic' },
    ];

    const edges: GraphEdge[] = [
        // Inter-domain: Rock cycle
        { from: 'granite', to: 'sandstone', label: 'weathering', type: 'inter' },
        { from: 'basalt', to: 'sandstone', label: 'weathering', type: 'inter' },
        { from: 'shale', to: 'slate', label: 'metamorphism', type: 'inter' },
        { from: 'sandstone', to: 'quartzite', label: 'metamorphism', type: 'inter' },
        { from: 'limestone', to: 'marble', label: 'metamorphism', type: 'inter' },
        { from: 'gneiss', to: 'granite', label: 'melting', type: 'inter' },
        { from: 'gabbro', to: 'eclogite', label: 'subduction', type: 'inter' },
        { from: 'dunite', to: 'serpentinite', label: 'hydration', type: 'inter' },
        // Intra-domain
        { from: 'slate', to: 'schist', label: '+ grade', type: 'intra' },
        { from: 'schist', to: 'gneiss', label: '+ grade', type: 'intra' },
        { from: 'rhyolite', to: 'obsidian', label: 'quenching', type: 'intra' },
    ];

    const selectedId = result?.rock.id ?? null;

    const getNode = (id: string) => nodes.find((n) => n.id === id);

    return (
        <div className="py-8">
            <div className="text-lime-200/40 text-xs text-center mb-2">Rock Cycle — Igneous (top) · Sedimentary (left) · Metamorphic (right)</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl mx-auto">
                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="rgba(132,204,22,0.4)" />
                    </marker>
                </defs>

                {/* Domain cluster backgrounds */}
                <ellipse cx="380" cy="110" rx="180" ry="100" fill={DOMAIN_COLORS_DIM.igneous} stroke="none" />
                <ellipse cx="140" cy="430" rx="160" ry="110" fill={DOMAIN_COLORS_DIM.sedimentary} stroke="none" />
                <ellipse cx="640" cy="420" rx="140" ry="120" fill={DOMAIN_COLORS_DIM.metamorphic} stroke="none" />

                {/* Edges */}
                {edges.map((e, i) => {
                    const from = getNode(e.from);
                    const to = getNode(e.to);
                    if (!from || !to) return null;

                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const nx = dx / dist, ny = dy / dist;
                    const x1 = from.x + nx * 20, y1 = from.y + ny * 20;
                    const x2 = to.x - nx * 20, y2 = to.y - ny * 20;

                    const isHighlighted = selectedId === e.from || selectedId === e.to;

                    return (
                        <g key={i}>
                            <line
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={e.type === 'inter' ? 'rgba(132,204,22,0.25)' : 'rgba(132,204,22,0.15)'}
                                strokeWidth={isHighlighted ? 1.5 : 0.8}
                                markerEnd="url(#arrowhead)"
                                strokeDasharray={e.type === 'inter' ? undefined : '4,3'}
                            />
                            <text
                                x={(x1 + x2) / 2 + ny * 10}
                                y={(y1 + y2) / 2 - nx * 10}
                                textAnchor="middle"
                                fontSize="7"
                                fill="rgba(132,204,22,0.3)"
                            >
                                {e.label}
                            </text>
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((n) => {
                    const isSelected = n.id === selectedId;
                    return (
                        <g key={n.id}>
                            {isSelected && (
                                <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="rgb(132,204,22)" strokeWidth="1" opacity="0.4" />
                            )}
                            <circle
                                cx={n.x} cy={n.y} r="16"
                                fill={isSelected ? DOMAIN_COLORS[n.domain] + '40' : DOMAIN_COLORS[n.domain] + '15'}
                                stroke={DOMAIN_COLORS[n.domain]}
                                strokeWidth={isSelected ? 1.5 : 0.5}
                                opacity={isSelected ? 1 : 0.7}
                            />
                            <text
                                x={n.x} y={n.y + 3}
                                textAnchor="middle"
                                fontSize={isSelected ? '9' : '8'}
                                fill={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'}
                                fontWeight={isSelected ? 'bold' : 'normal'}
                            >
                                {n.label}
                            </text>
                        </g>
                    );
                })}

                {/* Legend */}
                <g transform="translate(20, 20)">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(132,204,22,0.4)" strokeWidth="1" markerEnd="url(#arrowhead)" />
                    <text x="25" y="4" fontSize="8" fill="rgba(132,204,22,0.4)">inter-domain process</text>
                    <line x1="0" y1="15" x2="20" y2="15" stroke="rgba(132,204,22,0.25)" strokeWidth="1" strokeDasharray="4,3" />
                    <text x="25" y="19" fontSize="8" fill="rgba(132,204,22,0.4)">intra-domain</text>
                </g>
            </svg>
        </div>
    );
}
