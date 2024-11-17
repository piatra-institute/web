'use client';

import {
    useState,
    useEffect,
} from 'react';

import dynamic from 'next/dynamic';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';

import Settings from './components/Settings';



const DynamicCoasellulars = dynamic(
    () => import('./components/Coasellulars'), {
        ssr: false,
    },
);


export default function CoasellularMorphogenesisPlayground() {
    const [matrixRows, setMatrixRows] = useState(1);
    const [matrixColumns, setMatrixColumns] = useState(2);
    const [pointsCount, setPointsCount] = useState(4);
    const [points, setPoints] = useState(
        Array.from(
            { length: pointsCount * matrixRows * matrixColumns },
            (_, i) => i
        ),
    );
    const [transactionCost, setTransactionCost] = useState(5);
    const [speed, setSpeed] = useState(3);


    useEffect(() => {
        setPoints(
            Array.from(
                { length: pointsCount * matrixRows * matrixColumns },
                (_, i) => i
            ),
        );
    }, [
        matrixRows,
        matrixColumns,
        pointsCount,
    ]);


    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <Header />

            <Title
                text="coasellular morphogenesis"
            />

            <div
                className="max-w-80 mb-6 text-center"
            >
                <p>
                    bioelectric and cellular agents interactions and negotiations based on Coasean transaction costs
                </p>

                <p>
                    each circle has energy for transactions and uses the others as memory; as they spin, each circle observe external states and infer prior states, negotiating to restore or are convinced to adopt the other&apos;s state
                </p>
            </div>

            <div
                className="mb-8"
            >
                <Input
                    label="transaction cost"
                    value={transactionCost}
                    onChange={(value) => {
                        setTransactionCost(parseInt(value));
                    }}
                    inputMode="numeric"
                    type="number"
                />

                <Input
                    label="speed"
                    value={speed}
                    onChange={(value) => {
                        setSpeed(parseInt(value));
                    }}
                    inputMode="numeric"
                    type="number"
                />
            </div>

            <div
                className="grid items-center justify-center"
            >
                <DynamicCoasellulars
                    matrixRows={matrixRows}
                    matrixColumns={matrixColumns}

                    points={points}
                    speed={speed}
                />
            </div>

            <div
                className="min-h-[100px]"
            />

            <Settings
                matrixRows={matrixRows}
                setMatrixRows={setMatrixRows}

                matrixColumns={matrixColumns}
                setMatrixColumns={setMatrixColumns}

                pointsCount={pointsCount}
                setPointsCount={setPointsCount}
            />
        </div>
    );
}
