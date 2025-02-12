'use client';

import Header from '@/components/Header';
import Title from '@/components/Title';

// import Board from './components/Board';
import Board from './components/BoardRapier';



export default function FracqunxPlayground() {
    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <div
                className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
            >
                <div
                    className="flex justify-center"
                >
                    <Header />
                </div>

                <Title
                    text="fracqunx"
                />
            </div>

            <Board />
        </div>
    );
}
