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
    rows: number;
    setRows: React.Dispatch<React.SetStateAction<number>>;
    columns: number;
    setColumns: React.Dispatch<React.SetStateAction<number>>;
    horizontalSpacing: number;
    setHorizontalSpacing: React.Dispatch<React.SetStateAction<number>>;
    verticalSpacing: number;
    setVerticalSpacing: React.Dispatch<React.SetStateAction<number>>;
    binCount: number;
    setBinCount: React.Dispatch<React.SetStateAction<number>>;
    elasticity: number;
    setElasticity: React.Dispatch<React.SetStateAction<number>>;
    maxBalls: number;
    setMaxBalls: React.Dispatch<React.SetStateAction<number>>;
    releaseInterval: number;
    setReleaseInterval: React.Dispatch<React.SetStateAction<number>>;
};


export default function Settings(
    properties: SettingsProperties,
) {
    // #region properties
    const {
        rows,
        setRows,
        columns,
        setColumns,
        horizontalSpacing,
        setHorizontalSpacing,
        verticalSpacing,
        setVerticalSpacing,
        binCount,
        setBinCount,
        elasticity,
        setElasticity,
        maxBalls,
        setMaxBalls,
        releaseInterval,
        setReleaseInterval,
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
                    placeholder="fracqunx respecting the interface"
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
                        label="rows"
                        type="number"
                        min={1}
                        value={rows}
                        onChange={(value) => setRows(parseInt(value, 10))}
                    />

                    <Input
                        label="columns"
                        type="number"
                        min={1}
                        value={columns}
                        onChange={(value) => setColumns(parseInt(value, 10))}
                    />

                    <Input
                        label="horizontal spacing"
                        type="number"
                        min={5}
                        value={horizontalSpacing}
                        onChange={(value) => setHorizontalSpacing(parseInt(value, 10))}
                    />

                    <Input
                        label="vertical spacing"
                        type="number"
                        min={5}
                        value={verticalSpacing}
                        onChange={(value) => setVerticalSpacing(parseInt(value, 10))}
                    />

                    <Input
                        label="bin count"
                        type="number"
                        min={1}
                        value={binCount}
                        onChange={(value) => setBinCount(parseInt(value, 10))}
                    />

                    <Input
                        label="elasticity"
                        type="number"
                        step={0.1}
                        min={0}
                        max={1}
                        value={elasticity}
                        onChange={(value) => setElasticity(parseFloat(value))}
                    />

                    <Input
                        label="max balls"
                        type="number"
                        min={1}
                        value={maxBalls}
                        onChange={(value) => setMaxBalls(parseInt(value, 10))}
                    />

                    <Input
                        label="release interval (ms)"
                        type="number"
                        min={10}
                        step={50}
                        value={releaseInterval}
                        onChange={(value) => setReleaseInterval(parseInt(value, 10))}
                    />
                </div>
            </div>
        </div>
    );
    // #endregion render
}
