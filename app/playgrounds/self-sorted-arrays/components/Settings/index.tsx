import {
    useState,
} from 'react';

import {
    closeIcon,
    settingsIcon,
} from '@/data/icons';



export default function Settings({
    colorType,
    setColorType,
} : {
    colorType: 'random' | 'blue' | 'lime';
    setColorType: React.Dispatch<React.SetStateAction<'random' | 'blue' | 'lime'>>;
}) {
    const [
        showSettings,
        setShowSettings,
    ] = useState(false);


    const close = () => {
        setShowSettings(false);
    }


    if (!showSettings) {
        return (
            <div
                className="fixed z-30 top-1/2 left-4 transform -translate-y-1/2"
            >
                <button
                    onClick={() => {
                        setShowSettings(true);
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
                className="absolute z-40 top-3 left-2 p-2 text-white cursor-pointer font-bold text-xl text-center"
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
