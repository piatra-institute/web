'use client';

import {
    useState,
    useEffect,
} from 'react';

import dynamic from 'next/dynamic';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Input from '@/components/Input';

import Settings from './components/Settings';



const DynamicCoasellulars = dynamic(
    () => import('./components/Coasellulars'), {
        ssr: false,
    },
);


export default function CoasellularMorphogenesisPlayground() {
    const [matrixRows, setMatrixRows] = useState(2);
    const [matrixColumns, setMatrixColumns] = useState(2);
    const [pointsCount, setPointsCount] = useState(8);
    const [points, setPoints] = useState(
        Array.from(
            { length: pointsCount * matrixRows * matrixColumns },
            (_, i) => i
        ),
    );
    const [transactionCost, setTransactionCost] = useState(2);
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


    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Bioelectric cellular agents negotiating through Coasean transaction costs
                    </p>
                    <p className="text-gray-400">
                        Explore how cellular morphogenesis might emerge through economic principles, 
                        where individual cells act as agents negotiating their states through 
                        transaction costs and collective memory.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer
                    controls={
                        <div className="flex gap-4">
                            <Input
                                label="transaction cost"
                                value={transactionCost}
                                onChange={(value) => {
                                    setTransactionCost(parseInt(value));
                                }}
                                inputMode="numeric"
                                type="number"
                                compact={true}
                            />
                            <Input
                                label="speed"
                                value={speed}
                                onChange={(value) => {
                                    setSpeed(parseInt(value));
                                }}
                                inputMode="numeric"
                                type="number"
                                compact={true}
                            />
                        </div>
                    }
                >
                    <div className="grid items-center justify-center">
                        <DynamicCoasellulars
                            matrixRows={matrixRows}
                            matrixColumns={matrixColumns}
                            points={points}
                            speed={speed}
                            transactionCost={transactionCost}
                        />
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            Coasellular morphogenesis applies the Coase theorem from economics to 
                            biological development. Named after economist Ronald Coase, this theorem 
                            suggests that under certain conditions, parties can negotiate solutions 
                            to externality problems regardless of initial property rights.
                        </p>
                        <p>
                            In this biological context, individual cells act as economic agents 
                            that negotiate their morphological states through transaction costs. 
                            Each cell maintains energy for transactions and uses neighboring cells 
                            as distributed memory, creating emergent developmental patterns.
                        </p>
                        <p>
                            Key concepts include: Coase theorem, transaction cost economics, 
                            cellular automata, distributed cognition, bioelectric signaling, 
                            and the economics of morphogenesis.
                        </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            matrixRows={matrixRows}
            setMatrixRows={setMatrixRows}
            matrixColumns={matrixColumns}
            setMatrixColumns={setMatrixColumns}
            pointsCount={pointsCount}
            setPointsCount={setPointsCount}
        />
    );

    return (
        <PlaygroundLayout
            title="Coasellular Morphogenesis"
            subtitle="Bioelectric Negotiation Through Transaction Costs"
            sections={sections}
            settings={settings}
        />
    );
}
