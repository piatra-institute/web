import type { Metadata } from 'next';

import PlatformsList from './PlatformsList';


export const metadata: Metadata = {
    title: 'platforms',
};


export default function Platforms() {
    return <PlatformsList />;
}
