'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Context,
  Weights,
  PolicyType,
  computeAllPolicies,
  generateHeatmap,
  DEFAULT_CONTEXT,
  DEFAULT_WEIGHTS,
} from '../../logic';

interface ViewerProps {
  context: Context;
  weights: Weights;
  axisX: keyof Context;
  axisY: keyof Context;
}

const POLICY_COLORS: Record<PolicyType, string> = {
  walk: '#22c55e',    // lime-500
  skip: '#84cc16',    // lime-500 original
  run: '#facc15',     // yellow
  stroll: '#6b7280',  // gray
};

const POLICY_LABELS: Record<PolicyType, string> = {
  walk: 'Walk',
  skip: 'Skip',
  run: 'Run',
  stroll: 'Stroll',
};

function StickFigure({
  policy,
  phase,
  size = 40,
}: {
  policy: PolicyType;
  phase: number; // 0-1, cycles
  size?: number;
}) {
  const cyclePhase = (phase % 1) * Math.PI * 2;

  // Head
  const headY = size * 0.15;
  const headR = size * 0.08;

  // Body
  const bodyTopY = headY + headR;
  const bodyBottomY = size * 0.6;

  // Legs - vary based on policy
  let leftLegAngle = 0;
  let rightLegAngle = 0;
  let hipsY = bodyBottomY;

  if (policy === 'walk') {
    leftLegAngle = Math.sin(cyclePhase) * 0.3;
    rightLegAngle = Math.sin(cyclePhase + Math.PI) * 0.3;
  } else if (policy === 'skip') {
    // Skip: one foot stays down, other hops up - creates asymmetry
    const skipPhase = cyclePhase * 2;
    leftLegAngle = Math.sin(skipPhase) * 0.45;
    rightLegAngle = Math.sin(skipPhase + Math.PI * 0.5) * 0.25;
    hipsY = bodyBottomY - Math.sin(cyclePhase) * size * 0.15;
  } else if (policy === 'run') {
    // Run: fast symmetric motion with quick leg turnover
    const runPhase = cyclePhase * 3;
    leftLegAngle = Math.sin(runPhase) * 0.4;
    rightLegAngle = Math.sin(runPhase + Math.PI) * 0.4;
    hipsY = bodyBottomY - Math.sin(cyclePhase * 2) * size * 0.1;
  } else if (policy === 'stroll') {
    // Stroll is slow and relaxed
    leftLegAngle = Math.sin(cyclePhase * 0.7) * 0.15;
    rightLegAngle = Math.sin(cyclePhase * 0.7 + Math.PI) * 0.15;
  }

  const legLength = size * 0.35;
  const leftFootX = Math.sin(leftLegAngle) * legLength;
  const leftFootY = hipsY + Math.cos(leftLegAngle) * legLength;
  const rightFootX = Math.sin(rightLegAngle) * legLength;
  const rightFootY = hipsY + Math.cos(rightLegAngle) * legLength;

  return (
    <svg width={size} height={size * 1.2} viewBox={`0 0 ${size} ${size * 1.2}`} className="mx-auto">
      {/* Head */}
      <circle cx={size / 2} cy={headY} r={headR} fill="#84cc16" />

      {/* Body */}
      <line x1={size / 2} y1={bodyTopY} x2={size / 2} y2={hipsY} stroke="#84cc16" strokeWidth={2} />

      {/* Left leg */}
      <line
        x1={size / 2}
        y1={hipsY}
        x2={size / 2 + leftFootX}
        y2={leftFootY}
        stroke="#84cc16"
        strokeWidth={2}
      />

      {/* Right leg */}
      <line
        x1={size / 2}
        y1={hipsY}
        x2={size / 2 + rightFootX}
        y2={rightFootY}
        stroke="#84cc16"
        strokeWidth={2}
      />

      {/* Arms - simple oscillation */}
      {policy !== 'stroll' && (
        <>
          <line
            x1={size / 2}
            y1={bodyTopY + size * 0.15}
            x2={size / 2 - Math.sin(cyclePhase) * size * 0.15}
            y2={bodyTopY + size * 0.25 + Math.cos(cyclePhase) * size * 0.15}
            stroke="#84cc16"
            strokeWidth={1.5}
            opacity={0.7}
          />
          <line
            x1={size / 2}
            y1={bodyTopY + size * 0.15}
            x2={size / 2 + Math.sin(cyclePhase) * size * 0.15}
            y2={bodyTopY + size * 0.25 - Math.cos(cyclePhase) * size * 0.15}
            stroke="#84cc16"
            strokeWidth={1.5}
            opacity={0.7}
          />
        </>
      )}
    </svg>
  );
}

