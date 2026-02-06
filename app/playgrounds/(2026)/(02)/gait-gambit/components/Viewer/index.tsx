'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Context,
  Weights,
  PolicyType,
  POLICY_COLORS,
  POLICY_LABELS,
  POLICY_SPECS,
  CONTEXT_KEYS,
  computeAllPolicies,
  generateHeatmap,
  findAllCrossoverPoints,
  computeRadarProfile,
  computeWaterfallData,
  computeSensitivity,
  HeatmapPoint,
} from '../../logic';

interface ViewerProps {
  context: Context;
  weights: Weights;
  axisX: keyof Context;
  axisY: keyof Context;
  crossoverAxis: keyof Context;
  showAllPolicies: boolean;
}

const POLICIES: PolicyType[] = ['walk', 'skip', 'run', 'stroll'];

// ── Stick Figure ──────────────────────────────────────────────────

function StickFigure({
  policy,
  phase,
  size = 40,
  color,
}: {
  policy: PolicyType;
  phase: number;
  size?: number;
  color: string;
}) {
  const cyclePhase = (phase % 1) * Math.PI * 2;

  const headY = size * 0.15;
  const headR = size * 0.08;
  const bodyTopY = headY + headR;
  const bodyBottomY = size * 0.6;

  let leftLegAngle = 0;
  let rightLegAngle = 0;
  let hipsY = bodyBottomY;

  if (policy === 'walk') {
    leftLegAngle = Math.sin(cyclePhase) * 0.3;
    rightLegAngle = Math.sin(cyclePhase + Math.PI) * 0.3;
  } else if (policy === 'skip') {
    const skipPhase = cyclePhase * 2;
    leftLegAngle = Math.sin(skipPhase) * 0.45;
    rightLegAngle = Math.sin(skipPhase + Math.PI * 0.5) * 0.25;
    hipsY = bodyBottomY - Math.sin(cyclePhase) * size * 0.15;
  } else if (policy === 'run') {
    const runPhase = cyclePhase * 3;
    leftLegAngle = Math.sin(runPhase) * 0.4;
    rightLegAngle = Math.sin(runPhase + Math.PI) * 0.4;
    hipsY = bodyBottomY - Math.sin(cyclePhase * 2) * size * 0.1;
  } else if (policy === 'stroll') {
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
      <circle cx={size / 2} cy={headY} r={headR} fill={color} />
      <line x1={size / 2} y1={bodyTopY} x2={size / 2} y2={hipsY} stroke={color} strokeWidth={2} />
      <line x1={size / 2} y1={hipsY} x2={size / 2 + leftFootX} y2={leftFootY} stroke={color} strokeWidth={2} />
      <line x1={size / 2} y1={hipsY} x2={size / 2 + rightFootX} y2={rightFootY} stroke={color} strokeWidth={2} />
      {policy !== 'stroll' && (
        <>
          <line
            x1={size / 2} y1={bodyTopY + size * 0.15}
            x2={size / 2 - Math.sin(cyclePhase) * size * 0.15}
            y2={bodyTopY + size * 0.25 + Math.cos(cyclePhase) * size * 0.15}
            stroke={color} strokeWidth={1.5} opacity={0.7}
          />
          <line
            x1={size / 2} y1={bodyTopY + size * 0.15}
            x2={size / 2 + Math.sin(cyclePhase) * size * 0.15}
            y2={bodyTopY + size * 0.25 - Math.cos(cyclePhase) * size * 0.15}
            stroke={color} strokeWidth={1.5} opacity={0.7}
          />
        </>
      )}
    </svg>
  );
}

// ── Canvas Heatmap ────────────────────────────────────────────────

