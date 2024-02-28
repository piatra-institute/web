'use client';

import {
    useRef,
    useState,
    useMemo,
    useEffect,
} from 'react';

import {
    CellData,
} from '@/app/playgrounds/self-sorted-arrays/data';



const computeCanvasHeight = (
    width: number,
) => {
    return Math.floor(width * 2/3);
}


const CanvasColumnChart = ({
    data,
    selectedCell,
    setSelectedCell,
}: {
    data: CellData[];
    selectedCell: string | null;
    setSelectedCell: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    const [canvasWidth, setCanvasWidth] = useState(550);
    const [canvasHeight, setCanvasHeight] = useState(computeCanvasHeight(canvasWidth));


    const columnWidth = useMemo(() => canvasWidth / data.length, [
        canvasWidth,
        data.length,
    ]);
    const maxDataValue = useMemo(() => (
        Math.max(
            ...data.map((cell) => Math.abs(cell.value))
        )
    ), [
        data,
    ]);


    const handleColumnClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickedColumn = Math.floor(clickX / columnWidth);

        const cell = data[clickedColumn];
        if (!cell) {
            return;
        }

        if (cell.id === selectedCell) {
            setSelectedCell(null);
        } else {
            setSelectedCell(cell.id);
        }
    };


    useEffect(() => {
        const draw = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            let selectedColumnHeight = 0;
            let selectedColumnIndex = 0;

            const topPadding = 22;

            const computeDimensions = (
                cell: CellData,
                index: number,
            ) => {
                const columnHeight = (Math.abs(cell.value) / maxDataValue) * canvasHeight;
                if (cell.id === selectedCell) {
                    selectedColumnHeight = columnHeight;
                    selectedColumnIndex = index;
                }
                const x = index * columnWidth;
                const y = canvasHeight - columnHeight + topPadding;

                return {
                    x,
                    y,
                    columnHeight,
                };
            }

            data.forEach((cell, index) => {
                const {
                    columnHeight,
                    x,
                    y,
                } = computeDimensions(cell, index);
                if (cell.id === selectedCell) {
                    selectedColumnHeight = columnHeight;
                    selectedColumnIndex = index;
                }

                ctx.fillStyle = cell.color;
                ctx.fillRect(x, y, columnWidth, columnHeight);

                if (cell.value < 0) {
                    const dotRadius = 2;

                    const numDotsX = Math.floor(columnWidth / (dotRadius * 2));
                    const numDotsY = Math.floor(columnHeight / (dotRadius * 2));

                    const dotSpacingX = columnWidth / (numDotsX + 1);
                    const dotSpacingY = columnHeight / (numDotsY + 1);

                    for (let i = 1; i <= numDotsX; i++) {
                        if (i % 2 === 0) {
                            continue;
                        }

                        for (let j = 1; j <= numDotsY; j++) {
                            if (j % 2 === 0) {
                                continue;
                            }

                            const dotX = x + i * dotSpacingX;
                            const dotY = y + j * dotSpacingY;
                            ctx.beginPath();
                            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                            ctx.fillStyle = 'black';
                            ctx.fill();
                            ctx.closePath();
                        }
                    }
                }

                if (data.length < 45) {
                    ctx.fillStyle = 'white';
                    ctx.font = '9px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(cell.value.toString(), x + columnWidth / 2, canvasHeight - 5);
                }
            });

            data.forEach((cell, index) => {
                const {
                    columnHeight,
                    x,
                    y,
                } = computeDimensions(cell, index);

                if (cell.swap && cell.swap !== 'proactive') {
                    ctx.fillStyle = 'white';
                    ctx.font = '13px Arial';
                    ctx.textAlign = 'center';
                    const cellSwap = cell.swap === 'frozen' ? '❄️' : '⚪';
                    const topElevation = columnHeight < 20
                        ? y + 28
                        : y - 6;
                    ctx.fillText(cellSwap, x + columnWidth / 2, topElevation);
                }
            });

            if (selectedCell !== null) {
                ctx.strokeStyle = 'white';
                const lineWidth = 2;
                ctx.lineWidth = lineWidth;
                const selectedX = selectedColumnIndex * columnWidth;
                const selectedY = canvasHeight - lineWidth / 2 - 4;
                ctx.strokeRect(
                    selectedX + 2, selectedY + 4,
                    columnWidth - 4, -selectedColumnHeight + topPadding + 2,
                );
            }
        }

        draw();

        const resizeCanvas = () => {
            const width = window.innerWidth < 600 ? 300 : 550;
            const height = computeCanvasHeight(width);

            setCanvasWidth(width);
            setCanvasHeight(height);
            draw();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [
        data,
        maxDataValue,
        canvasWidth,
        canvasHeight,
        columnWidth,
        selectedCell,
    ]);


    return (
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                background: 'rgb(0 0 0 / 0.04)',
                filter: 'drop-shadow(2px 4px 6px rgb(0 0 0 / 0.9))',
                cursor: 'pointer',
            }}
            onClick={handleColumnClick}
        />
    );
};


export default CanvasColumnChart;
