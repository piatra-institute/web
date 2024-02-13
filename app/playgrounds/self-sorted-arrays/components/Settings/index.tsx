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
                className={`absolute z-40 top-3 left-2 p-2 text-white cursor-pointer font-bold text-xl text-center ${focusStyle}`}
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
                <div>
                    color type: {colorType}
                </div>
            </div>

            <div>
                minimum value: 0
            </div>
            <div>
                maximum value: 100
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


            <div>
                algotype: bubble | insertion | selection
            </div>

            <div>
                swap?: frozen | passive | proactive
            </div>


            <div>
                allow mutationable
            </div>

            <div>
                mutationable minimum
            </div>

            <div>
                mutationable maximum
            </div>

            <div>
                mutationable strategy: random | increment | decrement | environmental
            </div>


            <div>
                allow damageable
            </div>

            <div>
                damageable minimum
            </div>

            <div>
                damageable maximum
            </div>


            <div>
                allow convertible
            </div>

            <div>
                convertible minimum
            </div>

            <div>
                convertible maximum
            </div>


            <div>
                allow divisible
            </div>

            <div>
                divisible minimum
            </div>

            <div>
                divisible maximum
            </div>


            <div>
                allow apoptosable
            </div>

            <div>
                apoptosable minimum
            </div>

            <div>
                apoptosable maximum
            </div>


            <div>
                allow speed
            </div>

            <div>
                speed minimum
            </div>

            <div>
                speed maximum
            </div>


            <div>
                allow responsiveness
            </div>

            <div>
                responsiveness minimum
            </div>

            <div>
                responsiveness maximum
            </div>
            </div>
        </div>
    );
}
