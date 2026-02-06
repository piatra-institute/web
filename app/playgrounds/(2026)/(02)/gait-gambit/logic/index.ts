// Expected Free Energy (EFE) model for gait policy selection
// Supports: walk, skip, run, stroll

export type PolicyType = 'walk' | 'skip' | 'run' | 'stroll';

export interface Context {
  crowd: number; // [0, 1]
  distance: number; // [0, 1]
  surfaceHard: number; // [0, 1]
  hurry: number; // [0, 1]
  mastery: number; // [0, 1]
  normPressure: number; // [0, 1]
  currentArousal: number; // [0, 1]
  desiredArousal: number; // [0, 1]
  novelty: number; // [0, 1]
  carryingLoad: number; // [0, 1]
}

export interface Weights {
  risk: number;
  amb: number;
  info: number;
  energy: number;
  social: number;
  injury: number;
  arousal: number;
}

export interface PolicyComponents {
  risk: number;
  ambiguity: number;
  infoGain: number;
  energyCost: number;
  socialPenalty: number;
  injuryProb: number;
  arousalMismatch: number;
  predictedArousal: number;
  goalMismatch: number;
  speed: number;
  complexity: number;
  impact: number;
}

export interface PolicyResult {
  policy: PolicyType;
  G: number; // Expected free energy
  components: PolicyComponents;
  parts: Record<string, number>;
  rank?: number; // 1-4 ranking among all policies
}

export interface SimulationState {
  t: number;
  position: number;
  arousal: number;
  mastery: number;
  fatigue: number;
  noveltyRemaining: number;
}

export const DEFAULT_CONTEXT: Context = {
  crowd: 0.35,
  distance: 0.35,
  surfaceHard: 0.55,
  hurry: 0.35,
  mastery: 0.7,
  normPressure: 0.55,
  currentArousal: 0.45,
  desiredArousal: 0.6,
  novelty: 0.3,
  carryingLoad: 0.2,
};

export const DEFAULT_WEIGHTS: Weights = {
  risk: 1.0,
  amb: 0.8,
  info: 0.9,
  energy: 0.9,
  social: 1.0,
  injury: 1.1,
  arousal: 0.9,
};

const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));

export const POLICY_COLORS: Record<PolicyType, string> = {
  walk: '#22c55e',   // green
  skip: '#facc15',   // yellow
  run: '#f97316',    // orange
  stroll: '#6b7280', // gray
};

export const POLICY_LABELS: Record<PolicyType, string> = {
  walk: 'Walk',
  skip: 'Skip',
  run: 'Run',
  stroll: 'Stroll',
};

export const POLICY_SPECS: Record<PolicyType, {
  impact: number;
  signalAmp: number;
  energyPerDist: number;
  conspicuous: number;
  complexity: number;
  speed: number;
}> = {
  walk: {
    impact: 0.25,
    signalAmp: 0.35,
    energyPerDist: 0.25,
    conspicuous: 0.2,
    complexity: 0.25,
    speed: 0.35,
  },
  skip: {
    impact: 0.75,
    signalAmp: 0.85,
    energyPerDist: 0.55,
    conspicuous: 0.85,
    complexity: 0.75,
    speed: 0.55,
  },
  run: {
    impact: 0.9,
    signalAmp: 0.8,
    energyPerDist: 0.75,
    conspicuous: 0.65,
    complexity: 0.45,
    speed: 0.85,
  },
  stroll: {
    impact: 0.15,
    signalAmp: 0.2,
    energyPerDist: 0.15,
    conspicuous: 0.1,
    complexity: 0.1,
    speed: 0.2,
  },
};

export const CONTEXT_GROUPS: Array<{
  label: string;
  keys: Array<{ key: keyof Context; label: string; hint: string }>;
}> = [
  {
    label: 'Environment',
    keys: [
      { key: 'crowd', label: 'Crowd / obstacles', hint: 'Collision risk & social salience' },
      { key: 'distance', label: 'Distance', hint: 'Trip length (affects energy)' },
      { key: 'surfaceHard', label: 'Surface hardness', hint: 'Impact cost on joints' },
    ],
  },
  {
    label: 'Agent',
    keys: [
      { key: 'mastery', label: 'Skill mastery', hint: 'How well you can skip' },
      { key: 'currentArousal', label: 'Current arousal', hint: 'How energised right now' },
      { key: 'desiredArousal', label: 'Desired arousal', hint: 'Target energy level' },
    ],
  },
  {
    label: 'Social & Task',
    keys: [
      { key: 'normPressure', label: 'Norm pressure', hint: 'Social expectation weight' },
      { key: 'carryingLoad', label: 'Carrying load', hint: 'Objects in hands' },
      { key: 'hurry', label: 'Hurry / schedule pressure', hint: 'Speed preference' },
    ],
  },
  {
    label: 'Exploration',
    keys: [
      { key: 'novelty', label: 'Novelty / learning', hint: 'New skills available' },
    ],
  },
];