function CanvasHeatmap({
  data,
  xAxis,
  yAxis,
  currentX,
  currentY,
  resolution,
}: {
  data: HeatmapPoint[];
  xAxis: string;
  yAxis: string;
  currentX: number;
  currentY: number;
  resolution: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ px: number; py: number; point: HeatmapPoint } | null>(null);
  const [canvasSize, setCanvasSize] = useState(400);

  // Max margin for normalization
  const maxMargin = useMemo(() => {
    if (data.length === 0) return 0.1;
    return Math.max(...data.map((p) => p.margin), 0.01);
  }, [data]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setCanvasSize(Math.min(w, 500));
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const pad = 40;
    const plotSize = canvasSize - pad * 2;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw cells
    const cellW = plotSize / resolution;
    const cellH = plotSize / resolution;

    for (const point of data) {
      const px = pad + point.x * plotSize;
      const py = pad + (1 - point.y) * plotSize;

      const baseColor = POLICY_COLORS[point.winner];
      const opacity = 0.3 + 0.7 * Math.min(point.margin / maxMargin, 1);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = baseColor;
      ctx.fillRect(px - cellW / 2, py - cellH / 2, cellW, cellH);
    }

    ctx.globalAlpha = 1;

    // Axis lines
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + plotSize);
    ctx.lineTo(pad + plotSize, pad + plotSize);
    ctx.stroke();

    // Tick marks
    ctx.fillStyle = '#84cc16';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const v = i / 4;
      const label = v.toFixed(1);
      // X axis
      const tx = pad + v * plotSize;
      ctx.fillText(label, tx, pad + plotSize + 14);
      // Y axis
      const ty = pad + (1 - v) * plotSize;
      ctx.textAlign = 'right';
      ctx.fillText(label, pad - 6, ty + 3);
      ctx.textAlign = 'center';
    }

    // Axis labels
    ctx.fillStyle = '#84cc16';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xAxis, pad + plotSize / 2, pad + plotSize + 30);
    ctx.save();
    ctx.translate(12, pad + plotSize / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxis, 0, 0);
    ctx.restore();

    // Crosshair at current values
    const cx = pad + currentX * plotSize;
    const cy = pad + (1 - currentY) * plotSize;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, pad);
    ctx.lineTo(cx, pad + plotSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, cy);
    ctx.lineTo(pad + plotSize, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [data, canvasSize, resolution, maxMargin, currentX, currentY, xAxis, yAxis]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || data.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const pad = 40;
      const plotSize = canvasSize - pad * 2;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const xNorm = (mx - pad) / plotSize;
      const yNorm = 1 - (my - pad) / plotSize;
      if (xNorm < 0 || xNorm > 1 || yNorm < 0 || yNorm > 1) {
        setHover(null);
        return;
      }
      // Find nearest point
      let best = data[0];
      let bestDist = Infinity;
      for (const p of data) {
        const d = (p.x - xNorm) ** 2 + (p.y - yNorm) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      setHover({ px: mx, py: my, point: best });
    },
    [data, canvasSize],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
        className="cursor-crosshair"
      />
      {hover && (
        <div
          className="absolute pointer-events-none bg-black/90 border border-lime-500/50 px-3 py-2 text-xs z-10"
          style={{ left: hover.px + 12, top: hover.py - 60 }}
        >
          <div className="text-lime-400 font-semibold mb-1">
            Winner: {POLICY_LABELS[hover.point.winner]}
          </div>
          {POLICIES.map((p) => (
            <div key={p} className="flex justify-between gap-4">
              <span style={{ color: POLICY_COLORS[p] }}>{POLICY_LABELS[p]}</span>
              <span className="text-lime-200/70 tabular-nums font-mono">
                {(hover.point[`${p}G` as 'walkG' | 'skipG' | 'runG' | 'strollG'] as number).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Legend */}
      <div className="flex gap-4 mt-2 justify-center">
        {POLICIES.map((p) => (
          <div key={p} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3" style={{ backgroundColor: POLICY_COLORS[p] }} />
            <span className="text-lime-200/70">{POLICY_LABELS[p]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Radar (SVG) ────────────────────────────────────────────

function PolicyRadar({
  data,
}: {
  data: Array<{ component: string; walk: number; skip: number; run: number; stroll: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#333" />
        <PolarAngleAxis dataKey="component" tick={{ fill: '#84cc16', fontSize: 10 }} />
        <PolarRadiusAxis tick={{ fill: '#666', fontSize: 9 }} domain={[0, 1]} tickCount={3} />
        {POLICIES.map((p) => (
          <Radar
            key={p}
            name={POLICY_LABELS[p]}
            dataKey={p}
            stroke={POLICY_COLORS[p]}
            fill={POLICY_COLORS[p]}
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
        ))}
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value: string) => <span style={{ color: '#d9f99d' }}>{value}</span>}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Tooltip Styles ────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0a0a0a',
    border: '1px solid #84cc16',
    borderRadius: 0,
  },
  labelStyle: { color: '#84cc16' },
};

// ── Main Viewer ───────────────────────────────────────────────────

export default function Viewer({
  context,
  weights,
  axisX,
  axisY,
  crossoverAxis,
  showAllPolicies,
}: ViewerProps) {
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPhase((p) => (p + 0.05) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // ── Computed data ───────────────────────────────────────────────

  const allPolicies = useMemo(() => computeAllPolicies(context, weights), [context, weights]);

  const policyScores = useMemo(() => {
    return POLICIES.map((p) => ({
      policy: p,
      G: allPolicies[p].G,
      rank: allPolicies[p].rank!,
    }));
  }, [allPolicies]);

  const winner = policyScores.reduce((a, b) => (a.G < b.G ? a : b));

  // Crossover data: sweep crossoverAxis
  const crossoverData = useMemo(() => {
    const N = 80;
    const rows = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const ctx2 = { ...context, [crossoverAxis]: x };
      const res = computeAllPolicies(ctx2, weights);
      rows.push({
        x,
        walk: res.walk.G,
        skip: res.skip.G,
        run: res.run.G,
        stroll: res.stroll.G,
      });
    }
    return rows;
  }, [context, weights, crossoverAxis]);

  // Determine top 2 policies (for filtered mode)
  const top2 = useMemo(() => {
    const sorted = [...policyScores].sort((a, b) => a.G - b.G);
    return new Set([sorted[0].policy, sorted[1].policy]);
  }, [policyScores]);

  // Crossover points
  const crossoverPoints = useMemo(
    () => findAllCrossoverPoints(crossoverAxis, context, weights),
    [crossoverAxis, context, weights],
  );

  // Heatmap
  const heatmapResolution = 25;
  const heatmapData = useMemo(
    () => generateHeatmap(axisX, axisY, context, weights, heatmapResolution),
    [context, weights, axisX, axisY],
  );

  // Radar
  const radarData = useMemo(
    () => computeRadarProfile(context, weights),
    [context, weights],
  );

  // Waterfall
  const waterfallResult = useMemo(
    () => computeWaterfallData(context, weights),
    [context, weights],
  );

  // Sensitivity
  const sensitivity = useMemo(
    () => computeSensitivity(context, weights),
    [context, weights],
  );

  // Crossover axis label
  const crossoverLabel = CONTEXT_KEYS.find((k) => k.key === crossoverAxis)?.label ?? crossoverAxis;

  return (
    <div className="w-full text-lime-100 space-y-6 overflow-y-auto outline-none [&_*]:outline-none" style={{ minHeight: '90vh' }}>

      {/* ── Row 1: Policy Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              <StickFigure
                policy={ps.policy}
                phase={animPhase}
                size={50}
                color={POLICY_COLORS[ps.policy]}
              />
              <div className="text-sm font-semibold mt-2" style={{ color: POLICY_COLORS[ps.policy] }}>
                {POLICY_LABELS[ps.policy]}
              </div>
              <div className="text-xs text-lime-200/70 tabular-nums font-mono">
                G = {ps.G.toFixed(2)}
              </div>
              <div className="text-xs text-lime-200/60 mt-1">#{ps.rank}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Canvas Heatmap ─────────────────────────────── */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          Policy Landscape
        </h3>
        <CanvasHeatmap
          data={heatmapData}
          xAxis={axisX}
          yAxis={axisY}
          currentX={context[axisX]}
          currentY={context[axisY]}
          resolution={heatmapResolution}
        />
      </div>

      {/* ── Row 3: Crossover + Radar ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crossover plot */}
        <div className="bg-black/30 border border-lime-500/20 p-4">
          <h3 className="text-lime-400 text-sm font-semibold mb-3">
            EFE Crossover ({crossoverLabel})
          </h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={crossoverData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#84cc16" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0, 1]}
                  tickCount={6}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fill: '#84cc16', fontSize: 11 }}
                  axisLine={{ stroke: '#84cc16' }}
                />
                <YAxis
                  tick={{ fill: '#84cc16', fontSize: 11 }}
                  axisLine={{ stroke: '#84cc16' }}
                  tickFormatter={(v: number) => v.toFixed(2)}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  labelFormatter={(label) => typeof label === 'number' ? `${crossoverLabel}: ${label.toFixed(2)}` : label}
                  formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: string) => <span style={{ color: '#d9f99d' }}>{value}</span>}
                />
                {POLICIES.map((p) => {
                  if (!showAllPolicies && !top2.has(p)) return null;
                  return (
                    <Line
                      key={p}
                      type="monotone"
                      dataKey={p}
                      name={POLICY_LABELS[p]}
                      stroke={POLICY_COLORS[p]}
                      dot={false}
                      strokeWidth={2}
                    />
                  );
                })}
                {/* Crossover markers */}
                {crossoverPoints.map((cp, i) => (
                  <ReferenceLine
                    key={`cp-${i}`}
                    x={cp.x}
                    stroke="#ffffff"
                    strokeDasharray="2 4"
                    strokeWidth={1}
                    label={{
                      value: `${POLICY_LABELS[cp.policy1][0]}=${POLICY_LABELS[cp.policy2][0]}`,
                      position: 'top',
                      fill: '#ffffff',
                      fontSize: 9,
                    }}
                  />
                ))}
                {/* Current position */}
                <ReferenceLine
                  x={context[crossoverAxis]}
                  stroke="#84cc16"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'now',
                    position: 'top',
                    fill: '#84cc16',
                    fontSize: 10,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-black/30 border border-lime-500/20 p-4">
          <h3 className="text-lime-400 text-sm font-semibold mb-3">
            EFE Component Fingerprint
          </h3>
          <PolicyRadar data={radarData} />
        </div>
      </div>

      {/* ── Row 4: Waterfall + Sensitivity ────────────────────── */}
      <div className="bg-black/30 border border-lime-500/20 p-4">
        <h3 className="text-lime-400 text-sm font-semibold mb-3">
          EFE Breakdown — {POLICY_LABELS[waterfallResult.winner]} (G = {waterfallResult.totalG.toFixed(2)})
        </h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={waterfallResult.entries}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#84cc16" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#84cc16', fontSize: 11 }}
                axisLine={{ stroke: '#84cc16' }}
                tickFormatter={(v: number) => v.toFixed(2)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#d9f99d', fontSize: 11 }}
                axisLine={{ stroke: '#84cc16' }}
                width={70}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                labelFormatter={(label) => String(label)}
                formatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
              />
              <ReferenceLine x={0} stroke="#84cc16" strokeWidth={1} />
              <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                {waterfallResult.entries.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.value < 0 ? '#22d3ee' : '#84cc16'}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sensitivity */}
        <div className="mt-3 pt-3 border-t border-lime-500/10">
          <span className="text-xs text-lime-200/60">Most influential parameters: </span>
          {sensitivity.slice(0, 3).map((s, i) => (
            <span key={s.param} className="text-xs">
              <span className={s.flips ? 'text-lime-400 font-semibold' : 'text-lime-200/70'}>
                {s.label}
              </span>
              {s.flips && <span className="text-lime-400 text-[10px]"> (flips)</span>}
              {i < 2 ? <span className="text-lime-200/40">{' · '}</span> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
