export function entropy(p: number[]): number {
  return -p.reduce((sum, val) => (val > 0 ? sum + val * Math.log2(val) : sum), 0);
}

export function klDivergence(P: number[], Q: number[]): number {
  return P.reduce((sum, p, i) => (p > 0 && Q[i] > 0 ? sum + p * Math.log2(p / Q[i]) : sum), 0);
}

// More scientifically grounded corruption models
export enum CorruptionType {
  DIRECTIONAL = 'directional',
  VARIANCE = 'variance',
  SYSTEMATIC = 'systematic'
}

export function observedDistribution(C: number, R: number, corruptionType: CorruptionType = CorruptionType.DIRECTIONAL, seed?: number): number[] {
  const fair = [0.5, 0.5];
  
  // Deterministic pseudo-random function for consistent results
  const pseudoRandom = (input: number) => {
    const x = Math.sin(input) * 10000;
    return x - Math.floor(x);
  };
  
  let biased: number[];
  
  switch (corruptionType) {
    case CorruptionType.DIRECTIONAL:
      // Original model with theoretical justification: corruption creates systematic bias
      // Using sigmoid to prevent extreme values and create realistic bias curves
      const biasMagnitude = 0.4 * (1 / (1 + Math.exp(-5 * (C - 0.5))));
      biased = [0.5 + biasMagnitude, 0.5 - biasMagnitude];
      break;
      
    case CorruptionType.VARIANCE:
      // Corruption increases uncertainty rather than bias
      // Higher corruption = more unpredictable outcomes
      // Use deterministic noise for consistent visualization
      const variance = C * 0.25;
      const seedValue = seed !== undefined ? seed : C * 1000 + R * 100;
      const noise1 = (pseudoRandom(seedValue) - 0.5) * variance;
      const noise2 = -noise1; // Ensure probabilities sum to 1
      biased = [0.5 + noise1, 0.5 + noise2];
      break;
      
    case CorruptionType.SYSTEMATIC:
      // Corruption creates systematic errors in decision-making
      // Models institutional incompetence rather than malice
      const errorRate = C * 0.3;
      const systematic = 0.5 + (Math.sin(C * Math.PI * 2) * errorRate);
      biased = [systematic, 1 - systematic];
      break;
      
    default:
      biased = fair;
  }
  
  // Improved randomness model: weighted combination rather than simple interpolation
  // This preserves the underlying bias structure while adding uncertainty
  const preservationFactor = Math.exp(-R * 2); // Exponential decay preserves structure better
  const randomComponent = 1 - preservationFactor;
  
  // For variance corruption type, randomness affects the variance itself
  if (corruptionType === CorruptionType.VARIANCE) {
    const varianceMultiplier = 1 + R * 2; // Randomness amplifies variance effects
    const center = 0.5;
    biased = biased.map(p => center + (p - center) * varianceMultiplier);
  }
  
  const result = [
    preservationFactor * biased[0] + randomComponent * 0.5,
    preservationFactor * biased[1] + randomComponent * 0.5
  ];
  
  // Ensure probabilities are valid and sum to 1
  const sum = result.reduce((a, b) => a + b, 0);
  return result.map(p => Math.max(0.01, Math.min(0.99, p / sum)));
}

export interface Metrics {
  C: number;
  R: number;
  P: number[];
  H: number;
  D: number;
  H_fair: number;
  normFairness: number;
  biasImpact: number;
  // New scientifically grounded metrics
  demographicParity: number;
  totalVariation: number;
  jensenShannonDivergence: number;
  institutionalEfficiency: number;
}

// Additional scientifically grounded fairness metrics
export function totalVariationDistance(P: number[], Q: number[]): number {
  return 0.5 * P.reduce((sum, p, i) => sum + Math.abs(p - Q[i]), 0);
}

export function jensenShannonDivergence(P: number[], Q: number[]): number {
  const M = P.map((p, i) => 0.5 * (p + Q[i]));
  return 0.5 * klDivergence(P, M) + 0.5 * klDivergence(Q, M);
}

export function demographicParity(P: number[]): number {
  // Measures how close the distribution is to uniform (demographic parity)
  const uniform = new Array(P.length).fill(1 / P.length);
  return 1 - totalVariationDistance(P, uniform);
}

export function institutionalEfficiency(C: number, R: number): number {
  // Models the efficiency loss due to corruption and excessive randomness
  // Optimal point is low corruption with moderate randomness for transparency
  const corruptionLoss = C; // Direct efficiency loss from corruption
  const randomnessLoss = R > 0.5 ? (R - 0.5) * 0.5 : 0; // Excessive randomness reduces efficiency
  return Math.max(0, 1 - corruptionLoss - randomnessLoss);
}

