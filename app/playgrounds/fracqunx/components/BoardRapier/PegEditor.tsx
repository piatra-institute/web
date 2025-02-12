import React, {
    useState,
    useEffect,
} from 'react';



interface PegSettings {
    aoe: boolean;
    aoeSize: number;
    aoeSpeed: number;
}

interface PegEditorProps {
    selectedPegIndex: number;
    onClose: () => void;
    onUpdatePeg: (index: number, settings: PegSettings) => void;
    initialAoeSize?: number;
    initialAoeSpeed?: number;
}

const PegEditor: React.FC<PegEditorProps> = ({
    selectedPegIndex,
    onClose,
    onUpdatePeg,
    initialAoeSize = 1,
    initialAoeSpeed = 1
}) => {
    const [aoeSize, setAoeSize] = useState(initialAoeSize);
    const [aoeSpeed, setAoeSpeed] = useState(initialAoeSpeed);

    useEffect(() => {
        const handleSubmit = () => {
            onUpdatePeg(selectedPegIndex, {
                aoe: aoeSize !== 0,
                aoeSize,
                aoeSpeed,
            });
        };

        handleSubmit();
    }, [
        aoeSize,
        aoeSpeed,
        onUpdatePeg,
        selectedPegIndex,
    ]);

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-black border p-6 shadow-xl w-96">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-100">peg {selectedPegIndex}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2">
                            Area of Effect Size
                            <span className="text-sm font-mono text-gray-400 w-12 text-right">
                                {aoeSize.toFixed(1)}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.02"
                            value={aoeSize}
                            onChange={(e) => setAoeSize(parseFloat(e.target.value))}
                            className="w-full bg-gray-700 rounded-lg appearance-none h-2 cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2">
                            Area of Effect Speed
                            <span className="text-sm font-mono text-gray-400 w-12 text-right">
                                {aoeSpeed.toFixed(1)}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="-20"
                            max="20"
                            step="0.1"
                            value={aoeSpeed}
                            onChange={(e) => setAoeSpeed(parseFloat(e.target.value))}
                            className="w-full bg-gray-700 rounded-lg appearance-none h-2 cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-black bg-lime-50 hover:bg-lime-200 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default PegEditor;
