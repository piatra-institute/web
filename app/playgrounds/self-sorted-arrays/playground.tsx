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

import {
    integerBetweenLimits,
} from '@/logic/utilities';

import CellsChart1D from '@/app/playgrounds/self-sorted-arrays/components/CellsChart1D';
import CellViewer from '@/app/playgrounds/self-sorted-arrays/components/CellViewer';
import Settings from '@/app/playgrounds/self-sorted-arrays/components/Settings';

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

import {
    Tissue,
    Cell as CellEntity,
} from './logic/entities';




export default function SelfSortedArraysPlayground() {
    // #region state
    const [minimumValue, setMinimumValue] = useState(0);
    const [maximumValue, setMaximumValue] = useState(100);
    const [count, setCount] = useState(0);
    const [proactiveLevel, setProactiveLevel] = useState(0.8);
    const [availableAlgotypes, setAvailableAlgotypes] = useState([
        ...algotypes,
    ]);

    const [colorType, setColorType] = useState<'random' | 'blue' | 'lime'>('lime');
    const [sorting, setSorting] = useState(false);
    const [sorted, setSorted] = useState(false);
    const [distribution, setDistribution] = useState<Cell[]>([]);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);

    const [tissue, setTissue] = useState<Tissue>(new Tissue());
    const [swaps, setSwaps] = useState<Record<string, string[]>>({});

    const [allowMutationable, setAllowMutationable] = useState(false);
    const [allowDamageable, setAllowDamageable] = useState(false);
    const [allowConvertible, setAllowConvertible] = useState(false);
    const [allowDivisible, setAllowDivisible] = useState(false);
    const [allowApoptosable, setAllowApoptosable] = useState(false);
    const [allowSpeed, setAllowSpeed] = useState(false);
    const [allowResponsiveness, setAllowResponsiveness] = useState(false);
    // #endregion state


    // #region handlers
    const getRandomNumber = useCallback(() => {
        return Math.floor(
            Math.random() * (maximumValue - minimumValue + 1)
        ) + minimumValue;
    }, [
        maximumValue,
        minimumValue,
    ]);

    const computeDistribtion = useCallback((
        count: number,
    ) => {
        if (count < 0) return;
        if (count === 0) return setDistribution([]);

        const distribution: Cell[] = Array.from({ length: count }, () => {
            const value = getRandomNumber();
            const randomAlgotype = availableAlgotypes[
                Math.floor(Math.random() * algotypes.length)
            ];
            const randomSwap = swap[
                Math.random() < proactiveLevel ? 2 : Math.floor(Math.random() * 2)
            ];

            const mutationable = integerBetweenLimits(10);
            const damageable = integerBetweenLimits(10);
            const convertible = integerBetweenLimits(10);
            const divisible = integerBetweenLimits(10);
            const apoptosable = integerBetweenLimits(10);
            const speed = integerBetweenLimits(1000);
            const responsiveness = integerBetweenLimits(1000);

            const cell: Cell = {
                id: value + '-' + Math.random().toString(36).slice(2, 7),
                value,
                color: colorType === 'random'
                    ? biasedRandomColor()
                    : colorType === 'blue'
                    ? biasedBlueRandomColor(value)
                    : biasedLimeRandomColor(value),
                // algotype: randomAlgotype,
                swap: randomSwap,
                algotype: 'bubble',
                // swap: 'proactive',
                mutationable,
                mutationStrategy: 'random',
                damageable,
                convertible,
                divisible,
                apoptosable,
                speed,
                responsiveness,
            };

            return cell;
        });
        setDistribution(distribution);
    }, [
        colorType,
        getRandomNumber,
        availableAlgotypes,
        proactiveLevel,
    ]);

    const step = async () => {
        if (sorted && !sorting) {
            setSorted(false);
            setSelectedCell(null);
            computeDistribtion(count);
        } else {
            // setSorting(true);
            // setSorted(false);

            tissue.step();

            if (tissue.atEquilibrium) {
                setSorted(true);
                return;
            }

            setDistribution([...tissue.cells.map(cell => ({
                id: cell.id,
                value: cell.value,
                color: cell.color,
                algotype: cell.algotype,
                swap: cell.swap,
                damageable: cell.damageable,
                convertible: cell.convertible,
                divisible: cell.divisible,
                apoptosable: cell.apoptosable,
                speed: cell.speed,
                responsiveness: cell.responsiveness,
            } as Cell))]);

            // setSorting(false);
            // setSorted(true);
        }
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        const randomCount = 7 + Math.floor(Math.random() * 40);
        // const randomCount = 5;
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

    useEffect(() => {
        const tissue = new Tissue(
            (cellID, swapID)  => {
                setSwaps((prev) => ({
                    ...prev,
                    [cellID]: [
                        ...(prev[cellID] || []),
                        swapID,
                    ],
                }));
            }
        );

        for (let i = 0; i < distribution.length; i++) {
            tissue.addCell(new CellEntity(
                distribution[i].id,
                distribution[i].value,
                distribution[i].color,
                distribution[i].algotype,
                distribution[i].swap,
                distribution[i].damageable,
                distribution[i].convertible,
                distribution[i].divisible,
                distribution[i].apoptosable,
                distribution[i].speed,
                distribution[i].responsiveness,
            ));
        }
        setTissue(tissue);
    }, [
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
                    swaps={swaps[selectedCell] || []}
                    distribution={distribution}
                    close={() => {
                        setSelectedCell(null);
                    }}
                />
            )}

            <Settings
                distribution={distribution}

                colorType={colorType}
                setColorType={setColorType}
                selectedCell={selectedCell}

                minimumValue={minimumValue}
                setMinimumValue={setMinimumValue}
                maximumValue={maximumValue}
                setMaximumValue={setMaximumValue}
                proactiveLevel={proactiveLevel}
                setProactiveLevel={setProactiveLevel}
                availableAlgotypes={availableAlgotypes}
                setAvailableAlgotypes={setAvailableAlgotypes}

                allowMutationable={allowMutationable}
                setAllowMutationable={setAllowMutationable}
                allowDamageable={allowDamageable}
                setAllowDamageable={setAllowDamageable}
                allowConvertible={allowConvertible}
                setAllowConvertible={setAllowConvertible}
                allowDivisible={allowDivisible}
                setAllowDivisible={setAllowDivisible}
                allowApoptosable={allowApoptosable}
                setAllowApoptosable={setAllowApoptosable}
                allowSpeed={allowSpeed}
                setAllowSpeed={setAllowSpeed}
                allowResponsiveness={allowResponsiveness}
                setAllowResponsiveness={setAllowResponsiveness}
            />

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

                <CellsChart1D
                    data={distribution}
                    selectedCell={selectedCell}
                    setSelectedCell={setSelectedCell}
                />

                {count > 0 ? (
                    <Button
                        label={sorted && !sorting
                            ? 'Regenerate'
                            : sorting ? "stepping..." : 'Step'}
                        onClick={() => {
                            step();
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