function Heatmap({
  data,
  xAxis,
  yAxis,
  policy,
}: {
  data: Array<any>;
  xAxis: string;
  yAxis: string;
  policy: PolicyType;
}) {
  if (!data || data.length === 0) return null;

  const resolution = Math.sqrt(data.length);
  const cellSize = 100 / resolution;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-64 border border-lime-500/30">
      <defs>
        <linearGradient id="heatgrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" stopOpacity="1" />
          <stop offset="50%" stopColor="#84cc16" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e1e1e" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Grid of cells */}
      {data.map((point: any, idx: number) => {
        const G = point[`${policy}G`];
        const minG = Math.min(...data.map((p: any) => p[`${policy}G`]));
        const maxG = Math.max(...data.map((p: any) => p[`${policy}G`]));
        const normalized = (G - minG) / (maxG - minG + 0.001);

        // Get color - lime for low G (good), red for high G (bad)
        const hue = 90 - normalized * 120; // 90 (green) to -30 (red)
        const color = `hsl(${hue}, 100%, 45%)`;
        const opacity = 0.3 + normalized * 0.7;

        return (
          <rect
            key={idx}
            x={(point.x * 100) - cellSize / 2}
            y={(100 - point.y * 100) - cellSize / 2}
            width={cellSize}
            height={cellSize}
            fill={color}
            opacity={opacity}
            stroke="none"
          />
        );
      })}

      {/* Axes labels */}
      <text x="50" y="98" textAnchor="middle" fontSize="6" fill="#84cc16">
        {xAxis}
      </text>
      <text x="2" y="50" textAnchor="middle" fontSize="6" fill="#84cc16" transform="rotate(-90 2 50)">
        {yAxis}
      </text>
    </svg>
  );
}

