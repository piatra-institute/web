export * from './kerr';
export * from './cases';
export * from './model';
export * from './analysis';

import type { Metrics, Params } from './model';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    roots: number[];
    label: string;
}
