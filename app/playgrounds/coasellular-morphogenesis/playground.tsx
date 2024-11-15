'use client';

import {
    useState,
    useEffect,
} from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';

import Coasellulars from './components/Coasellulars';
import Settings from './components/Settings';



export default function CoasellularMorphogenesisPlayground() {
    const [matrixRows, setMatrixRows] = useState(2);
    const [matrixColumns, setMatrixColumns] = useState(2);
    const [pointsCount, setPointsCount] = useState(12);
    const [points, setPoints] = useState(
        Array.from(
            { length: pointsCount * matrixRows * matrixColumns },
            (_, i) => i
        ),
    );
    const [transactionCost, setTransactionCost] = useState(5);


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

            <div>
                <Input
                    label="transaction cost"
                    value={transactionCost}
                    onChange={(value) => {
                        setTransactionCost(parseInt(value));
                    }}
                />
            </div>

            <div
                className="flex flex-row items-center justify-center"
            >
                <Coasellulars
                    matrixRows={matrixRows}
                    matrixColumns={matrixColumns}

                    points={points}
                    speed={2}
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
