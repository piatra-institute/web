'use client';

import React from 'react';
import Equation from '@/components/Equation';
import type {
    ClassicalParams,
    ClassicalState,
    Direction,
    TQFTParams,
    TQFTResult,
} from '../../logic';
import { computeAcceleration, complexMagnitude, fmt } from '../../logic';

interface ViewerProps {
    classical: ClassicalParams;
    tqft: TQFTParams;
    isPlaying: boolean;
    classicalState: ClassicalState;
    tqftResult: TQFTResult;
    direction: Direction;
}

function ClassicalPanel({
    classical,
    classicalState,
    isPlaying,
    direction,
}: {
    classical: ClassicalParams;
    classicalState: ClassicalState;
    isPlaying: boolean;
    direction: Direction;
}) {
    const rad = (classical.angle * Math.PI) / 180;
    const tanAngle = Math.tan(rad);
    const topY = Math.max(45, 180 - 300 * tanAngle);

    // Visual angle of the incline (accounts for topY clamping)
    const visualAngleDeg = Math.atan2(180 - topY, 350 - 50) * (180 / Math.PI);

    const frac = classicalState.position / 100;

    let blockX: number;
    let blockY: number;
    if (direction === 'downhill') {
        // Block starts at top-right, slides to bottom-left
        blockX = 350 - frac * (350 - 50);
        blockY = topY + frac * (180 - topY);
    } else {
        // Block starts at bottom-left, moves to top-right
        blockX = 50 + frac * (350 - 50);
        blockY = 180 - frac * (180 - topY);
    }

    const accel = computeAcceleration(classical, classicalState);

    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <h3 className="text-lime-400 font-semibold text-sm mb-1">
                Classical Inclined Plane
            </h3>
            <p className="text-lime-200/60 text-xs mb-3">forces &amp; snapshots</p>

            <div className="relative">
                <svg
                    viewBox="0 0 400 200"
                    className="w-full"
                    style={{ background: '#0a0a0a' }}
                >
                    <defs>
                        <marker
                            id="arrowGreen"
                            viewBox="0 0 10 10"
                            refX="9"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#84cc16" />
                        </marker>
                        <marker
                            id="arrowRed"
                            viewBox="0 0 10 10"
                            refX="9"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                        </marker>
                    </defs>

                    {/* Ground line */}
                    <line
                        x1="50"
                        y1="180"
                        x2="350"
                        y2="180"
                        stroke="#333"
                        strokeWidth="1"
                    />

                    {/* Inclined plane */}
                    <line
                        x1="50"
                        y1="180"
                        x2="350"
                        y2={topY}
                        stroke="#84cc16"
                        strokeWidth="2"
                        opacity="0.4"
                    />

                    {/* Block */}
                    <g
                        transform={`translate(${blockX}, ${blockY}) rotate(${-visualAngleDeg})`}
                    >
                        <rect
                            x="-15"
                            y="-30"
                            width="30"
                            height="30"
                            fill="#84cc16"
                        />

                        {/* Force vectors (only when playing) */}
                        {isPlaying && (
                            <>
                                {/* Net force along plane */}
                                {accel !== 0 && (
                                    <line
                                        x1="0"
                                        y1="-15"
                                        x2={-40}
                                        y2="-15"
                                        stroke="#84cc16"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowGreen)"
                                    />
                                )}
                                {/* Gravity down */}
                                <line
                                    x1="0"
                                    y1="-15"
                                    x2="0"
                                    y2="25"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowRed)"
                                />
                            </>
                        )}
                    </g>
                </svg>

                {/* Overlay readout */}
                <div className="absolute top-2 right-2 bg-black/70 border border-lime-500/20 px-2 py-1 text-xs font-mono text-lime-200/70">
                    pos: {classicalState.position.toFixed(1)} m
                    <br />
                    vel: {classicalState.velocity.toFixed(1)} m/s
                </div>
            </div>

            {/* Governing equation */}
            <div className="mt-3 border border-lime-500/20 bg-black/30 p-3">
                <div className="text-center mb-2">
                    <Equation math="a = g \sin\theta - \mu\, g \cos\theta" />
                </div>
                <p className="text-xs text-lime-200/60 text-center">
                    a = {fmt(accel, 2)} m/s&sup2;
                </p>
                <p className="text-xs text-lime-200/40 mt-1 text-center">
                    Euler integration of the differential equation yields the trajectory.
                </p>
            </div>
        </div>
    );
}

