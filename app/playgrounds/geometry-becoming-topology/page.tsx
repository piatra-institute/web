import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import GeometryBecomingTopologyPlayground from './playground';



export const metadata: Metadata = {
    title: 'geometry becoming topology · playgrounds',
    description: 'exploring the transformation from geometric to topological properties',

    openGraph: {
        ...defaultOpenGraph,
        title: 'geometry becoming topology · playgrounds · piatra.institute',
        description: 'exploring the transformation from geometric to topological properties',
    },
};

export default function GeometryBecomingTopology() {
    return (
        <GeometryBecomingTopologyPlayground />
    );
}
