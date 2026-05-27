export * from './simulation';
export * from './scenarios';
export * from './model';
export * from './analysis';

import type { Metrics, Params } from './model';
import type { DetectedBand, SimEvent, SimRow } from './simulation';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    rows: SimRow[];
    events: SimEvent[];
    bands: DetectedBand[];
    label: string;
}
