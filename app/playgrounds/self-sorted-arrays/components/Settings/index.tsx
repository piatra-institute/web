import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import * as acorn from 'acorn';

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
import LinkButton from '@/components/LinkButton';

import {
    CellData,
} from '@/app/playgrounds/self-sorted-arrays/data';



const parsePercent = (
    value: number,
) => {
    return parseFloat(
        value.toFixed(2),
    );
}


const renderPercent = (
    value: number,
) => {
    return Math.ceil(
        value * 100,
    );
}


export interface SettingsProperties {
    distribution: CellData[];
    setDistribution: React.Dispatch<React.SetStateAction<CellData[]>>;

    setCount: React.Dispatch<React.SetStateAction<number>>;

    selectedCell: string | null;

    colorType: 'random' | 'blue' | 'lime';
    setColorType: React.Dispatch<React.SetStateAction<'random' | 'blue' | 'lime'>>;
    showBackground: boolean;
    setShowBackground: React.Dispatch<React.SetStateAction<boolean>>;

    minimumValue: number;
    setMinimumValue: React.Dispatch<React.SetStateAction<number>>;
    maximumValue: number;
    setMaximumValue: React.Dispatch<React.SetStateAction<number>>;
    duplicationDegree: number;
    setDuplicationDegree: React.Dispatch<React.SetStateAction<number>>;

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

    allowRepairable: boolean;
    setAllowRepairable: React.Dispatch<React.SetStateAction<boolean>>;

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

    clearTissue: () => void;
};


