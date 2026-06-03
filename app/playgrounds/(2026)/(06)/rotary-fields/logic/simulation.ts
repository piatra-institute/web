import {
    attentionMatrix,
    buildQKBank,
    firstPlaneRelativeAngle,
    frequencyLadder,
    rawScore,
    ropeScore,
    translationDrift,
    type QKBank,
} from './rope';
import { gridInterference, gridCoherence } from './neural';
import type { Params } from './model';


export interface SimResult {
    bank: QKBank;
    freqs: number[];
    attention: number[][];
    grid: number[][];
}


export interface Metrics {
    relativeAngle: number;
    selectedScore: number;
    rawSimilarity: number;
    peakScore: number;
    meanScore: number;
    nearbyMass: number;
    distantMass: number;
    concentration: number;
    contextWidth: number;
    translationDrift: number;
    phaseAdvance: number;
    gridCoherence: number;
}


export interface SimulationOutput extends SimResult {
    metrics: Metrics;
}


function nearbyDistantMass(matrix: number[][]): { nearby: number; distant: number } {
    const n = matrix.length;
    let nearbySum = 0;
    let nearbyCount = 0;
    let distantSum = 0;
    let distantCount = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const d = Math.abs(i - j);
            if (d === 0) continue;
            if (d <= 3) {
                nearbySum += matrix[i][j];
                nearbyCount++;
            } else if (d >= 8) {
                distantSum += matrix[i][j];
                distantCount++;
            }
        }
    }
    return {
        nearby: nearbyCount === 0 ? 0 : nearbySum / nearbyCount,
        distant: distantCount === 0 ? 0 : distantSum / distantCount,
    };
}


/**
 * effective context width along the query row i: distance from i at which the
 * attention score falls below 50 percent of the row's peak. measured in
 * tokens, clipped to seqLen.
 */
function rowContextWidth(matrix: number[][], i: number): number {
    const row = matrix[i];
    const n = row.length;
    const peak = Math.max(...row);
    if (peak <= 0) return n;
    const threshold = peak * 0.5;
    let width = 0;
    for (let d = 0; d < n; d++) {
        const left = i - d >= 0 ? row[i - d] : -Infinity;
        const right = i + d < n ? row[i + d] : -Infinity;
        if (Math.max(left, right) >= threshold) width = d;
        else break;
    }
    return width;
}


export function runSimulation(p: Params): SimulationOutput {
    const bank = buildQKBank(p.seqLen, p.pairs, p.contentSim, p.seed);
    const freqs = frequencyLadder(p.pairs, p.base);
    const matrix = attentionMatrix(bank, freqs);

    const i = Math.max(0, Math.min(p.seqLen - 1, p.tokenI));
    const j = Math.max(0, Math.min(p.seqLen - 1, p.tokenJ));

    let peak = -Infinity;
    let sum = 0;
    let count = 0;
    for (let r = 0; r < p.seqLen; r++) {
        for (let c = 0; c < p.seqLen; c++) {
            const v = matrix[r][c];
            if (v > peak) peak = v;
            sum += v;
            count++;
        }
    }
    const mean = count === 0 ? 0 : sum / count;
    const { nearby, distant } = nearbyDistantMass(matrix);

    // concentration: how much the peak score exceeds the distant baseline.
    // unit query and key vectors give scores in [-1, 1], so peak - distant
    // ranges over [0, 2]; dividing by 2 maps to [0, 1]. clamped for safety.
    const concentration = Math.max(0, Math.min(1, (peak - distant) / 2));
    const contextWidth = rowContextWidth(matrix, i);
    const drift = translationDrift(matrix, 1);
    const phaseAdvance = (p.phaseSlope * (i / Math.max(1, p.seqLen - 1)));

    const N = 60;
    const grid = gridInterference(N, p.gridScale, 0);
    const coh = gridCoherence(grid);

    const metrics: Metrics = {
        relativeAngle: firstPlaneRelativeAngle(bank, freqs, i, j),
        selectedScore: ropeScore(bank, freqs, i, j),
        rawSimilarity: rawScore(bank, i, j),
        peakScore: peak,
        meanScore: mean,
        nearbyMass: nearby,
        distantMass: distant,
        concentration: Math.max(0, Math.min(1, concentration)),
        contextWidth,
        translationDrift: drift,
        phaseAdvance,
        gridCoherence: coh,
    };

    return { bank, freqs, attention: matrix, grid, metrics };
}


export function scoreModel(p: Params): Metrics {
    return runSimulation(p).metrics;
}