export const CONTEXT_KEYS: Array<{ key: keyof Context; label: string }> =
  CONTEXT_GROUPS.flatMap((g) => g.keys.map((k) => ({ key: k.key, label: k.label })));

export function computePolicy(
  policy: PolicyType,
  ctx: Context,
  w: Weights,
): PolicyResult {
  const spec = POLICY_SPECS[policy];
  const {
    crowd,
    distance,
    surfaceHard,
    hurry,
    mastery,
    normPressure,
    currentArousal,
    desiredArousal,
    novelty,
    carryingLoad,
  } = ctx;

  // Injury probability
  const injuryProb = clamp(
    0.05 +
      0.55 * spec.impact * (0.35 + 0.65 * surfaceHard) * (0.3 + 0.7 * crowd) * (0.55 + 0.45 * carryingLoad) *
      (1 - 0.75 * mastery)
  );

  // Social penalty
  const socialPenalty = clamp(spec.conspicuous * (0.15 + 0.85 * crowd) * (0.1 + 0.9 * normPressure));

  // Energy cost
  const energyCost = clamp((0.15 + 0.85 * distance) * spec.energyPerDist * (0.7 + 0.6 * carryingLoad));

  // Ambiguity
  const ambiguity = clamp(
    (0.65 - 0.45 * spec.signalAmp) * (0.75 - 0.55 * mastery) + 0.25 * crowd
  );

  // Information gain
  const infoGain = clamp(
    novelty * spec.complexity * (1 - mastery) * (0.35 + 0.65 * spec.signalAmp) * (1 - 0.55 * crowd)
  );

  // Goal mismatch
  const goalMismatch = clamp(Math.max(0, hurry - spec.speed));

  // Arousal prediction and mismatch
  const predictedArousal = clamp(currentArousal + 0.45 * spec.signalAmp + 0.25 * spec.impact - 0.1 * distance);
  const arousalMismatch = clamp(Math.abs(desiredArousal - predictedArousal));

  // Risk aggregation
  const risk = clamp(
    0.15 * goalMismatch + 0.55 * injuryProb + 0.25 * ambiguity + 0.2 * (carryingLoad * spec.impact)
  );

  // EFE computation
  const parts: Record<string, number> = {
    'Risk': w.risk * risk,
    'Ambiguity': w.amb * ambiguity,
    '-InfoGain': -w.info * infoGain,
    'Energy': w.energy * energyCost,
    'Social': w.social * socialPenalty,
    'Injury': w.injury * injuryProb,
    'ArousalMismatch': w.arousal * arousalMismatch,
  };

  const G = Object.values(parts).reduce((a, b) => a + b, 0);

  return {
    policy,
    G,
    components: {
      risk,
      ambiguity,
      infoGain,
      energyCost,
      socialPenalty,
      injuryProb,
      arousalMismatch,
      predictedArousal,
      goalMismatch,
      speed: spec.speed,
      complexity: spec.complexity,
      impact: spec.impact,
    },
    parts,
  };
}

export function computeAllPolicies(
  ctx: Context,
  w: Weights,
): Record<PolicyType, PolicyResult> {
  const policies: PolicyType[] = ['walk', 'skip', 'run', 'stroll'];
  const results = {} as Record<PolicyType, PolicyResult>;

  const computed = policies.map((p) => computePolicy(p, ctx, w));
  const sorted = [...computed].sort((a, b) => a.G - b.G);

  sorted.forEach((result, idx) => {
    result.rank = idx + 1;
    results[result.policy] = result;
  });

  return results;
}

