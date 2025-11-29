'use client';

import { forwardRef, useImperativeHandle, useState, useMemo, useRef, useEffect } from 'react';
import { ViewerRef, SimulationParams, Mechanics } from '../../playground';

interface SeriesPoint {
    t: number;
    active: number;
    seedsVisible: number;
    cumulativeReach: number;
    blockedOrDelayed: number;
    manipCumulative: number;
}

interface ScenarioConfig {
    name: string;
    mechanics: Mechanics;
}

interface SimulationResult {
    series: SeriesPoint[];
    summary: {
        peakActive: number;
        tPeak: number;
        totalReach: number;
        totalSeedsVisible: number;
        totalBlockedOrDelayed: number;
        R_eff: number;
        baseR: number;
        allowedPerAgentPerDay: number;
        seedsPerMinute: number;
        identityVisibilityFactor: number;
        coolupDelayMinutes: number;
        convProbEff: number;
        freshnessFactor: number;
        baseAgeMin: number;
        totalManipulation: number;
    };
}

// Seeded RNG
function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function simulateScenario(params: SimulationParams, scenario: ScenarioConfig): SimulationResult {
    const {
        spamAgents,
        audienceSize,
        baselinePostsPerAgentPerDay,
        avgDegree,
        shareProb,
        amplification,
        convProb,
        attentionHalfLifeMin,
        gatingConvReduction,
        cascadeLagMin,
        simMinutes,
        seed,
    } = params;

    const rng = mulberry32(seed + scenario.name.length);

    // Base reproduction number
    const baseR = avgDegree * shareProb * amplification;

    // Mechanics effects
    const capPerAccountPerDay = scenario.mechanics.cooldown10h ? 2.4 : baselinePostsPerAgentPerDay;
    const electionCapPerDay = scenario.mechanics.election1hWindow ? 1 : capPerAccountPerDay;
    const allowedPerAgentPerDay = Math.min(baselinePostsPerAgentPerDay, electionCapPerDay);
    const baselineSeedsPerMinute = (spamAgents * allowedPerAgentPerDay) / (24 * 60);

    const identityVisibilityFactor = scenario.mechanics.identityTiers ? 0.75 : 1.0;
    const coolupDelayMinutes = scenario.mechanics.coolup10h ? 600 : 0;
    const coolupIgnitionDamp = scenario.mechanics.coolup10h ? 0.55 : 1.0;
    const degreeFactor = scenario.mechanics.forwardCaps ? 0.5 : 1.0;
    const shareProbFactor = scenario.mechanics.questionGating ? 0.75 : 1.0;
    const convGatingFactor = scenario.mechanics.questionGating ? (1 - gatingConvReduction) : 1.0;
    const speedFactor = scenario.mechanics.slowMode ? 0.6 : 1.0;

    const R_eff = Math.max(0, baseR * degreeFactor * shareProbFactor * coolupIgnitionDamp);
    const moderationLeak = 0.002;

    // Manipulation model
    const addedLag = scenario.mechanics.slowMode ? 120 : 0;
    const baseAgeMin = coolupDelayMinutes + cascadeLagMin + addedLag;
    const freshnessFactor = Math.pow(2, -baseAgeMin / Math.max(1, attentionHalfLifeMin));
    const convProbEff = convProb * convGatingFactor * freshnessFactor;

    // State arrays
    const series: SeriesPoint[] = new Array(simMinutes);
    const pendingSeeds: number[] = new Array(simMinutes + coolupDelayMinutes + 5).fill(0);

    let cumulativeReach = 0;
    let active = 0;
    let blockedOrDelayedCumulative = 0;
    let manipCumulative = 0;

    function seedIngressAt(t: number) {
        const allowedSeeds = baselineSeedsPerMinute * identityVisibilityFactor;
        const visibleNow = coolupDelayMinutes > 0 ? 0 : allowedSeeds;
        const delayedNow = coolupDelayMinutes > 0 ? allowedSeeds : 0;

        if (coolupDelayMinutes > 0) {
            const idx = t + coolupDelayMinutes;
            if (idx < pendingSeeds.length) pendingSeeds[idx] += allowedSeeds;
        }

        const blockedOrDelayed = baselineSeedsPerMinute - allowedSeeds + delayedNow;
        return { visibleNow, blockedOrDelayed };
    }

    const emaAlpha = speedFactor * 0.35;
    let emaActive = 0;

    for (let t = 0; t < simMinutes; t++) {
        const delayedVisible = pendingSeeds[t] || 0;
        const { visibleNow, blockedOrDelayed } = seedIngressAt(t);
        const seedsVisible = visibleNow + delayedVisible;

        const susceptible = Math.max(0, audienceSize - cumulativeReach);
        const saturationFactor = susceptible > 0 ? susceptible / audienceSize : 0;

        const rawNewFromActive = active * R_eff * saturationFactor;
        let nextActiveRaw = rawNewFromActive + seedsVisible;
        nextActiveRaw = Math.max(0, nextActiveRaw * (1 - moderationLeak));

        emaActive = emaActive + emaAlpha * (nextActiveRaw - emaActive);
        const nextActive = emaActive;

        const exposuresThisMinute = Math.min(susceptible, nextActive);
        cumulativeReach += exposuresThisMinute;

        const manipInc = exposuresThisMinute * convProbEff;
        manipCumulative += manipInc;

        series[t] = {
            t,
            active: nextActive,
            seedsVisible,
            cumulativeReach,
            blockedOrDelayed,
            manipCumulative,
        };

        active = nextActive;
        blockedOrDelayedCumulative += blockedOrDelayed;
    }

    // Summary stats
    let peakActive = 0;
    let tPeak = 0;
    let totalSeedsVisible = 0;
    let totalBlockedOrDelayed = 0;
    for (const pt of series) {
        if (pt.active > peakActive) {
            peakActive = pt.active;
            tPeak = pt.t;
        }
        totalSeedsVisible += pt.seedsVisible;
        totalBlockedOrDelayed += pt.blockedOrDelayed;
    }

    return {
        series,
        summary: {
            peakActive,
            tPeak,
            totalReach: cumulativeReach,
            totalSeedsVisible,
            totalBlockedOrDelayed,
            R_eff,
            baseR,
            allowedPerAgentPerDay,
            seedsPerMinute: baselineSeedsPerMinute,
            identityVisibilityFactor,
            coolupDelayMinutes,
            convProbEff,
            freshnessFactor,
            baseAgeMin,
            totalManipulation: manipCumulative,
        },
    };
}

