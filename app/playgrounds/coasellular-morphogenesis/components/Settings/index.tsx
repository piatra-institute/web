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
import LinkButton from '@/components/LinkButton';



export interface SettingsProperties {
    matrixRows: number;
    setMatrixRows: React.Dispatch<React.SetStateAction<number>>;

    matrixColumns: number;
    setMatrixColumns: React.Dispatch<React.SetStateAction<number>>;

    pointsCount: number;
    setPointsCount: React.Dispatch<React.SetStateAction<number>>;
};


export default function Settings(
    properties: SettingsProperties,
) {
    // #region properties
    const {
        matrixRows,
        setMatrixRows,

        matrixColumns,
        setMatrixColumns,

        pointsCount,
        setPointsCount,
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
    ] = useState('');

    const [
        editTextarea,
        setEditTextarea,
    ] = useState(false);
    // #endregion state


    // #region handlers
    const close = useCallback(() => {
        setShowSettings(false);
    }, []);
    // #endregion handlers


    // #region effects
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [
        close,
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
                    placeholder="coasellular morphogenesis respecting the interface"
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
                    onClick={() => {}}
                />


                <div
                    className="text-left w-96 p-4"
                >
                    <Input
                        label="matrix rows"
                        value={matrixRows}
                        onChange={(value) => {
                            setMatrixRows(parseInt(value));
                        }}
                    />

                    <Input
                        label="matrix columns"
                        value={matrixColumns}
                        onChange={(value) => {
                            setMatrixColumns(parseInt(value));
                        }}
                    />

                    <Input
                        label="circle points"
                        value={pointsCount}
                        onChange={(value) => {
                            setPointsCount(parseInt(value));
                        }}
                    />
                </div>
            </div>
        </div>
    );
    // #endregion render
}
