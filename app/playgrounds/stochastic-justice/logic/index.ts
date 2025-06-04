export function entropy(p: number[]): number {
  return -p.reduce((sum, val) => (val > 0 ? sum + val * Math.log2(val) : sum), 0);
}

export function klDivergence(P: number[], Q: number[]): number {
  return P.reduce((sum, p, i) => (p > 0 && Q[i] > 0 ? sum + p * Math.log2(p / Q[i]) : sum), 0);
}

export function observedDistribution(C: number, R: number): number[] {
  const fair = [0.5, 0.5];
  const corruptBias = [0.5 + 0.45 * C, 0.5 - 0.45 * C];
  const biased = [
    (1 - C) * fair[0] + C * corruptBias[0],
    (1 - C) * fair[1] + C * corruptBias[1]
  ];
  return [
    (1 - R) * biased[0] + R * 0.5,
    (1 - R) * biased[1] + R * 0.5
  ];
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
}

export function calculateMetrics(C: number, R: number): Metrics {
  const P = observedDistribution(C, R);
  const Q = [0.5, 0.5]; // Ideal fair distribution
  const H = entropy(P);
  const D = klDivergence(P, Q);
  const H_fair = H - D;
  const normFairness = 1 - D;
  const biasImpact = H > 0.00001 ? (D / H) : 0;

  return {
    C,
    R,
    P,
    H,
    D,
    H_fair,
    normFairness,
    biasImpact
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

export function generateHeatmapData(step: number = 0.05): Array<{x: number, y: number, v: number}> {
  const dataMatrix = [];
  
  for (let cVal = 0; cVal <= 1; cVal += step) {
    for (let rVal = 0; rVal <= 1; rVal += step) {
      const metrics = calculateMetrics(cVal, rVal);
      dataMatrix.push({
        x: parseFloat(cVal.toFixed(2)),
        y: parseFloat(rVal.toFixed(2)),
        v: parseFloat(metrics.H_fair.toFixed(3))
      });
    }
  }
  
  return dataMatrix;
}