// Heatmap data for 2D parameter sweep
export interface HeatmapPoint {
  x: number;
  y: number;
  walkG: number;
  skipG: number;
  runG: number;
  strollG: number;
  winner: PolicyType;
  margin: number; // how dominant the winner is
}

export function generateHeatmap(
  xAxis: keyof Context,
  yAxis: keyof Context,
  ctx: Context,
  w: Weights,
  resolution = 25,
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];

  for (let yi = 0; yi < resolution; yi++) {
    for (let xi = 0; xi < resolution; xi++) {
      const xVal = xi / (resolution - 1);
      const yVal = yi / (resolution - 1);

      const ctx2 = { ...ctx, [xAxis]: xVal, [yAxis]: yVal };
      const results = computeAllPolicies(ctx2, w);

      const walkG = results.walk.G;
      const skipG = results.skip.G;
      const runG = results.run.G;
      const strollG = results.stroll.G;

      const Gs = [walkG, skipG, runG, strollG];
      const minG = Math.min(...Gs);
      const sortedGs = [...Gs].sort((a, b) => a - b);
      const margin = sortedGs[1] - sortedGs[0]; // gap between winner and runner-up

      const winner = (
        minG === walkG ? 'walk' :
        minG === skipG ? 'skip' :
        minG === runG ? 'run' : 'stroll'
      ) as PolicyType;

      points.push({
        x: xVal,
        y: yVal,
        walkG,
        skipG,
        runG,
        strollG,
        winner,
        margin,
      });
    }
  }

  return points;
}

// Sensitivity analysis: perturb each context param, measure G delta and winner flip
export interface SensitivityEntry {
  param: keyof Context;
  label: string;
  delta: number; // absolute change in winning G
  flips: boolean; // does winner change?
}

export function computeSensitivity(ctx: Context, w: Weights): SensitivityEntry[] {
  const eps = 0.05;
  const base = computeAllPolicies(ctx, w);
  const baseWinner = (['walk', 'skip', 'run', 'stroll'] as PolicyType[]).reduce(
    (best, p) => (base[p].G < base[best].G ? p : best),
    'walk' as PolicyType,
  );
  const baseG = base[baseWinner].G;

  const entries: SensitivityEntry[] = [];
  for (const group of CONTEXT_GROUPS) {
    for (const { key, label } of group.keys) {
      let maxDelta = 0;
      let flips = false;

      for (const dir of [-1, 1]) {
        const val = clamp(ctx[key] + dir * eps);
        const ctx2 = { ...ctx, [key]: val };
        const res = computeAllPolicies(ctx2, w);
        const newWinner = (['walk', 'skip', 'run', 'stroll'] as PolicyType[]).reduce(
          (best, p) => (res[p].G < res[best].G ? p : best),
          'walk' as PolicyType,
        );
        const newG = res[newWinner].G;
        const d = Math.abs(newG - baseG);
        if (d > maxDelta) maxDelta = d;
        if (newWinner !== baseWinner) flips = true;
      }

      entries.push({ param: key, label, delta: maxDelta, flips });
    }
  }

  return entries.sort((a, b) => {
    if (a.flips !== b.flips) return a.flips ? -1 : 1;
    return b.delta - a.delta;
  });
}

// Find all crossover points when sweeping one axis 0→1
export interface CrossoverPoint {
  x: number;
  policy1: PolicyType;
  policy2: PolicyType;
}

export function findAllCrossoverPoints(
  axis: keyof Context,
  ctx: Context,
  w: Weights,
  resolution = 200,
): CrossoverPoint[] {
  const policies: PolicyType[] = ['walk', 'skip', 'run', 'stroll'];
  const crossovers: CrossoverPoint[] = [];

  // Compute G for each policy at each x
  const prevGs: Record<PolicyType, number> = {} as Record<PolicyType, number>;
  {
    const ctx0 = { ...ctx, [axis]: 0 };
    for (const p of policies) {
      prevGs[p] = computePolicy(p, ctx0, w).G;
    }
  }

  for (let i = 1; i <= resolution; i++) {
    const x = i / resolution;
    const ctx2 = { ...ctx, [axis]: x };
    const curGs: Record<PolicyType, number> = {} as Record<PolicyType, number>;
    for (const p of policies) {
      curGs[p] = computePolicy(p, ctx2, w).G;
    }

    // Check all pairs for crossover
    for (let a = 0; a < policies.length; a++) {
      for (let b = a + 1; b < policies.length; b++) {
        const p1 = policies[a];
        const p2 = policies[b];
        const prevDiff = prevGs[p1] - prevGs[p2];
        const curDiff = curGs[p1] - curGs[p2];

        if ((prevDiff <= 0 && curDiff > 0) || (prevDiff >= 0 && curDiff < 0)) {
          // Interpolate
          const t = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(curDiff) + 1e-9);
          const crossX = (i - 1 + t) / resolution;
          crossovers.push({ x: crossX, policy1: p1, policy2: p2 });
        }
      }
    }

    for (const p of policies) {
      prevGs[p] = curGs[p];
    }
  }

  return crossovers;
}

