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

import {
    Cell,
    Algotype,
} from '@/app/playgrounds/self-sorted-arrays/data';



export default function Settings({
    distribution,

    colorType,
    setColorType,
    selectedCell,

    minimumValue,
    setMinimumValue,
    maximumValue,
    setMaximumValue,
    proactiveLevel,
    setProactiveLevel,
    availableAlgotypes,
    setAvailableAlgotypes,

    allowMutationable,
    setAllowMutationable,
    allowDamageable,
    setAllowDamageable,
    allowConvertible,
    setAllowConvertible,
    allowDivisible,
    setAllowDivisible,
    allowApoptosable,
    setAllowApoptosable,
    allowSpeed,
    setAllowSpeed,
    allowResponsiveness,
    setAllowResponsiveness,
} : {
    distribution: Cell[];

    colorType: 'random' | 'blue' | 'lime';
    setColorType: React.Dispatch<React.SetStateAction<'random' | 'blue' | 'lime'>>;
    selectedCell: string | null;

    minimumValue: number;
    setMinimumValue: React.Dispatch<React.SetStateAction<number>>;
    maximumValue: number;
    setMaximumValue: React.Dispatch<React.SetStateAction<number>>;
    proactiveLevel: number;
    setProactiveLevel: React.Dispatch<React.SetStateAction<number>>;
    availableAlgotypes: Algotype[];
    setAvailableAlgotypes: React.Dispatch<React.SetStateAction<Algotype[]>>;

    allowMutationable: boolean
    setAllowMutationable: React.Dispatch<React.SetStateAction<boolean>>;
    allowDamageable: boolean;
    setAllowDamageable: React.Dispatch<React.SetStateAction<boolean>>;
    allowConvertible: boolean;
    setAllowConvertible: React.Dispatch<React.SetStateAction<boolean>>;
    allowDivisible: boolean;
    setAllowDivisible: React.Dispatch<React.SetStateAction<boolean>>;
    allowApoptosable: boolean;
    setAllowApoptosable: React.Dispatch<React.SetStateAction<boolean>>;
    allowSpeed: boolean;
    setAllowSpeed: React.Dispatch<React.SetStateAction<boolean>>;
    allowResponsiveness: boolean;
    setAllowResponsiveness: React.Dispatch<React.SetStateAction<boolean>>;
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
                            value={0}
                            onChange={(e) => {}}
                            label="minimum value"
                            compact={true}
                            type="number"
                        />

                        <Input
                            value={0}
                            onChange={(e) => {}}
                            label="maximum value"
                            compact={true}
                            type="number"
                        />
                    </div>

                    {/* <div>
                        color type: {colorType}
                    </div>


                    <div>
                        algotype: bubble | insertion | selection
                    </div>

                    <div>
                        swap?: frozen | passive | proactive
                    </div> */}


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
                                value={0}
                                onChange={(e) => {}}
                                label="mutationable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
                                label="mutationable maximum"
                                compact={true}
                                type="number"
                            />

                            <div>
                                mutationable strategy: random | increment | decrement | environmental
                            </div>
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
                                value={0}
                                onChange={(e) => {}}
                                label="damageable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
                                label="damageable maximum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
                                label="damageable passive threshold"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
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
                                value={0}
                                onChange={(e) => {}}
                                label="convertible minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
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
                                value={0}
                                onChange={(e) => {}}
                                label="divisible minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
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
                                value={0}
                                onChange={(e) => {}}
                                label="apoptosable minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
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
                                value={0}
                                onChange={(e) => {}}
                                label="speed minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={0}
                                onChange={(e) => {}}
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
                                value={0}
                                onChange={(e) => {}}
                                label="responsiveness minimum"
                                compact={true}
                                type="number"
                            />

                            <Input
                                value={1000}
                                onChange={(e) => {}}
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
