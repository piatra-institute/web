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

const POLICY_SPECS: Record<PolicyType, {
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
  const parts = {
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
  const results: Record<PolicyType, PolicyResult> = {} as any;

  const computed = policies.map((p) => computePolicy(p, ctx, w));
  const sorted = computed.sort((a, b) => a.G - b.G);

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
}

export function generateHeatmap(
  xAxis: keyof Context,
  yAxis: keyof Context,
  ctx: Context,
  w: Weights,
  resolution = 20,
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
      });
    }
  }

  return points;
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

  // Progress along distance
  const progress = state.position + spec.speed * dt;

  // Arousal updates
  const arousalInput = 0.45 * spec.signalAmp + 0.25 * spec.impact - 0.1 * ctx.distance;
  const newArousal = clamp(state.arousal + arousalInput * dt * 0.2 - 0.05 * dt);

  // Mastery improvements (learning)
  const learningRate = (1 - state.mastery) * ctx.novelty * spec.complexity * 0.001;
  const newMastery = clamp(state.mastery + learningRate * dt);

  // Fatigue accumulation
  const fatigueAccum = spec.energyPerDist * spec.impact * 0.01 * dt;
  const fatigueRecovery = 0.002 * dt * (1 - state.arousal) / 2; // recover when calm
  const newFatigue = clamp(state.fatigue + fatigueAccum - fatigueRecovery);

  // Novelty decay
  const noveltyDecay = 0.001 * dt;
  const newNovelty = Math.max(0, state.noveltyRemaining - noveltyDecay);

  return {
    t: state.t + dt,
    position: Math.min(1, progress), // clamp to [0, 1]
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

// Helper: Find crossover point between two policies when sweeping a parameter
export function findCrossover(
  policy1: PolicyType,
  policy2: PolicyType,
  axis: keyof Context,
  ctx: Context,
  w: Weights,
  resolution = 100,
): number | null {
  let prev = computePolicy(policy1, ctx, w);
  let prevOther = computePolicy(policy2, ctx, w);
  let prevDiff = prev.G - prevOther.G;

  for (let i = 1; i < resolution; i++) {
    const x = i / (resolution - 1);
    const ctx2 = { ...ctx, [axis]: x };

    const cur = computePolicy(policy1, ctx2, w);
    const curOther = computePolicy(policy2, ctx2, w);
    const curDiff = cur.G - curOther.G;

    if ((prevDiff <= 0 && curDiff > 0) || (prevDiff >= 0 && curDiff < 0)) {
      // Crossover found, interpolate
      const t = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(curDiff) + 1e-9);
      return prev.G + t * (cur.G - prev.G);
    }

    prev = cur;
    prevOther = curOther;
    prevDiff = curDiff;
  }

  return null;
}
