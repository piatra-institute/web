import type { Metadata } from 'next';

import VoteNoPlayground from './playground';



export const metadata: Metadata = {
    title: 'vote no · playgrounds',
};

export default function VoteNo() {
    return (
        <VoteNoPlayground />
    );
}
