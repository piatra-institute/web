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
    Algotype,
} from '@/app/playgrounds/self-sorted-arrays/data';



export default function Settings({
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
                className="fixed z-30 top-1/2 left-4 transform -translate-y-1/2"
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
            className="fixed z-30 top-0 right-0 md:right-auto left-0 bottom-0 w-full md:w-[550px] flex flex-col items-center justify-center background-blur-md bg-white/20"
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
            />

            <div>
                algotype: bubble | insertion | selection
            </div>

            <div>
                swap?: frozen | passive | proactive
            </div>

            <div>
                mutationable?: number
            </div>

            <div>
                mutationStrategy?: random | increment | decrement | environmental
            </div>

            <div>
                damageable?: number
            </div>

            <div>
                convertible?: number
            </div>

            <div>
                divisible?: number
            </div>

            <div>
                apoptosable?: number
            </div>

            <div>
                speed?: number
            </div>

            <div>
                responsiveness?: number
            </div>
        </div>
    );
}
