import type { Metadata } from 'next';

import SelfSortedArraysPlayground from './playground';



export const metadata: Metadata = {
    title: 'self-sorted arrays · playgrounds',
};

export default function SelfSortedArrays() {
    return (
        <SelfSortedArraysPlayground />
    );
}
