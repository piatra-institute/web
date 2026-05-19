export * from './cases';
export * from './stages';
export * from './model';
export * from './analysis';

import type { AxisValues, Metrics, Params } from './model';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    axes: AxisValues;
    label: string;
}
