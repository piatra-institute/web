import {
    useState,
} from 'react';



interface ButtonsProps {
    reset: () => void;
    isRunning: boolean;
    setIsRunning: (value: boolean) => void;
    addBeads: () => void;
    areaOfEffect: boolean;
    setAreaOfEffect: (value: boolean) => void;
    morphodynamics: boolean;
    setMorphodynamics: (value: boolean) => void;
    spawnBead: () => void;
    toggleTitle: () => void;
}

const Buttons: React.FC<ButtonsProps> = ({
    reset,
    isRunning,
    setIsRunning,
    addBeads,
    areaOfEffect,
    setAreaOfEffect,
    morphodynamics,
    setMorphodynamics,
    spawnBead,
    toggleTitle,
}) => {
    const [isVisible, setIsVisible] = useState(true);


    return (
        <div className="fixed bottom-9 left-0 right-0 p-2">
            <button
                onClick={() => {
                    setIsVisible(!isVisible);
                    toggleTitle();
                }}
                className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 min-w-[100px] text-black text-sm bg-lime-50 hover:bg-lime-200 transition-colors px-4 py-1"
            >
                {isVisible ? (
                    <div>
                        Hide
                    </div>
                ) : (
                    <div>
                        Show
                    </div>
                )}
            </button>

            {isVisible && (
                <div className="max-w-xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                            onClick={reset}
                            className="px-3 py-2 bg-lime-50 text-black hover:bg-lime-200 transition-colors text-sm"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className={`px-3 py-2 text-black hover:bg-lime-200 transition-colors text-sm ${isRunning ? 'bg-lime-50' : 'bg-lime-200'}`}
                        >
                            {isRunning ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={addBeads}
                            className="px-3 py-2 bg-lime-50 text-black hover:bg-lime-200 transition-colors text-sm"
                        >
                            Add Beads
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                        <button
                            onClick={() => setAreaOfEffect(!areaOfEffect)}
                            className={`px-3 py-2 text-black hover:bg-lime-200 transition-colors text-sm ${areaOfEffect ? 'bg-lime-200' : 'bg-lime-50'
                                }`}
                        >
                            Area of Effect
                        </button>
                        <button
                            onClick={() => setMorphodynamics(!morphodynamics)}
                            className={`px-3 py-2 text-black hover:bg-lime-200 transition-colors text-sm ${morphodynamics ? 'bg-lime-200' : 'bg-lime-50'}`}
                        >
                            Morphodynamics
                        </button>
                        <button
                            onClick={spawnBead}
                            className="px-3 py-2 bg-lime-50 text-black hover:bg-lime-200 transition-colors text-sm"
                        >
                            Add Bead
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Buttons;
