export * from './simulation';
export * from './scenarios';
export * from './model';
export * from './analysis';

import type { Metrics, Params } from './model';
import type { SimResult } from './simulation';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    result: SimResult;
    label: string;
}