function drawChart(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; w: number; h: number },
    series: SeriesPoint[],
    color: string,
    label: string,
    yMaxHint?: number
) {
    const { x, y, w, h } = rect;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = 'rgba(132, 204, 22, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    // Compute scales
    const maxActive = yMaxHint || Math.max(...series.map((s) => s.active), 1);
    const maxReach = Math.max(...series.map((s) => s.cumulativeReach), 1);

    const n = series.length;
    const pxPerX = w / Math.max(1, n - 1);

    // Draw cumulative reach as faint line
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
        const sx = x + i * pxPerX;
        const sy = y + h - (series[i].cumulativeReach / maxReach) * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = 'rgba(132, 204, 22, 0.3)';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Draw active as bold line
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
        const sx = x + i * pxPerX;
        const sy = y + h - (series[i].active / maxActive) * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#84cc16';
    ctx.font = '600 12px ui-sans-serif, system-ui, -apple-system';
    ctx.fillText(label, x + 8, y + 18);

    // Legend
    ctx.fillStyle = color;
    ctx.fillRect(x + 8, y + 26, 16, 3);
    ctx.fillStyle = 'rgba(132, 204, 22, 0.3)';
    ctx.fillRect(x + 8, y + 33, 16, 3);
    ctx.fillStyle = '#a3a3a3';
    ctx.fillText('Active / Reach', x + 28, y + 35);
}

function fmt(n: number): string {
    if (n < 1_000) return n.toFixed(0);
    if (n < 1_000_000) return (n / 1_000).toFixed(1) + 'k';
    if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    return (n / 1_000_000_000).toFixed(2) + 'B';
}

