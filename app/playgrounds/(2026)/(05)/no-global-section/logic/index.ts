export * from './cases';
export * from './lenses';
export * from './model';
export * from './analysis';

import type { Params, Metrics, AxisValues } from './model';


export interface Snapshot {
    params: Params;
    metrics: Metrics;
    axes: AxisValues;
    label: string;
}
