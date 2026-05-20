export * from './ladder';
export * from './objects';
export * from './model';
export * from './analysis';

import type { Metrics, ObjectState, Params } from './model';

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    field: ObjectState[];
    focal: ObjectState;
    label: string;
}