function TQFTPanel({
    tqft,
    tqftResult,
}: {
    tqft: TQFTParams;
    tqftResult: TQFTResult;
}) {
    const { braids } = tqft;
    const { s3Amplitude, spinJ, braidPhase, amplitude, qParameter } = tqftResult;
    const mag = complexMagnitude(amplitude);

    // Build braid SVG paths
    const strandPaths = buildBraidPaths(braids);

    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <h3 className="text-lime-400 font-semibold text-sm mb-1">
                Fully Local TQFT
            </h3>
            <p className="text-lime-200/60 text-xs mb-3">shapes &amp; categories</p>

            <div className="relative">
                <svg
                    viewBox="0 0 400 200"
                    className="w-full"
                    style={{ background: '#0a0a0a' }}
                >
                    {strandPaths}
                </svg>

                {/* Overlay: Quantum Amplitude */}
                <div className="absolute top-2 right-2 bg-black/70 border border-lime-500/20 px-2 py-1 text-xs font-mono text-lime-200/70">
                    Z = {amplitude.re.toFixed(3)} {amplitude.im >= 0 ? '+' : ''}{' '}
                    {amplitude.im.toFixed(3)}i
                </div>
            </div>

            {/* TQFT values */}
            <div className="mt-3 border border-lime-500/20 bg-black/30 p-3 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-lime-200/60">spin j</span>
                    <span className="text-lime-400 font-mono">{fmt(spinJ, 2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-lime-200/60">Z(S&sup3;)</span>
                    <span className="text-lime-400 font-mono">{fmt(s3Amplitude)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-lime-200/60">braid phase</span>
                    <span className="text-lime-400 font-mono">{fmt(braidPhase, 3)} rad</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-lime-200/60">|amplitude|</span>
                    <span className="text-lime-400 font-mono">{fmt(mag)}</span>
                </div>
                <div className="text-xs text-lime-200/40 pt-1 border-t border-lime-500/10">
                    <span className="text-lime-200/60">target category: </span>
                    <Equation
                        math={`\\text{Rep}(U_q(\\mathfrak{sl}_2)),\\; q = e^{2\\pi i / ${tqft.level + 2}}`}
                    />
                </div>
            </div>
        </div>
    );
}

function buildBraidPaths(braids: number): React.ReactNode {
    const margin = 40;
    const topY = 20;
    const botY = 180;
    const leftX = 160;
    const rightX = 240;

    if (braids === 0) {
        return (
            <>
                <line
                    x1={leftX}
                    y1={topY}
                    x2={leftX}
                    y2={botY}
                    stroke="#84cc16"
                    strokeWidth="3"
                />
                <line
                    x1={rightX}
                    y1={topY}
                    x2={rightX}
                    y2={botY}
                    stroke="#eab308"
                    strokeWidth="3"
                />
            </>
        );
    }

    const segH = (botY - topY) / braids;
    const limeSegments: string[] = [];
    const yellowSegments: string[] = [];

    // Track which strand is on the left at each crossing
    let limeOnLeft = true;

    for (let i = 0; i < braids; i++) {
        const y0 = topY + i * segH;
        const y1 = y0 + segH;
        const midY = (y0 + y1) / 2;

        if (limeOnLeft) {
            // Lime goes left->right (over)
            limeSegments.push(
                `M ${leftX} ${y0} C ${leftX} ${midY}, ${rightX} ${midY}, ${rightX} ${y1}`,
            );
            // Yellow goes right->left (under, drawn first so lime is on top)
            yellowSegments.push(
                `M ${rightX} ${y0} C ${rightX} ${midY}, ${leftX} ${midY}, ${leftX} ${y1}`,
            );
        } else {
            // Lime goes right->left (over)
            limeSegments.push(
                `M ${rightX} ${y0} C ${rightX} ${midY}, ${leftX} ${midY}, ${leftX} ${y1}`,
            );
            // Yellow goes left->right (under)
            yellowSegments.push(
                `M ${leftX} ${y0} C ${leftX} ${midY}, ${rightX} ${midY}, ${rightX} ${y1}`,
            );
        }

        limeOnLeft = !limeOnLeft;
    }

    // Draw crossing markers
    const crossingMarkers = [];
    for (let i = 0; i < braids; i++) {
        const y0 = topY + i * segH;
        const midY = y0 + segH / 2;
        const midX = (leftX + rightX) / 2;
        crossingMarkers.push(
            <circle
                key={`cross-${i}`}
                cx={midX}
                cy={midY}
                r="4"
                fill="none"
                stroke="#84cc16"
                strokeWidth="1"
                opacity="0.4"
            />,
        );
    }

    return (
        <>
            {/* Under strand (yellow) drawn first */}
            {yellowSegments.map((d, i) => (
                <path
                    key={`y-${i}`}
                    d={d}
                    stroke="#eab308"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                />
            ))}
            {/* Over strand (lime) drawn on top */}
            {limeSegments.map((d, i) => (
                <path
                    key={`l-${i}`}
                    d={d}
                    stroke="#84cc16"
                    strokeWidth="3"
                    fill="none"
                />
            ))}
            {crossingMarkers}
        </>
    );
}

function ComparisonCard({
    title,
    classicalText,
    tqftText,
}: {
    title: string;
    classicalText: string;
    tqftText: string;
}) {
    return (
        <div className="bg-black/30 border border-lime-500/20 p-4">
            <h4 className="text-lime-400 font-semibold text-sm mb-3">{title}</h4>
            <div className="space-y-2 text-xs">
                <p>
                    <span className="text-lime-200/60">Classical: </span>
                    <span className="text-gray-300">{classicalText}</span>
                </p>
                <p>
                    <span className="text-lime-200/60">TQFT: </span>
                    <span className="text-gray-300">{tqftText}</span>
                </p>
            </div>
        </div>
    );
}

export default function Viewer({
    classical,
    tqft,
    isPlaying,
    classicalState,
    tqftResult,
    direction,
}: ViewerProps) {
    return (
        <div className="w-full space-y-6">
            {/* Dual Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ClassicalPanel
                    classical={classical}
                    classicalState={classicalState}
                    isPlaying={isPlaying}
                    direction={direction}
                />
                <TQFTPanel tqft={tqft} tqftResult={tqftResult} />
            </div>

            {/* Comparison / Rosetta Stone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComparisonCard
                    title="The Path"
                    classicalText="A specific trajectory x(t) that minimizes action."
                    tqftText="A worldline shape. Only the topology (braids) matters."
                />
                <ComparisonCard
                    title="Locality"
                    classicalText="Differential — look at t+dt."
                    tqftText="Fully local — cut spacetime into points, total = product of values."
                />
                <ComparisonCard
                    title="The Answer"
                    classicalText="A number with units (meters, m/s)."
                    tqftText="A dimensionless complex number (amplitude)."
                />
            </div>
        </div>
    );
}