// Radar profile: 7 EFE components for all 4 policies
export interface RadarDataPoint {
  component: string;
  walk: number;
  skip: number;
  run: number;
  stroll: number;
}

export function computeRadarProfile(ctx: Context, w: Weights): RadarDataPoint[] {
  const results = computeAllPolicies(ctx, w);
  const components: Array<{ key: keyof PolicyComponents; label: string }> = [
    { key: 'risk', label: 'Risk' },
    { key: 'ambiguity', label: 'Ambiguity' },
    { key: 'infoGain', label: 'InfoGain' },
    { key: 'energyCost', label: 'Energy' },
    { key: 'socialPenalty', label: 'Social' },
    { key: 'injuryProb', label: 'Injury' },
    { key: 'arousalMismatch', label: 'Arousal' },
  ];

  return components.map(({ key, label }) => ({
    component: label,
    walk: results.walk.components[key],
    skip: results.skip.components[key],
    run: results.run.components[key],
    stroll: results.stroll.components[key],
  }));
}

// Waterfall data: weighted EFE parts for the winning policy
export interface WaterfallEntry {
  name: string;
  value: number; // signed: positive = cost, negative = benefit
}

export function computeWaterfallData(ctx: Context, w: Weights): { entries: WaterfallEntry[]; winner: PolicyType; totalG: number } {
  const results = computeAllPolicies(ctx, w);
  const policies: PolicyType[] = ['walk', 'skip', 'run', 'stroll'];
  const winner = policies.reduce(
    (best, p) => (results[p].G < results[best].G ? p : best),
    'walk' as PolicyType,
  );

  const parts = results[winner].parts;
  const entries: WaterfallEntry[] = Object.entries(parts).map(([name, value]) => ({
    name,
    value,
  }));

  // Sort: negative first (benefits), then positive by magnitude
  entries.sort((a, b) => {
    if (a.value < 0 && b.value >= 0) return -1;
    if (a.value >= 0 && b.value < 0) return 1;
    return Math.abs(b.value) - Math.abs(a.value);
  });

  return { entries, winner, totalG: results[winner].G };
}

// Time-based simulation
export function stepSimulation(
  state: SimulationState,
  policy: PolicyType,
  ctx: Context,
  w: Weights,
  dt: number,
): SimulationState {
  const spec = POLICY_SPECS[policy];

  const progress = state.position + spec.speed * dt;

  const arousalInput = 0.45 * spec.signalAmp + 0.25 * spec.impact - 0.1 * ctx.distance;
  const newArousal = clamp(state.arousal + arousalInput * dt * 0.2 - 0.05 * dt);

  const learningRate = (1 - state.mastery) * ctx.novelty * spec.complexity * 0.001;
  const newMastery = clamp(state.mastery + learningRate * dt);

  const fatigueAccum = spec.energyPerDist * spec.impact * 0.01 * dt;
  const fatigueRecovery = 0.002 * dt * (1 - state.arousal) / 2;
  const newFatigue = clamp(state.fatigue + fatigueAccum - fatigueRecovery);

  const noveltyDecay = 0.001 * dt;
  const newNovelty = Math.max(0, state.noveltyRemaining - noveltyDecay);

  return {
    t: state.t + dt,
    position: Math.min(1, progress),
    arousal: newArousal,
    mastery: newMastery,
    fatigue: newFatigue,
    noveltyRemaining: newNovelty,
  };
}

export function createInitialState(): SimulationState {
  return {
    t: 0,
    position: 0,
    arousal: 0.5,
    mastery: 0.7,
    fatigue: 0,
    noveltyRemaining: 0.3,
  };
}
