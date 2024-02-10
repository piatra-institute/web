'use client';

import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';
import Button from '@/components/Button';

import CellsChart2D from '@/app/playgrounds/self-sorted-arrays/components/CellsChart2D';
import CellViewer from '@/app/playgrounds/self-sorted-arrays/components/CellViewer';

import {
    Cell,
    algotypes,
    swap,
} from '@/app/playgrounds/self-sorted-arrays/data';

import {
    biasedRandomColor,
    biasedBlueRandomColor,
    biasedLimeRandomColor,
} from '@/app/playgrounds/self-sorted-arrays/logic';



export default function SelfSortedArraysPlayground() {
    // #region state
    const [colorType, setColorType] = useState<'random' | 'blue' | 'lime'>('lime');
    const [count, setCount] = useState(0);
    const [sorting, setSorting] = useState(false);
    const [sorted, setSorted] = useState(false);
    const [distribution, setDistribution] = useState<Cell[]>([]);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    // #endregion state


    // #region handlers
    const computeDistribtion = useCallback((
        count: number,
    ) => {
        if (count < 0) return;
        if (count === 0) return setDistribution([]);

        const distribution: Cell[] = Array.from({ length: count }, () => {
            const value = Math.floor(Math.random() * 100);
            const randomAlgotype = algotypes[
                Math.floor(Math.random() * algotypes.length)
            ];
            const proactiveLevel = 0.8;
            const randomSwap = swap[
                Math.random() < proactiveLevel ? 2 : Math.floor(Math.random() * 2)
            ];

            return {
                id: Math.random().toString(36),
                value,
                color: colorType === 'random'
                    ? biasedRandomColor()
                    : colorType === 'blue'
                    ? biasedBlueRandomColor(value)
                    : biasedLimeRandomColor(value),
                algotype: randomAlgotype,
                swap: randomSwap,
            };
        });
        setDistribution(distribution);
    }, [
        colorType,
    ]);

    const sort = async () => {
        setSorting(true);
        setSorted(false);

        const sortedDistribution = [...distribution];
        for (let i = 0; i < sortedDistribution.length; i++) {
            for (let j = 0; j < sortedDistribution.length - 1; j++) {
                if (sortedDistribution[j].value > sortedDistribution[j + 1].value) {
                    const temp = sortedDistribution[j];
                    sortedDistribution[j] = sortedDistribution[j + 1];
                    sortedDistribution[j + 1] = temp;

                    setDistribution([...sortedDistribution]);

                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }

        setSorting(false);
        setSorted(true);
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        const randomCount = 7 + Math.floor(Math.random() * 40);
        setCount(randomCount);

        computeDistribtion(randomCount);
    }, [
        computeDistribtion,
    ]);

    useEffect(() => {
        setSorted(false);
        setSelectedCell(null);
        computeDistribtion(count);
    }, [
        count,
        computeDistribtion,
    ]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                setSelectedCell(null);
                return;
            }

            if (event.key === 'ArrowLeft') {
                const index = distribution.findIndex(cell => cell.id === selectedCell);
                if (index > 0) {
                    setSelectedCell(distribution[index - 1].id);
                } else {
                    setSelectedCell(distribution[distribution.length - 1].id);
                }
            } else if (event.key === 'ArrowRight') {
                const index = distribution.findIndex(cell => cell.id === selectedCell);
                if (index < distribution.length - 1) {
                    setSelectedCell(distribution[index + 1].id);
                } else {
                    setSelectedCell(distribution[0].id);
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [
        selectedCell,
        distribution,
    ]);
    // #endregion effects


    // #region render
    return (
        <div
            className="relative min-h-screen flex items-center justify-center bg-contain bg-no-repeat bg-center"
            style={{
                backgroundImage: "url('/playgrounds-ssa-logo.png')",
            }}
        >
            <div className="absolute inset-0 bg-black opacity-85" />

            {selectedCell && (
                <CellViewer
                    data={distribution.find(cell => cell.id === selectedCell)!}
                    close={() => {
                        setSelectedCell(null);
                    }}
                />
            )}

            <div className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2">
                <Header />

                <Title
                    text="self-sorted arrays playground"
                />

                <Input
                    value={count}
                    onChange={(value) => {
                        const count = parseInt(value);
                        if (count < 0 || count > 999) {
                            return;
                        }

                        setCount(parseInt(value));
                    }}
                    type="number"
                    placeholder="enter a number around 40"
                    min={0}
                    max={999}
                />

                <CellsChart2D
                    data={distribution}
                    selectedCell={selectedCell}
                    setSelectedCell={setSelectedCell}
                />

                {count > 0 ? (
                    <Button
                        label={sorted && !sorting
                            ? 'Regenerate'
                            : sorting ? "sorting..." : 'Sort'}
                        onClick={() => {
                            if (sorted && !sorting) {
                                setSorted(false);
                                setSelectedCell(null);
                                computeDistribtion(count);
                            } else {
                                sort();
                            }
                        }}
                        disabled={sorting}
                    />
                ) : (
                    <div
                        style={{
                            height: '80px',
                        }}
                    />
                )}

                <div
                    className="h-[100px]"
                />
            </div>
        </div>
    );
    // #endregion render
}
