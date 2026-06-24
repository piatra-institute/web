'use client';

import {
    useState,
    useEffect,
} from 'react';

import dynamic from 'next/dynamic';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Input from '@/components/Input';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';

import Settings from './components/Settings';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



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


    const calibration = buildCalibration();


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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The Coase theorem, applied to cells</h3>
                        <p className="leading-relaxed text-sm">
                            Coasellular morphogenesis applies the Coase theorem from economics to
                            biological development. Named after economist Ronald Coase, the theorem
                            says that under well-defined rights and low transaction costs, parties
                            can bargain their way to an efficient allocation regardless of who holds
                            the rights to begin with.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Cells as bargaining agents</h3>
                        <p className="leading-relaxed text-sm">
                            Here each cell acts as an economic agent that negotiates its morphological
                            state through transactions with its neighbours. A transaction moves one
                            unit of endowment from one cell to the next, so the total value across the
                            tissue is conserved; bargaining only reallocates. Each cell maintains an
                            energy budget for transactions and uses its neighbours as distributed
                            memory, and the running friction of bargaining shapes the emergent pattern.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 mb-2">
                            Two structural facts hold for every run: value is conserved across the
                            grid, and every transaction spends energy proportional to the transaction
                            cost. These are the conservation and friction halves of Coase&apos;s argument,
                            and both are checked exactly in the calibration panel below.
                        </p>
                    </div>

                    <VersionSelector versions={versions} active="claude-v1" />

                    <CalibrationPanel results={calibration} outputLabel="coasean invariants" />

                    <AssumptionPanel assumptions={assumptions} />

                    <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/coasellular-morphogenesis/research"
        />
    );
}
