import type { Metadata } from 'next';

import RefractiveComputationPlayground from './playground';



export const metadata: Metadata = {
    title: 'refractive computation · playgrounds',
};

export default function RefractiveComputation() {
    return (
        <RefractiveComputationPlayground />
    );
}
