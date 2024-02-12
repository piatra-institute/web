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



export default function Settings({
    colorType,
    setColorType,
    selectedCell,
} : {
    colorType: 'random' | 'blue' | 'lime';
    setColorType: React.Dispatch<React.SetStateAction<'random' | 'blue' | 'lime'>>;
    selectedCell: string | null;
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

            <h2>
                settings
            </h2>

            <div>
                <div>
                    color type: {colorType}
                </div>
            </div>
        </div>
    );
}
