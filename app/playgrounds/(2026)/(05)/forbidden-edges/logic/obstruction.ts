import type { Metrics } from './metrics';
import type { Pressures } from './index';
import { MORAL_FRAMES, FrameKey } from './frames';
import { ACTIONS, ActionKey } from './actions';

export interface FrameRating {
    frame: FrameKey;
    rating: number;
}

export interface ActionRatingRow {
    action: ActionKey;
    actionLabel: string;
    ratings: FrameRating[];
    consistencyRadius: number;
    spread: number;
    meanRating: number;
}

/**
 * For each action, evaluate the rating under each frame and return the row
 * along with sheaf-style consistency statistics:
 *
 *   meanRating: average rating across frames
 *   spread: max - min (range of disagreement)
 *   consistencyRadius: standard deviation of ratings (Robinson-style metric)
 */
export function obstructionMatrix(state: Metrics, p: Pressures): ActionRatingRow[] {
    return ACTIONS.map((action) => {
        const ratings: FrameRating[] = MORAL_FRAMES.map((f) => ({
            frame: f.key,
            rating: f.rate(action.key, state, p),
        }));
        const values = ratings.map((r) => r.rating);
        const mean = values.reduce((a, v) => a + v, 0) / values.length;
        const variance =
            values.reduce((a, v) => a + (v - mean) * (v - mean), 0) / values.length;
        const consistencyRadius = Math.sqrt(variance);
        const spread = Math.max(...values) - Math.min(...values);
        return {
            action: action.key,
            actionLabel: action.label,
            ratings,
            consistencyRadius,
            spread,
            meanRating: mean,
        };
    });
}

/**
 * Average obstruction across all actions, a global "how much do the frames
 * disagree?" indicator that fluctuates with the state and pressures.
 */
export function averageObstruction(rows: ActionRatingRow[]): number {
    if (rows.length === 0) return 0;
    return rows.reduce((a, r) => a + r.consistencyRadius, 0) / rows.length;
}
