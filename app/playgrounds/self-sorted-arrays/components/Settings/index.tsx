import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import {
    closeIcon,
    settingsIcon,
} from '@/data/icons';

import {
    focusStyle,
} from '@/data/styles';

import {
    defocus,
} from '@/logic/utilities';

import Toggle from '@/components/Toggle';
import Input from '@/components/Input';
import Dropdown from '@/components/Dropdown';

import {
    Cell,
    Algotype,
} from '@/app/playgrounds/self-sorted-arrays/data';



export default function Settings({
    distribution,
    selectedCell,

    colorType,
    setColorType,
    showBackground,
    setShowBackground,

    minimumValue,
    setMinimumValue,
    maximumValue,
    setMaximumValue,

    proactivePercent,
    setProactivePercent,
    passivePercent,
    setPassivePercent,
    frozenPercent,
    setFrozenPercent,

    bubbleSortPercent,
    setBubbleSortPercent,
    insertionSortPercent,
    setInsertionSortPercent,
    selectionSortPercent,
    setSelectionSortPercent,

    availableAlgotypes,
    setAvailableAlgotypes,

    allowMutationable,
    setAllowMutationable,
    mutationableMinimum,
    setMutationableMinimum,
    mutationableMaximum,
    setMutationableMaximum,
    mutationableStrategy,
    setMutationableStrategy,

    allowDamageable,
    setAllowDamageable,
    damageableMinimum,
    setDamageableMinimum,
    damageableMaximum,
    setDamageableMaximum,
    damageablePassiveThreshold,
    setDamageablePassiveThreshold,
    damageableFrozenThreshold,
    setDamageableFrozenThreshold,

    allowConvertible,
    setAllowConvertible,
    convertibleMinimum,
    setConvertibleMinimum,
    convertibleMaximum,
    setConvertibleMaximum,

    allowDivisible,
    setAllowDivisible,
    divisibleMinimum,
    setDivisibleMinimum,
    divisibleMaximum,
    setDivisibleMaximum,

    allowApoptosable,
    setAllowApoptosable,
    apoptosableMinimum,
    setApoptosableMinimum,
    apoptosableMaximum,
    setApoptosableMaximum,

    allowSpeed,
    setAllowSpeed,
    speedMinimum,
    setSpeedMinimum,
    speedMaximum,
    setSpeedMaximum,

    allowResponsiveness,
    setAllowResponsiveness,
    responsivenessMinimum,
    setResponsivenessMinimum,
    responsivenessMaximum,
    setResponsivenessMaximum,
} : {
    distribution: Cell[];
    selectedCell: string | null;

    colorType: 'random' | 'blue' | 'lime';
    setColorType: React.Dispatch<React.SetStateAction<'random' | 'blue' | 'lime'>>;
    showBackground: boolean;
    setShowBackground: React.Dispatch<React.SetStateAction<boolean>>;

    minimumValue: number;
    setMinimumValue: React.Dispatch<React.SetStateAction<number>>;
    maximumValue: number;
    setMaximumValue: React.Dispatch<React.SetStateAction<number>>;

    proactivePercent: number;
    setProactivePercent: React.Dispatch<React.SetStateAction<number>>;
    passivePercent: number;
    setPassivePercent: React.Dispatch<React.SetStateAction<number>>;
    frozenPercent: number;
    setFrozenPercent: React.Dispatch<React.SetStateAction<number>>;

    bubbleSortPercent: number;
    setBubbleSortPercent: React.Dispatch<React.SetStateAction<number>>;
    insertionSortPercent: number;
    setInsertionSortPercent: React.Dispatch<React.SetStateAction<number>>;
    selectionSortPercent: number;
    setSelectionSortPercent: React.Dispatch<React.SetStateAction<number>>;

    availableAlgotypes: Algotype[];
    setAvailableAlgotypes: React.Dispatch<React.SetStateAction<Algotype[]>>;

    allowMutationable: boolean
    setAllowMutationable: React.Dispatch<React.SetStateAction<boolean>>;
    mutationableMinimum: number;
    setMutationableMinimum: React.Dispatch<React.SetStateAction<number>>;
    mutationableMaximum: number;
    setMutationableMaximum: React.Dispatch<React.SetStateAction<number>>;
    mutationableStrategy: 'random' | 'increment' | 'decrement' | 'environmental';
    setMutationableStrategy: React.Dispatch<React.SetStateAction<'random' | 'increment' | 'decrement' | 'environmental'>>;

    allowDamageable: boolean;
    setAllowDamageable: React.Dispatch<React.SetStateAction<boolean>>;
    damageableMinimum: number;
    setDamageableMinimum: React.Dispatch<React.SetStateAction<number>>;
    damageableMaximum: number;
    setDamageableMaximum: React.Dispatch<React.SetStateAction<number>>;
    damageablePassiveThreshold: number;
    setDamageablePassiveThreshold: React.Dispatch<React.SetStateAction<number>>;
    damageableFrozenThreshold: number;
    setDamageableFrozenThreshold: React.Dispatch<React.SetStateAction<number>>;

    allowConvertible: boolean;
    setAllowConvertible: React.Dispatch<React.SetStateAction<boolean>>;
    convertibleMinimum: number;
    setConvertibleMinimum: React.Dispatch<React.SetStateAction<number>>;
    convertibleMaximum: number;
    setConvertibleMaximum: React.Dispatch<React.SetStateAction<number>>;

    allowDivisible: boolean;
    setAllowDivisible: React.Dispatch<React.SetStateAction<boolean>>;
    divisibleMinimum: number;
    setDivisibleMinimum: React.Dispatch<React.SetStateAction<number>>;
    divisibleMaximum: number;
    setDivisibleMaximum: React.Dispatch<React.SetStateAction<number>>;

    allowApoptosable: boolean;
    setAllowApoptosable: React.Dispatch<React.SetStateAction<boolean>>;
    apoptosableMinimum: number;
    setApoptosableMinimum: React.Dispatch<React.SetStateAction<number>>;
    apoptosableMaximum: number;
    setApoptosableMaximum: React.Dispatch<React.SetStateAction<number>>;

    allowSpeed: boolean;
    setAllowSpeed: React.Dispatch<React.SetStateAction<boolean>>;
    speedMinimum: number;
    setSpeedMinimum: React.Dispatch<React.SetStateAction<number>>;
    speedMaximum: number;
    setSpeedMaximum: React.Dispatch<React.SetStateAction<number>>;

    allowResponsiveness: boolean;
    setAllowResponsiveness: React.Dispatch<React.SetStateAction<boolean>>;
    responsivenessMinimum: number;
    setResponsivenessMinimum: React.Dispatch<React.SetStateAction<number>>;
    responsivenessMaximum: number;
    setResponsivenessMaximum: React.Dispatch<React.SetStateAction<number>>;
}) {
    const [
        showSettings,
        setShowSettings,
    ] = useState(false);


    const close = useCallback(() => {
        setShowSettings(false);
    }, []);


    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedCell === null) {
                close();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [
        close,
        selectedCell,
    ]);


    if (!showSettings) {
        return (
            <div
                className="fixed z-30 top-1/2 left-4 transform -translate-y-1/2 flex"
            >
                <button
                    onClick={() => {
                        setShowSettings(true);
                        defocus();
                    }}
                    className={`${focusStyle} p-2`}
                >
                    {settingsIcon}
                </button>
            </div>
        );
    }

    return (
        <div
            className="fixed z-30 top-0 right-0 md:right-auto left-0 bottom-0 w-full md:w-[550px] background-blur-md bg-white/20 p-4 overflow-scroll"
        >
            <div
                className="flex flex-col items-center justify-center"
            >
                <button
                    className={`fixed z-40 top-3 left-2 p-2 text-white cursor-pointer font-bold text-xl text-center ${focusStyle}`}
                    onClick={() => {
                        close();
                    }}
                >
                    {closeIcon}
                </button>

                <h2
                    className="text-2xl font-bold"
                >
                    settings
                </h2>


                <div>
                    current distribution
                </div>
                <textarea
                    placeholder="cells respecting the interface"
                    value={JSON.stringify(distribution, null, 4)}
                    className={`text-white w-[calc(100%-1rem)] h-60 m-4 p-4 background-blur-md bg-stone-500/20 ${focusStyle}`}
                    spellCheck="false"
                    onChange={(e) => {

                    }}
                />

                <div>
                    edit
                </div>


                <div
                    className="text-left w-96 p-4"
                >
                    <div
                        className="mb-8"
                    >
                        <Input
                            value={minimumValue}
                            onChange={(e) => {
                                setMinimumValue(parseInt(e));
                            }}
                            label="minimum value"
                            compact={true}
                            type="number"
                            min={-1000}
                        />

                        <Input
                            value={maximumValue}
                            onChange={(e) => {
                                setMaximumValue(parseInt(e));
                            }}
                            label="maximum value"
                            compact={true}
                            type="number"
                        />
                    </div>


                    <div
                        className="mb-8"
                    >
                        <Input
                            value={proactivePercent * 100}
                            onChange={(e) => {
                                setProactivePercent(parseFloat(e) / 100);
                            }}
                            label="proactive %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={passivePercent * 100}
                            onChange={(e) => {
                                setPassivePercent(parseFloat(e) / 100);
                            }}
                            label="passive %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={frozenPercent * 100}
                            onChange={(e) => {
                                setFrozenPercent(parseFloat(e) / 100);
                            }}
                            label="frozen %"
                            compact={true}
                            type="number"
                        />
                    </div>


                    <div
                        className="mb-8"
                    >
                        <Input
                            value={bubbleSortPercent * 100}
                            onChange={(e) => {
                                setBubbleSortPercent(parseFloat(e) / 100);
                            }}
                            label="bubble sort %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={insertionSortPercent * 100}
                            onChange={(e) => {
                                setInsertionSortPercent(parseFloat(e) / 100);
                            }}
                            label="insertion sort %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={selectionSortPercent * 100}
                            onChange={(e) => {
                                setSelectionSortPercent(parseFloat(e) / 100);
                            }}
                            label="selection sort %"
                            compact={true}
                            type="number"
                        />
                    </div>


                    <div
                        className="mb-8"
                    >
                        <Dropdown
                            name="colors"
                            selected={colorType}
                            selectables={[
                                'random',
                                'blue',
                                'lime',
                            ]}
                            atSelect={(colorType) => {
                                setColorType(colorType as any);
                            }}
                        />

                        <Toggle
                            text="background"
                            toggle={() => {
                                setShowBackground(!showBackground);
                            }}
                            value={showBackground}
                        />
                    </div>


                    <Toggle
                        text="allow mutationable"
                        toggle={() => {
                            setAllowMutationable(!allowMutationable);
                        }}
                        value={allowMutationable}
                        tooltip="after X swaps the cell will mutate into a different value"
                    />
                    {allowMutationable && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={mutationableMinimum}
                                onChange={(e) => {
                                    setMutationableMinimum(parseInt(e));
                                }}
                                label="mutationable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={mutationableMaximum}
                                onChange={(e) => {
                                    setMutationableMaximum(parseInt(e));
                                }}
                                label="mutationable maximum"
                                compact={true}
                                type="number"
                            />

                            <Dropdown
                                name="mutationable strategy"
                                selected={mutationableStrategy}
                                selectables={[
                                    'random',
                                    'increment',
                                    'decrement',
                                    'environmental',
                                ]}
                                atSelect={(mutationableStrategy) => {
                                    setMutationableStrategy(mutationableStrategy as any);
                                }}
                            />
                        </div>
                    )}

                    <Toggle
                        text="allow damageable"
                        toggle={() => {
                            setAllowDamageable(!allowDamageable);
                        }}
                        value={allowDamageable}
                        tooltip="how many times the cell can swap before it becomes passive/frozen"
                    />
                    {allowDamageable && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={damageableMinimum}
                                onChange={(e) => {
                                    setDamageableMinimum(parseInt(e));
                                }}
                                label="damageable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={damageableMaximum}
                                onChange={(e) => {
                                    setDamageableMaximum(parseInt(e));
                                }}
                                label="damageable maximum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={damageablePassiveThreshold}
                                onChange={(e) => {
                                    setDamageablePassiveThreshold(parseInt(e));
                                }}
                                label="damageable passive threshold"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={damageableFrozenThreshold}
                                onChange={(e) => {
                                    setDamageableFrozenThreshold(parseInt(e));
                                }}
                                label="damageable frozen threshold"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}


                    <Toggle
                        text="allow convertible"
                        toggle={() => {
                            setAllowConvertible(!allowConvertible);
                        }}
                        value={allowConvertible}
                        tooltip="if after X swaps the cell is still surrounded by the same different algotype it will convert to that algotype"
                    />
                    {allowConvertible && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={convertibleMinimum}
                                onChange={(e) => {
                                    setConvertibleMinimum(parseInt(e));
                                }}
                                label="convertible minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={convertibleMaximum}
                                onChange={(e) => {
                                    setConvertibleMaximum(parseInt(e));
                                }}
                                label="convertible maximum"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}


                    <Toggle
                        text="allow divisible"
                        toggle={() => {
                            setAllowDivisible(!allowDivisible);
                        }}
                        value={allowDivisible}
                        tooltip="after X swaps the cell will split into two cells of the same algotype"
                    />
                    {allowDivisible && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={divisibleMinimum}
                                onChange={(e) => {
                                    setDivisibleMinimum(parseInt(e));
                                }}
                                label="divisible minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={divisibleMaximum}
                                onChange={(e) => {
                                    setDivisibleMaximum(parseInt(e));
                                }}
                                label="divisible maximum"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}


                    <Toggle
                        text="allow apoptosable"
                        toggle={() => {
                            setAllowApoptosable(!allowApoptosable);
                        }}
                        value={allowApoptosable}
                        tooltip="after X swaps the cell will die"
                    />
                    {allowApoptosable && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={apoptosableMinimum}
                                onChange={(e) => {
                                    setApoptosableMinimum(parseInt(e));
                                }}
                                label="apoptosable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={apoptosableMaximum}
                                onChange={(e) => {
                                    setApoptosableMaximum(parseInt(e));
                                }}
                                label="apoptosable maximum"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}


                    <Toggle
                        text="allow speed"
                        toggle={() => {
                            setAllowSpeed(!allowSpeed);
                        }}
                        value={allowSpeed}
                        tooltip="how fast the cell will initiate swapping (in milliseconds)"
                    />
                    {allowSpeed && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={speedMinimum}
                                onChange={(e) => {
                                    setSpeedMinimum(parseInt(e));
                                }}
                                label="speed minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={speedMaximum}
                                onChange={(e) => {
                                    setSpeedMaximum(parseInt(e));
                                }}
                                label="speed maximum"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}


                    <Toggle
                        text="allow responsiveness"
                        toggle={() => {
                            setAllowResponsiveness(!allowResponsiveness);
                        }}
                        value={allowResponsiveness}
                        tooltip="how fast the cell will respond to swapping (in milliseconds)"
                    />
                    {allowResponsiveness && (
                        <div
                            className="mb-8"
                        >
                            <Input
                                value={responsivenessMinimum}
                                onChange={(e) => {
                                    setResponsivenessMinimum(parseInt(e));
                                }}
                                label="responsiveness minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={responsivenessMaximum}
                                onChange={(e) => {
                                    setResponsivenessMaximum(parseInt(e));
                                }}
                                label="responsiveness maximum"
                                compact={true}
                                type="number"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
