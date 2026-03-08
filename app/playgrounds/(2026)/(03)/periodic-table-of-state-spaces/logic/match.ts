import type { DimensionScores, StateSpace, DimensionKey } from './index';
import { DIMENSION_KEYS } from './index';

export function matchScore(profile: DimensionScores, space: StateSpace): number {
    let sumSq = 0;
    for (const key of DIMENSION_KEYS) {
        const diff = profile[key] - space.scores[key];
        sumSq += diff * diff;
    }
    return Math.sqrt(sumSq);
}

export function rankSpaces(
    profile: DimensionScores,
    spaces: StateSpace[],
): { space: StateSpace; score: number; rank: number }[] {
    const scored = spaces.map((space) => ({
        space,
        score: matchScore(profile, space),
        rank: 0,
    }));
    scored.sort((a, b) => a.score - b.score);
    scored.forEach((item, i) => { item.rank = i + 1; });
    return scored;
}

export function maxDistance(dimensions: number): number {
    return Math.sqrt(dimensions * 16); // max diff per dim is 4, 4^2 = 16
}

export function similarityPercent(distance: number): number {
    const max = maxDistance(DIMENSION_KEYS.length);
    return Math.max(0, Math.round((1 - distance / max) * 100));
}
