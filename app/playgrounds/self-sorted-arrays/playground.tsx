'use client';

import {
    useRef,
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
    CellData,
    CellMutationStrategy,
} from '@/app/playgrounds/self-sorted-arrays/data';

import {
    randomColor,
    biasedBlueRandomColor,
    biasedLimeRandomColor,
} from '@/app/playgrounds/self-sorted-arrays/logic';

import {
    Tissue,
    Cell as CellEntity,
} from './logic/entities';

import {
    checkInputEvent,
} from '@/logic/utilities';



export default function SelfSortedArraysPlayground() {
    // #region references
    const tissue = useRef(new Tissue(
        (cellID, swapID)  => {
            setSwaps((prev) => ({
                ...prev,
                [cellID]: [
                    ...(prev[cellID] || []),
                    swapID,
                ],
            }));
        }
    ));
    // #endregion references


    // #region state
    const [count, setCount] = useState(0);

    const [minimumValue, setMinimumValue] = useState(0);
    const [maximumValue, setMaximumValue] = useState(100);

    const [proactivePercent, setProactivePercent] = useState(0.9);
    const [passivePercent, setPassivePercent] = useState(0.05);
    const [frozenPercent, setFrozenPercent] = useState(0.05);

    const [bubbleSortPercent, setBubbleSortPercent] = useState(0.8);
    const [insertionSortPercent, setInsertionSortPercent] = useState(0.2);
    const [selectionSortPercent, setSelectionSortPercent] = useState(0);

    const [colorType, setColorType] = useState<'random' | 'blue' | 'lime'>('lime');
    const [showBackground, setShowBackground] = useState(true);

    const [sorting, setSorting] = useState(false);
    const [sorted, setSorted] = useState(false);
    const [distribution, setDistribution] = useState<CellData[]>([]);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);

    const [swaps, setSwaps] = useState<Record<string, string[]>>({});

    const [allowMutationable, setAllowMutationable] = useState(false);
    const [mutationableMinimum, setMutationableMinimum] = useState(0);
    const [mutationableMaximum, setMutationableMaximum] = useState(10);
    const [mutationableStrategy, setMutationableStrategy] = useState<CellMutationStrategy>('random');

    const [allowDamageable, setAllowDamageable] = useState(false);
    const [damageableMinimum, setDamageableMinimum] = useState(0);
    const [damageableMaximum, setDamageableMaximum] = useState(10);
    const [damageablePassiveThreshold, setDamageablePassiveThreshold] = useState(7);
    const [damageableFrozenThreshold, setDamageableFrozenThreshold] = useState(3);

    const [allowConvertible, setAllowConvertible] = useState(false);
    const [convertibleMinimum, setConvertibleMinimum] = useState(0);
    const [convertibleMaximum, setConvertibleMaximum] = useState(10);

    const [allowDivisible, setAllowDivisible] = useState(false);
    const [divisibleMinimum, setDivisibleMinimum] = useState(0);
    const [divisibleMaximum, setDivisibleMaximum] = useState(10);

    const [allowApoptosable, setAllowApoptosable] = useState(false);
    const [apoptosableMinimum, setApoptosableMinimum] = useState(0);
    const [apoptosableMaximum, setApoptosableMaximum] = useState(10);

    const [allowSpeed, setAllowSpeed] = useState(false);
    const [speedMinimum, setSpeedMinimum] = useState(0);
    const [speedMaximum, setSpeedMaximum] = useState(1000);

    const [allowResponsiveness, setAllowResponsiveness] = useState(false);
    const [responsivenessMinimum, setResponsivenessMinimum] = useState(0);
    const [responsivenessMaximum, setResponsivenessMaximum] = useState(1000);
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
        tissue.current.clear();

        if (!count) return;
        if (count < 0) return;
        if (count === 0) return setDistribution([]);

        const computeSwap = () => {
            const random = Math.random();
            if (random < proactivePercent) {
                return 'proactive';
            } else if (random < proactivePercent + passivePercent) {
                return 'passive';
            } else if (random < proactivePercent + passivePercent + frozenPercent) {
                return 'frozen';
            } else {
                return 'proactive';
            }
        }

        const computeAlgotype = () => {
            const random = Math.random();
            if (random < bubbleSortPercent) {
                return 'bubble';
            } else if (random < bubbleSortPercent + insertionSortPercent) {
                return 'insertion';
            } else if (random < bubbleSortPercent + insertionSortPercent + selectionSortPercent) {
                return 'selection';
            } else {
                return 'bubble';
            }
        }

        const distribution: CellData[] = Array.from({ length: count }, () => {
            const value = getRandomNumber();
            const randomAlgotype = computeAlgotype();
            const randomSwap = computeSwap();

            const mutationable = allowMutationable ? integerBetweenLimits(mutationableMaximum, mutationableMinimum) : undefined;
            const mutationStrategy = allowMutationable ? 'random' : undefined;
            const damageable = allowDamageable ? integerBetweenLimits(damageableMaximum, damageableMinimum) : undefined;
            const convertible = allowConvertible ? integerBetweenLimits(convertibleMaximum, convertibleMinimum) : undefined;
            const divisible = allowDivisible ? integerBetweenLimits(divisibleMaximum, divisibleMinimum) : undefined;
            const apoptosable = allowApoptosable ? integerBetweenLimits(apoptosableMaximum, apoptosableMinimum) : undefined;
            const speed = allowSpeed ? integerBetweenLimits(speedMaximum, speedMinimum) : undefined;
            const responsiveness = allowResponsiveness ? integerBetweenLimits(responsivenessMaximum, responsivenessMinimum) : undefined;

            const cell: CellData = {
                id: value + '-' + Math.random().toString(36).slice(2, 7),
                value,
                color: colorType === 'random'
                    ? randomColor()
                    : colorType === 'blue'
                    ? biasedBlueRandomColor(value)
                    : biasedLimeRandomColor(value),
                // algotype: randomAlgotype,
                algotype: 'bubble',
                swap: randomSwap,
                // swap: 'proactive',
                mutationable,
                mutationStrategy,
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
        proactivePercent,
        passivePercent,
        frozenPercent,
        bubbleSortPercent,
        insertionSortPercent,
        selectionSortPercent,
        allowMutationable,
        allowDamageable,
        allowConvertible,
        allowDivisible,
        allowApoptosable,
        allowSpeed,
        allowResponsiveness,

        mutationableMinimum,
        mutationableMaximum,

        damageableMinimum,
        damageableMaximum,

        convertibleMinimum,
        convertibleMaximum,

        divisibleMinimum,
        divisibleMaximum,

        apoptosableMinimum,
        apoptosableMaximum,

        speedMinimum,
        speedMaximum,

        responsivenessMinimum,
        responsivenessMaximum,
    ]);

    const regenerate = () => {
        setSorted(false);
        setSelectedCell(null);
        computeDistribtion(count);
    }

    const step = async () => {
        if (sorted && !sorting) {
            regenerate();
        } else {
            tissue.current.step();
            await new Promise(resolve => setTimeout(resolve, 50));

            setDistribution([...tissue.current.cells.map(cell => ({
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
            } as CellData))]);

            if (tissue.current.atEquilibrium) {
                setSorting(false);
                setSorted(true);
            }
        }
    }

    const loop = async () => {
        if (sorted && !sorting && tissue.current.atEquilibrium) {
            clearTissue();
            regenerate();
            return;
        }

        setSorting(true);

        while (!tissue.current.atEquilibrium) {
            await step();
            await new Promise(resolve => setTimeout(resolve, 350));
        }
    }

    const clearTissue = () => {
        tissue.current.clear();
    }
    // #endregion handlers


    // #region effects
    /** Random count */
    useEffect(() => {
        const randomCount = 7 + Math.floor(Math.random() * 40);
        // const randomCount = 5;
        setCount(randomCount);

        computeDistribtion(randomCount);
    }, [
        computeDistribtion,
    ]);

    /** Recompute distribution */
    useEffect(() => {
        setSorted(false);
        setSelectedCell(null);
        computeDistribtion(count);
    }, [
        count,
        computeDistribtion,
    ]);

    /** Handle selected cell */
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const isInputEvent = checkInputEvent(event);
            if (isInputEvent) {
                return;
            }

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

    /** Handle Tissue */
    useEffect(() => {
        const options = {
            minimumValue,
            maximumValue,

            mutationableMinimum,
            mutationableMaximum,
            mutationableStrategy,

            damageableMinimum,
            damageableMaximum,
            damageablePassiveThreshold,
            damageableFrozenThreshold,

            convertibleMinimum,
            convertibleMaximum,

            divisibleMinimum,
            divisibleMaximum,

            apoptosableMinimum,
            apoptosableMaximum,

            speedMinimum,
            speedMaximum,

            responsivenessMinimum,
            responsivenessMaximum,
        };

        for (let i = 0; i < distribution.length; i++) {
            tissue.current.addCell(new CellEntity(
                {
                    ...distribution[i],
                },
                options,
            ));
        }
    }, [
        distribution,

        minimumValue,
        maximumValue,

        mutationableMinimum,
        mutationableMaximum,
        mutationableStrategy,

        damageableMinimum,
        damageableMaximum,
        damageablePassiveThreshold,
        damageableFrozenThreshold,

        convertibleMinimum,
        convertibleMaximum,

        divisibleMinimum,
        divisibleMaximum,

        apoptosableMinimum,
        apoptosableMaximum,

        speedMinimum,
        speedMaximum,

        responsivenessMinimum,
        responsivenessMaximum,
    ]);
    // #endregion effects


    // #region render
    return (
        <div
            className="relative min-h-screen flex items-center justify-center bg-contain bg-no-repeat bg-center"
            style={{
                backgroundImage: showBackground ? "url('/playgrounds-ssa-logo.png')" : '',
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
                setDistribution={setDistribution}

                setCount={setCount}

                selectedCell={selectedCell}

                colorType={colorType}
                setColorType={setColorType}
                showBackground={showBackground}
                setShowBackground={setShowBackground}

                minimumValue={minimumValue}
                setMinimumValue={setMinimumValue}
                maximumValue={maximumValue}
                setMaximumValue={setMaximumValue}

                proactivePercent={proactivePercent}
                setProactivePercent={setProactivePercent}
                passivePercent={passivePercent}
                setPassivePercent={setPassivePercent}
                frozenPercent={frozenPercent}
                setFrozenPercent={setFrozenPercent}

                bubbleSortPercent={bubbleSortPercent}
                setBubbleSortPercent={setBubbleSortPercent}
                insertionSortPercent={insertionSortPercent}
                setInsertionSortPercent={setInsertionSortPercent}
                selectionSortPercent={selectionSortPercent}
                setSelectionSortPercent={setSelectionSortPercent}

                allowMutationable={allowMutationable}
                setAllowMutationable={setAllowMutationable}
                mutationableMinimum={mutationableMinimum}
                setMutationableMinimum={setMutationableMinimum}
                mutationableMaximum={mutationableMaximum}
                setMutationableMaximum={setMutationableMaximum}
                mutationableStrategy={mutationableStrategy}
                setMutationableStrategy={setMutationableStrategy}

                allowDamageable={allowDamageable}
                setAllowDamageable={setAllowDamageable}
                damageableMinimum={damageableMinimum}
                setDamageableMinimum={setDamageableMinimum}
                damageableMaximum={damageableMaximum}
                setDamageableMaximum={setDamageableMaximum}
                damageablePassiveThreshold={damageablePassiveThreshold}
                setDamageablePassiveThreshold={setDamageablePassiveThreshold}
                damageableFrozenThreshold={damageableFrozenThreshold}
                setDamageableFrozenThreshold={setDamageableFrozenThreshold}

                allowConvertible={allowConvertible}
                setAllowConvertible={setAllowConvertible}
                convertibleMinimum={convertibleMinimum}
                setConvertibleMinimum={setConvertibleMinimum}
                convertibleMaximum={convertibleMaximum}
                setConvertibleMaximum={setConvertibleMaximum}

                allowDivisible={allowDivisible}
                setAllowDivisible={setAllowDivisible}
                divisibleMinimum={divisibleMinimum}
                setDivisibleMinimum={setDivisibleMinimum}
                divisibleMaximum={divisibleMaximum}
                setDivisibleMaximum={setDivisibleMaximum}

                allowApoptosable={allowApoptosable}
                setAllowApoptosable={setAllowApoptosable}
                apoptosableMinimum={apoptosableMinimum}
                setApoptosableMinimum={setApoptosableMinimum}
                apoptosableMaximum={apoptosableMaximum}
                setApoptosableMaximum={setApoptosableMaximum}

                allowSpeed={allowSpeed}
                setAllowSpeed={setAllowSpeed}
                speedMinimum={speedMinimum}
                setSpeedMinimum={setSpeedMinimum}
                speedMaximum={speedMaximum}
                setSpeedMaximum={setSpeedMaximum}

                allowResponsiveness={allowResponsiveness}
                setAllowResponsiveness={setAllowResponsiveness}
                responsivenessMinimum={responsivenessMinimum}
                setResponsivenessMinimum={setResponsivenessMinimum}
                responsivenessMaximum={responsivenessMaximum}
                setResponsivenessMaximum={setResponsivenessMaximum}

                clearTissue={clearTissue}
            />

            <div
                className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
            >
                <Header />

                <Title
                    text="self-sorted arrays playground"
                />

                <Input
                    value={count}
                    onChange={(value) => {
                        const count = parseInt(value);
                        if (isNaN(count)) {
                            setCount('' as any);
                            return;
                        }

                        if (count <= 0 || count > 999) {
                            return;
                        }

                        setCount(count);
                    }}
                    placeholder="enter a number around 40"
                    type="number"
                    min={0}
                    max={999}
                    centered={true}
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

                {count > 0 ? (
                    <Button
                        label={'Loop'}
                        onClick={() => {
                            loop();
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
