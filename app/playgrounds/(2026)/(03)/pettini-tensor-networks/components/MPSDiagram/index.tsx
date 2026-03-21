'use client';

import React, { useMemo } from 'react';

import { SiteDatum } from '../../logic';


interface MPSDiagramProps {
    distribution: SiteDatum[];
    compressibility: number;
}

const SITE_W = 10;
const SITE_H = 24;
const GAP = 0.5;
const Y_OFFSET = 20;
const LABEL_Y = Y_OFFSET + SITE_H + 14;
const N_SITES = 80;
const TARGET_SITE = 60;
const PROTEIN_START = 20;
const SVG_W = N_SITES * (SITE_W + GAP);
const SVG_H = LABEL_Y + 10;

export default function MPSDiagram({ distribution, compressibility }: MPSDiagramProps) {
    const maxProb = useMemo(
        () => Math.max(...distribution.map(d => d.withResonance), 1e-9),
        [distribution],
    );

    const bondWidth = 1 + 4 * (1 - compressibility);
    const bondChi = (1 / Math.max(compressibility, 0.08)).toFixed(1);

    return (
        <div>
            <div className="text-xs text-lime-200/60 mb-2 font-mono">
                MPS chain &middot; bond &chi; ~ {bondChi} &middot; {N_SITES} sites
            </div>
            <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                width="100%"
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
            >
                {distribution.map((d, i) => {
                    const opacity = Math.max(0.04, d.withResonance / maxProb);
                    const x = i * (SITE_W + GAP);
                    const isTarget = i === TARGET_SITE;
                    const isStart = i === PROTEIN_START;

                    return (
                        <React.Fragment key={i}>
                            <rect
                                x={x}
                                y={Y_OFFSET}
                                width={SITE_W}
                                height={SITE_H}
                                fill={`rgba(132, 204, 22, ${opacity})`}
                                stroke={
                                    isTarget
                                        ? '#84cc16'
                                        : isStart
                                            ? 'rgba(163, 230, 53, 0.4)'
                                            : 'rgba(132, 204, 22, 0.1)'
                                }
                                strokeWidth={isTarget ? 1.5 : isStart ? 1 : 0.3}
                            />
                            {i < N_SITES - 1 && (
                                <line
                                    x1={x + SITE_W}
                                    y1={Y_OFFSET + SITE_H / 2}
                                    x2={x + SITE_W + GAP}
                                    y2={Y_OFFSET + SITE_H / 2}
                                    stroke="rgba(163, 230, 53, 0.3)"
                                    strokeWidth={bondWidth}
                                />
                            )}
                        </React.Fragment>
                    );
                })}

                <text
                    x={PROTEIN_START * (SITE_W + GAP) + SITE_W / 2}
                    y={LABEL_Y}
                    textAnchor="middle"
                    fill="rgba(163, 230, 53, 0.5)"
                    fontSize={8}
                    fontFamily="monospace"
                >
                    start
                </text>
                <text
                    x={TARGET_SITE * (SITE_W + GAP) + SITE_W / 2}
                    y={LABEL_Y}
                    textAnchor="middle"
                    fill="#84cc16"
                    fontSize={8}
                    fontFamily="monospace"
                >
                    target
                </text>
            </svg>
        </div>
    );
}