export default function Viewer({ context, weights, axisX, axisY }: ViewerProps) {
  const [animPhase, setAnimPhase] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPhase((p) => (p + 0.05) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Compute all policies
  const allPolicies = useMemo(() => computeAllPolicies(context, weights), [context, weights]);

  const policies: PolicyType[] = ['walk', 'skip', 'run', 'stroll'];
  const policyScores = useMemo(() => {
    return policies.map((p) => ({
      policy: p,
      G: allPolicies[p].G,
      rank: allPolicies[p].rank,
    }));
  }, [allPolicies]);

  const winner = policyScores.reduce((a, b) => (a.G < b.G ? a : b));

  // Component breakdown for winner
  const winnerComponents = useMemo(() => {
    const comps = allPolicies[winner.policy].components;
    return [
      { name: 'Risk', value: comps.risk },
      { name: 'Ambiguity', value: comps.ambiguity },
      { name: 'Info Gain', value: comps.infoGain },
      { name: 'Energy', value: comps.energyCost },
      { name: 'Social', value: comps.socialPenalty },
      { name: 'Injury', value: comps.injuryProb },
      { name: 'Arousal', value: comps.arousalMismatch },
    ].sort((a, b) => b.value - a.value);
  }, [winner, allPolicies]);

  // Crossover plot - sweep along axisX
  const crossoverData = useMemo(() => {
    const N = 50;
    const rows = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const ctx2 = { ...context, [axisX]: x };
      const policies2 = computeAllPolicies(ctx2, weights);
      rows.push({
        x,
        walk: policies2.walk.G,
        skip: policies2.skip.G,
        run: policies2.run.G,
        stroll: policies2.stroll.G,
      });
    }
    return rows;
  }, [context, weights, axisX]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    return generateHeatmap(axisX, axisY, context, weights, 15);
  }, [context, weights, axisX, axisY]);

  // EFE contribution parts for winner
  const parts = useMemo(() => {
    const p = allPolicies[winner.policy].parts;
    return Object.entries(p)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [winner, allPolicies]);

  const maxPart = Math.max(...parts.map((p) => Math.abs(p.value)));

  return (
    <div className="w-full text-lime-100 space-y-6 overflow-y-auto outline-none [&_*]:outline-none" style={{ minHeight: '90vh' }}>
      {/* Header - Current Policy Winner */}
      <div className="grid grid-cols-4 gap-4">
        {policyScores.map((ps) => (
          <div
            key={ps.policy}
            className={`p-4 border ${
              ps.policy === winner.policy
                ? 'border-lime-500 bg-lime-500/10'
                : 'border-lime-500/20 bg-black/30'
            }`}
          >
            <div className="flex flex-col items-center">
              <StickFigure policy={ps.policy} phase={animPhase} size={50} />
              <div className="text-sm font-semibold mt-2">{POLICY_LABELS[ps.policy]}</div>
              <div className="text-xs text-lime-200/70">G = {ps.G.toFixed(2)}</div>
              <div className="text-xs text-lime-200/60 mt-1">Rank #{ps.rank}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Ranking */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">Policy Ranking</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={policyScores} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#84cc16" />
              <XAxis
                dataKey="policy"
                tick={{ fill: '#84cc16', fontSize: 12 }}
                axisLine={{ stroke: '#84cc16' }}
              />
              <YAxis tick={{ fill: '#84cc16', fontSize: 12 }} axisLine={{ stroke: '#84cc16' }} tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip
                contentStyle={{
                  background: '#0a0a0a',
                  border: '1px solid #84cc16',
                  borderRadius: 0,
                }}
                labelStyle={{ color: '#84cc16' }}
                formatter={(value) => (Number(value) as any).toFixed(2)}
              />
              <Bar dataKey="G" fill="#84cc16" radius={[0, 0, 0, 0]}>
                {policyScores.map((ps, idx) => (
                  <Cell
                    key={idx}
                    fill={ps.policy === winner.policy ? '#84cc16' : '#84cc1633'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EFE Crossover Plot */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          EFE Crossover (sweeping {axisX})
        </h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={crossoverData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#84cc16" />
              <XAxis
                dataKey="x"
                tickFormatter={(v) => (v * 100).toFixed(0) + '%'}
                tick={{ fill: '#84cc16', fontSize: 12 }}
                axisLine={{ stroke: '#84cc16' }}
              />
              <YAxis tick={{ fill: '#84cc16', fontSize: 12 }} axisLine={{ stroke: '#84cc16' }} tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip
                contentStyle={{
                  background: '#0a0a0a',
                  border: '1px solid #84cc16',
                  borderRadius: 0,
                }}
                labelStyle={{ color: '#84cc16' }}
                formatter={(value) => (Number(value) as any).toFixed(2)}
              />
              <Line type="monotone" dataKey="walk" stroke={POLICY_COLORS.walk} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="skip" stroke={POLICY_COLORS.skip} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="run" stroke={POLICY_COLORS.run} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="stroll" stroke={POLICY_COLORS.stroll} dot={false} strokeWidth={2} />
              <ReferenceLine
                x={context[axisX]}
                stroke="#84cc16"
                strokeDasharray="4 4"
                label={{
                  value: 'Current',
                  position: 'top',
                  fill: '#84cc16',
                  fontSize: 10,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          Policy Landscape ({axisX} vs {axisY}) - {winner.policy.toUpperCase()} wins
        </h3>
        <Heatmap data={heatmapData} xAxis={axisX} yAxis={axisY} policy={winner.policy} />
      </div>

      {/* Component Breakdown */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          {POLICY_LABELS[winner.policy]} - Component Breakdown
        </h3>
        <div className="space-y-2">
          {winnerComponents.map((comp) => {
            const normalized = comp.value;
            return (
              <div key={comp.name} className="flex items-center gap-2">
                <div className="w-20 text-xs text-lime-200/70">{comp.name}</div>
                <div className="flex-1 h-6 bg-black/50 border border-lime-500/20 relative overflow-hidden">
                  <div
                    className="h-full bg-lime-500/50 border-r border-lime-500"
                    style={{ width: `${Math.min(100, normalized * 100)}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-lime-200/70 text-right">
                  {normalized.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EFE Term Contributions */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          EFE Term Contributions to G({winner.policy})
        </h3>
        <div className="space-y-2 text-xs">
          {parts.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-lime-200/70">
              <span>{p.name}</span>
              <span className="tabular-nums font-mono">
                {p.value > 0 ? '+' : ''}{p.value.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-lime-500/20 pt-2 mt-2 flex items-center justify-between font-semibold text-lime-100">
            <span>Total G</span>
            <span className="tabular-nums font-mono">{winner.G.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="bg-black/30 border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
        <p>
          <span className="text-lime-100 font-semibold">Lower G wins:</span> The expected free energy (EFE) combines preference satisfaction, uncertainty reduction, and efficiency.
        </p>
        <p>
          <span className="text-lime-100 font-semibold">Policy choices</span> flip as context and preferences change—adjust sliders to see the crossover!
        </p>
      </div>
    </div>
  );
}
