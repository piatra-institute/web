import { Metadata } from 'next';
import CrystallographicGroupsPlayground from './playground';

export const metadata: Metadata = {
    title: 'crystallographic groups · playgrounds',
    description: 'Interactive exploration of 2D wallpaper groups, 3D space groups, and 4D crystallographic symmetries',
    openGraph: {
        title: 'crystallographic groups · playgrounds',
        description: 'Interactive exploration of 2D wallpaper groups, 3D space groups, and 4D crystallographic symmetries',
        type: 'website',
    },
};

export default function CrystallographicGroups() {
    return <CrystallographicGroupsPlayground />;
}