function fmtMin(m: number): string {
    const d = Math.floor(m / (60 * 24));
    const h = Math.floor((m % (60 * 24)) / 60);
    const mi = m % 60;
    const parts: string[] = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (mi && d === 0) parts.push(`${mi}m`);
    return parts.join(' ') || '0m';
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>({
        spamAgents: 1_000_000,
        audienceSize: 100_000_000,
        baselinePostsPerAgentPerDay: 0.2,
        avgDegree: 150,
        shareProb: 0.02,
        amplification: 1.0,
        convProb: 0.005,
        attentionHalfLifeMin: 240,
        gatingConvReduction: 0.20,
        cascadeLagMin: 60,
        simMinutes: 60 * 24 * 3,
        seed: 42,
    });

    const [mechanics, setMechanics] = useState<Mechanics>({
        cooldown10h: true,
        coolup10h: true,
        election1hWindow: false,
        forwardCaps: true,
        questionGating: true,
        identityTiers: true,
        slowMode: true,
    });

    useImperativeHandle(ref, () => ({
        updateSimulation: (newParams: SimulationParams, newMechanics: Mechanics) => {
            setParams(newParams);
            setMechanics(newMechanics);
        },
        reset: () => {
            setParams({
                spamAgents: 1_000_000,
                audienceSize: 100_000_000,
                baselinePostsPerAgentPerDay: 0.2,
                avgDegree: 150,
                shareProb: 0.02,
                amplification: 1.0,
                convProb: 0.005,
                attentionHalfLifeMin: 240,
                gatingConvReduction: 0.20,
                cascadeLagMin: 60,
                simMinutes: 60 * 24 * 3,
                seed: 42,
            });
            setMechanics({
                cooldown10h: true,
                coolup10h: true,
                election1hWindow: false,
                forwardCaps: true,
                questionGating: true,
                identityTiers: true,
                slowMode: true,
            });
        },
    }));

    const baselineScenario: ScenarioConfig = useMemo(
        () => ({
            name: 'Free-for-all',
            mechanics: {
                cooldown10h: false,
                coolup10h: false,
                election1hWindow: false,
                forwardCaps: false,
                questionGating: false,
                identityTiers: false,
                slowMode: false,
            },
        }),
        []
    );

    const policyScenario: ScenarioConfig = useMemo(
        () => ({ name: 'Policy Mechanics', mechanics }),
        [mechanics]
    );

    const resultA = useMemo(() => simulateScenario(params, baselineScenario), [params, baselineScenario]);
    const resultB = useMemo(() => simulateScenario(params, policyScenario), [params, policyScenario]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Layout
        const pad = 16;
        const midGap = 16;
        const chartW = (width - pad * 2 - midGap) / 2;
        const chartH = height - pad * 2 - 170;

        drawChart(
            ctx,
            { x: pad, y: pad, w: chartW, h: chartH },
            resultA.series,
            '#ef4444',
            baselineScenario.name
        );
        drawChart(
            ctx,
            { x: pad + chartW + midGap, y: pad, w: chartW, h: chartH },
            resultB.series,
            '#84cc16',
            policyScenario.name
        );

        // Stats area
        const sx = pad;
        let sy = pad + chartH + 24;
        const lineH = 16;

        const write = (text: string) => {
            ctx.fillStyle = '#d4d4d4';
            ctx.font = '500 11px ui-monospace, monospace';
            ctx.fillText(text, sx, sy);
            sy += lineH;
        };

        const { summary: sumA } = resultA;
        const { summary: sumB } = resultB;

        write('Baseline vs Policy:');
        write(
            `R_eff: ${sumA.R_eff.toFixed(2)} vs ${sumB.R_eff.toFixed(2)} | BaseR=${sumA.baseR.toFixed(2)}`
        );
        write(
            `Peak active: ${fmt(sumA.peakActive)} @ ${fmtMin(sumA.tPeak)} vs ${fmt(sumB.peakActive)} @ ${fmtMin(sumB.tPeak)}`
        );
        write(
            `Total reach: ${fmt(sumA.totalReach)} vs ${fmt(sumB.totalReach)} (${fmtMin(params.simMinutes)})`
        );
        write(
            `Seeds visible: ${fmt(sumA.totalSeedsVisible)} vs ${fmt(sumB.totalSeedsVisible)}`
        );

        const red = sumA.totalManipulation > 0 ? 100 * (1 - sumB.totalManipulation / sumA.totalManipulation) : 0;
        ctx.fillStyle = '#84cc16';
        ctx.font = '600 12px ui-monospace, monospace';
        write(
            `PMI: ${fmt(sumA.totalManipulation)} vs ${fmt(sumB.totalManipulation)} | Reduction: ${isFinite(red) ? red.toFixed(1) : '0.0'}%`
        );

        ctx.fillStyle = '#d4d4d4';
        ctx.font = '500 11px ui-monospace, monospace';
        write(
            `Conv p_eff: ${sumA.convProbEff.toExponential(2)} (FFA) vs ${sumB.convProbEff.toExponential(2)} (Policy)`
        );
    }, [resultA, resultB, baselineScenario.name, policyScenario.name, params.simMinutes]);

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6">
            <canvas ref={canvasRef} className="w-full h-[600px]" />
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
