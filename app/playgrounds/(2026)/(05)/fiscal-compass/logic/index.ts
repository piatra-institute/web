export * from './model';
export * from './authors';
export * from './analysis';

import { Params, Metrics } from './model';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}