export default function Settings(
    properties: SettingsProperties,
) {
    // #region properties
    const {
        distribution,
        setDistribution,

        setCount,

        selectedCell,

        colorType,
        setColorType,
        showBackground,
        setShowBackground,

        minimumValue,
        setMinimumValue,
        maximumValue,
        setMaximumValue,
        duplicationDegree,
        setDuplicationDegree,

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

        allowRepairable,
        setAllowRepairable,

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

        clearTissue,
    } = properties;
    // #endregion properties


    // #region state
    const [
        showSettings,
        setShowSettings,
    ] = useState(false);

    const [
        textareaData,
        setTextareaData,
    ] = useState(JSON.stringify(distribution, null, 4));

    const [
        editTextarea,
        setEditTextarea,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const close = useCallback(() => {
        setShowSettings(false);
    }, []);

    const setPercent = (
        data: string,
        setter: (value: number) => void,
    ) => {
        const value = parsePercent(
            parseFloat(data) / 100,
        );
        if (value >= 0 && value <= 1) {
            setter(value);
            return value;
        }
    }

    const saveEditTextarea = () => {
        setEditTextarea(!editTextarea);

        if (editTextarea) {
            try {
                const data = JSON.parse(textareaData);
                setCount(data.length);

                setTimeout(() => {
                    clearTissue();
                    setDistribution(data);
                }, 50);
            } catch (_error) {
                try {
                    const ast = acorn.parse(textareaData, {ecmaVersion: 2020});
                    if (ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement') {
                        throw new Error('Invalid JavaScript object format');
                    }
                    const objectExpression = ast.body[0].expression;
                    if (objectExpression.type !== 'ArrayExpression') {
                        throw new Error('Invalid JavaScript object format');
                    }

                    const data: any[] = [];

                    for (const element of objectExpression.elements) {
                        if (!element) {
                            continue;
                        }

                        if (element.type !== 'ObjectExpression') {
                            continue;
                        }

                        const jsonObject: any = {};
                        for (const prop of element.properties) {
                            if (prop.type !== 'Property') {
                                continue;
                            }

                            if (prop.key.type !== 'Identifier' || prop.value.type !== 'Literal') {
                                continue;
                            }

                            jsonObject[prop.key.name] = prop.value.value;
                        }
                        if (Object.keys(jsonObject).length > 0) {
                            data.push(jsonObject);
                        }
                    }

                    setCount(data.length);

                    setTimeout(() => {
                        clearTissue();
                        setDistribution(data);
                    }, 50);
                } catch (error) {
                    console.error(_error);
                    console.error(error);
                }
            }
        }
    }
    // #endregion handlers


    // #region effects
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

    useEffect(() => {
        setTextareaData(JSON.stringify(distribution, null, 4));
    }, [
        distribution,
    ]);
    // #endregion effects


    // #region render
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
                    value={textareaData}
                    className={`text-white w-[calc(100%-1rem)] min-h-40 h-60 m-4 p-4 background-blur-md bg-stone-500/20 ${focusStyle}`}
                    spellCheck="false"
                    onChange={(e) => {
                        if (!editTextarea) {
                            return;
                        }

                        setTextareaData(e.target.value);
                    }}
                    readOnly={!editTextarea}
                />

                <LinkButton
                    text={editTextarea ? 'save' : 'edit'}
                    onClick={() => saveEditTextarea()}
                />


                <div
                    className="text-left w-96 p-4"
                >
                    <div
                        className="mb-8"
                    >
                        <Input
                            value={minimumValue}
                            onChange={(e) => {
                                const value = parseInt(e);
                                if (isNaN(value)) {
                                    return;
                                }
                                setMinimumValue(value);
                            }}
                            label="minimum value"
                            compact={true}
                            type="number"
                            min={-1000}
                        />

                        <Input
                            value={maximumValue}
                            onChange={(e) => {
                                const value = parseInt(e);
                                if (isNaN(value)) {
                                    return;
                                }
                                setMaximumValue(value);
                            }}
                            label="maximum value"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={duplicationDegree}
                            onChange={(e) => {
                                const value = parseInt(e);
                                if (isNaN(value)) {
                                    return;
                                }
                                setDuplicationDegree(value);
                            }}
                            label="duplication degree"
                            compact={true}
                            type="number"
                        />
                    </div>


                    <div
                        className="mb-8"
                    >
                        <Input
                            value={renderPercent(proactivePercent)}
                            onChange={(e) => {
                                const proactivePercent = setPercent(e, setProactivePercent);
                                if (typeof proactivePercent === 'number') {
                                    const distributed = parsePercent(
                                        (1 - proactivePercent) / 2,
                                    );
                                    setPassivePercent(distributed);
                                    setFrozenPercent(distributed);
                                }
                            }}
                            label="proactive %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={renderPercent(passivePercent)}
                            onChange={(e) => {
                                const passivePercent = setPercent(e, setPassivePercent);
                                if (typeof passivePercent === 'number') {
                                    const frozenPercent = parsePercent(
                                        1 - proactivePercent - passivePercent,
                                    );
                                    if (frozenPercent >= 0) {
                                        setFrozenPercent(frozenPercent);
                                    } else {
                                        setFrozenPercent(0);
                                    }
                                }
                            }}
                            label="passive %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={renderPercent(frozenPercent)}
                            onChange={(e) => {
                                setPercent(e, setFrozenPercent);
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
                            value={renderPercent(bubbleSortPercent)}
                            onChange={(e) => {
                                const bubbleSortPercent = setPercent(e, setBubbleSortPercent);
                                if (typeof bubbleSortPercent === 'number') {
                                    const distributed = parsePercent(
                                        (1 - bubbleSortPercent) / 2,
                                    );
                                    setInsertionSortPercent(distributed);
                                    setSelectionSortPercent(distributed);
                                }
                            }}
                            label="bubble sort %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={renderPercent(insertionSortPercent)}
                            onChange={(e) => {
                                const insertionSortPercent = setPercent(e, setInsertionSortPercent);
                                if (typeof insertionSortPercent === 'number') {
                                    const selectionSortPercent = parsePercent(
                                        1 - bubbleSortPercent - insertionSortPercent,
                                    );
                                    if (selectionSortPercent >= 0) {
                                        setSelectionSortPercent(selectionSortPercent);
                                    } else {
                                        setSelectionSortPercent(0);
                                    }
                                }
                            }}
                            label="insertion sort %"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={renderPercent(selectionSortPercent)}
                            onChange={(e) => {
                                setPercent(e, setSelectionSortPercent);
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
                        text="allow repairable"
                        toggle={() => {
                            setAllowRepairable(!allowRepairable);
                        }}
                        value={allowRepairable}
                        tooltip="after how many nudges the cell will recover from passive/frozen state"
                    />

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
    // #endregion render
}