export function calculateMetrics(C: number, R: number, corruptionType: CorruptionType = CorruptionType.DIRECTIONAL): Metrics {
  const P = observedDistribution(C, R, corruptionType);
  const Q = [0.5, 0.5]; // Ideal fair distribution
  const H = entropy(P);
  const D = klDivergence(P, Q);
  
  // Improved fairness metric with theoretical foundation
  // H_fair now represents "effective fairness entropy" accounting for bias
  const maxEntropy = Math.log2(P.length); // Maximum possible entropy for this distribution size
  const H_fair = maxEntropy - D; // Entropy achievable under fair conditions
  
  const normFairness = 1 - D / maxEntropy; // Normalized by maximum possible divergence
  const biasImpact = H > 0.00001 ? (D / H) : 0;
  
  // New metrics
  const demographicParityScore = demographicParity(P);
  const totalVar = totalVariationDistance(P, Q);
  const jsDiv = jensenShannonDivergence(P, Q);
  const efficiency = institutionalEfficiency(C, R);

  return {
    C,
    R,
    P,
    H,
    D,
    H_fair,
    normFairness,
    biasImpact,
    demographicParity: demographicParityScore,
    totalVariation: totalVar,
    jensenShannonDivergence: jsDiv,
    institutionalEfficiency: efficiency
  };
}

export function getQualitativeAssessment(H_fair: number): string {
  if (H_fair > 0.9) return "Very High";
  else if (H_fair > 0.7) return "High";
  else if (H_fair > 0.4) return "Moderate";
  else if (H_fair > 0.15) return "Low";
  else return "Very Low";
}

export function getZoneDescription(C: number, R: number, H_fair: number): {
  zone: string;
  interpretation: string;
} {
  let zone = "Intermediate State";
  let interpretation = "";

  if (C <= 0.2 && R >= 0.8) {
    zone = "Ideal Fair Zone";
    interpretation = "The system is in the Ideal Fair Zone. Low corruption and high randomness ensure equitable outcomes.";
  } else if (C >= 0.8 && R <= 0.2) {
    zone = "Corrupt & Unfair Zone";
    interpretation = "The system is in the Corrupt & Unfair Zone. High corruption and deterministic processes result in highly biased outcomes.";
  } else if (C >= 0.4 && C <= 0.6 && R >= 0.4 && R <= 0.6) {
    zone = "Random Justice Regime";
    interpretation = "This is the Random Justice Regime. Here, randomness helps mitigate the effects of moderate corruption.";
  } else if (C > 0.6 && R > 0.6) {
    zone = "High Corruption, High Randomness";
    interpretation = `Significant corruption (C=${C.toFixed(2)}) is present, but high randomness (R=${R.toFixed(2)}) is effectively improving fairness by 'washing out' some bias.`;
  } else if (C > 0.6 && R < 0.4) {
    zone = "High Corruption, Low Randomness";
    interpretation = `High corruption (C=${C.toFixed(2)}) combined with relatively low randomness (R=${R.toFixed(2)}) leads to outcomes heavily influenced by systemic bias.`;
  } else if (C < 0.3 && R < 0.3) {
    zone = "Low Corruption, Low Randomness";
    interpretation = `With low corruption (C=${C.toFixed(2)}) and low randomness (R=${R.toFixed(2)}), fairness depends significantly on the inherent justice of the deterministic rules. The system is rigid; if rules are biased, unfairness can still emerge.`;
  } else if (R > C && H_fair > 0.5) {
    zone = "Randomness Counteracting Corruption";
    interpretation = `Randomness (R=${R.toFixed(2)}) appears to be effectively counteracting the level of corruption (C=${C.toFixed(2)}).`;
  } else if (C > R && H_fair < 0.5) {
    zone = "Corruption Outweighing Randomness";
    interpretation = `Corruption (C=${C.toFixed(2)}) is outweighing the beneficial effects of randomness (R=${R.toFixed(2)}), leading to reduced fairness.`;
  } else {
    interpretation = `The current interplay of corruption (C=${C.toFixed(2)}) and randomness (R=${R.toFixed(2)}) defines this level of fairness. Explore the heatmap to see different regimes!`;
  }

  return { zone, interpretation };
}

export function generateHeatmapData(step: number = 0.05, corruptionType: CorruptionType = CorruptionType.DIRECTIONAL): Array<{x: number, y: number, v: number}> {
  const dataMatrix = [];
  
  for (let cVal = 0; cVal <= 1; cVal += step) {
    for (let rVal = 0; rVal <= 1; rVal += step) {
      const metrics = calculateMetrics(cVal, rVal, corruptionType);
      dataMatrix.push({
        x: parseFloat(cVal.toFixed(2)),
        y: parseFloat(rVal.toFixed(2)),
        v: parseFloat(metrics.H_fair.toFixed(3))
      });
    }
  }
  
  return dataMatrix;
}