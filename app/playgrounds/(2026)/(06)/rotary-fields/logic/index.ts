export * from './rope';
export * from './neural';
export * from './model';
export * from './scenarios';
export * from './simulation';
export * from './analysis';

import type { Params } from './model';
import type { Metrics, SimResult } from './simulation';


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    result: SimResult;
    label: string;
}
