import {
    useEffect,
} from 'react';

import {
    closeIcon,
} from '@/data/icons';

import {
    focusStyle,
} from '@/data/styles';

import {
    Cell,
} from '@/app/playgrounds/self-sorted-arrays/data';



export interface CellViewerProps {
    data: Cell;
    distribution: Cell[];
    swaps: string[];
    close: () => void;
}

const CellViewer: React.FC<CellViewerProps> = ({
    data,
    distribution,
    swaps,
    close,
}) => {
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


    return (
        <div
            className="fixed z-30 top-0 left-0 md:left-auto right-0 bottom-0 w-full md:w-[550px] flex flex-col items-center justify-center"
            style={{
                backgroundColor: data.color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
            }}
        >
            <button
                className={`absolute z-40 top-3 right-2 p-2 text-white cursor-pointer font-bold text-xl text-center ${focusStyle}`}
                onClick={() => {
                    close();
                }}
            >
                {closeIcon}
            </button>

            <h2
                className="text-3xl font-bold text-white text-center m-4 select-none"
            >
                cell &lt;{data.value}&gt;
            </h2>

            <h3
                className="text-xl font-bold text-white text-center m-4 select-none"
            >
                &lsquo;{data.algotype}&rsquo; algotype · &lsquo;{data.swap || 'proactive'}&rsquo; swap
            </h3>

            {swaps.length > 0 && (
                <div
                    className="flex flex-col items-center justify-center text-white m-4"
                >
                    <h4
                        className="text-xl font-bold text-center select-none"
                    >
                        swaps
                    </h4>

                    <ul
                        className="flex flex-col items-center justify-center text-white"
                    >
                        {swaps.map((swap, i) => {
                            const cell = distribution.find((cell) => cell.id === swap);
                            if (!cell) {
                                return;
                            }

                            return (
                                <li
                                    key={i}
                                    className="text-lg font-bold text-center m-2 select-none"
                                >
                                    swapped with {cell.value}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};


export default CellViewer;
