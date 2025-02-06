'use client';

import Header from '@/components/Header';
import Title from '@/components/Title';

import Board from './components/Board';



export default function FracqunxPlayground() {
    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <Header />

            <Title
                text="fracqunx"
            />

            <Board />
        </div>
    );
}
