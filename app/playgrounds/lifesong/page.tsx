import type { Metadata } from 'next';

import LifesongPlayground from './playground';



export const metadata: Metadata = {
    title: 'lifesong · playgrounds',
};

export default function Lifesong() {
    return (
        <LifesongPlayground />
    );
}
