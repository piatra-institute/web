import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import CrystallographicGroupsPlayground from './playground';

export const metadata: Metadata = {
    title: 'crystallographic groups · playgrounds',
    description: 'Interactive exploration of 2D wallpaper groups, 3D space groups, and 4D crystallographic symmetries',

    openGraph: {
        ...defaultOpenGraph,
        title: 'crystallographic groups · playgrounds · piatra.institute',
        description: 'Interactive exploration of 2D wallpaper groups, 3D space groups, and 4D crystallographic symmetries',
    },
};

export default function Page() {
    return <CrystallographicGroupsPlayground />;
}
