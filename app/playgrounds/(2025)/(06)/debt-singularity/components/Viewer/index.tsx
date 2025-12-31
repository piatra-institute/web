'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { runSimulation } from '../../logic';



interface ViewerProps {
    initialDebt: number;
    annualPayment: number;
    interestRate: number;
    inflationRate: number;
    simulationYears: number;
    onInterestRateChange: (rate: number) => void;
    onInflationRateChange: (rate: number) => void;
}

const INFLATION_MAX = 50;
const INTEREST_MAX = 25;

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(
    ({ initialDebt, annualPayment, interestRate, inflationRate, simulationYears, onInterestRateChange, onInflationRateChange }, ref) => {
        const phaseCanvasRef = useRef<HTMLCanvasElement>(null);
        const debtCanvasRef = useRef<HTMLCanvasElement>(null);
        const [tooltipData, setTooltipData] = useState<{ x: number; y: number; realRate: number } | null>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [hoveredPoint, setHoveredPoint] = useState<{ year: number; value: number } | null>(null);

        useImperativeHandle(ref, () => ({
            exportCanvas: () => {
                const canvas = phaseCanvasRef.current;
                if (!canvas) return;
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'debt-phase-diagram.png';
                link.href = dataURL;
                link.click();
            },
        }));

        const drawPhaseDiagram = useCallback(() => {
            const canvas = phaseCanvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const w = rect.width;
            const h = rect.height;

            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    const inflation = (i / w) * INFLATION_MAX;
                    const interest = (j / h) * INTEREST_MAX;

                    if (Math.abs(inflation - interest) < 0.5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    } else if (inflation > interest) {
                        ctx.fillStyle = 'rgba(132, 204, 22, 0.8)'; // lime-500
                    } else {
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // red-500
                    }

                    ctx.fillRect(i, h - j - 1, 1, 1);
                }
            }

            const markerX = (inflationRate / INFLATION_MAX) * w;
            const markerY = h - ((interestRate / INTEREST_MAX) * h);

            ctx.beginPath();
            ctx.arc(markerX, markerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#fbbf24'; // yellow-400
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        }, [interestRate, inflationRate]);

        const drawDebtChart = useCallback(() => {
            const canvas = debtCanvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const w = rect.width;
            const h = rect.height;
            const padding = { top: 50, right: 30, bottom: 60, left: 100 };
            const chartWidth = w - padding.left - padding.right;
            const chartHeight = h - padding.top - padding.bottom;

            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Get simulation data
            const simulationData = runSimulation(initialDebt, annualPayment, interestRate / 100, inflationRate / 100, simulationYears);
            const maxValue = Math.max(...simulationData.dataPoints, initialDebt);
            const minValue = 0;

            // Determine line color based on real interest rate
            const realInterestRate = interestRate - inflationRate;
            let lineColor = '#84cc16'; // lime-500
            if (realInterestRate < 0) lineColor = '#84cc16'; // lime-500
            else if (realInterestRate > 0) lineColor = '#ef4444'; // red-500

            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            // Horizontal grid lines
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight * i) / 5;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(w - padding.right, y);
                ctx.stroke();

                // Y-axis labels
                const value = maxValue - (maxValue - minValue) * (i / 5);
                ctx.fillStyle = '#d1d5db';
                ctx.font = '12px "Libre Baskerville", serif';
                ctx.textAlign = 'right';
                ctx.fillText('$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 }), padding.left - 10, y + 4);
            }

            // Vertical grid lines
            for (let i = 0; i <= simulationYears; i += Math.ceil(simulationYears / 10)) {
                const x = padding.left + (chartWidth * i) / simulationYears;
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, h - padding.bottom);
                ctx.stroke();

                // X-axis labels
                ctx.fillStyle = '#d1d5db';
                ctx.font = '12px "Libre Baskerville", serif';
                ctx.textAlign = 'center';
                ctx.fillText(i.toString(), x, h - padding.bottom + 20);
            }

            // Draw initial debt line
            const initialDebtY = padding.top + chartHeight * (1 - (initialDebt - minValue) / (maxValue - minValue));
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(padding.left, initialDebtY);
            ctx.lineTo(w - padding.right, initialDebtY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw "Initial Debt" label
            ctx.fillStyle = '#d1d5db';
            ctx.font = '10px "Libre Baskerville", serif';
            ctx.textAlign = 'left';
            ctx.fillText('Initial Debt', padding.left + 5, initialDebtY - 5);

            // Draw the debt line
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
            ctx.beginPath();

            simulationData.dataPoints.forEach((value, index) => {
                const x = padding.left + (chartWidth * index) / simulationYears;
                const y = padding.top + chartHeight * (1 - (value - minValue) / (maxValue - minValue));

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw filled area under the line
            ctx.fillStyle = lineColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
            ctx.beginPath();
            simulationData.dataPoints.forEach((value, index) => {
                const x = padding.left + (chartWidth * index) / simulationYears;
                const y = padding.top + chartHeight * (1 - (value - minValue) / (maxValue - minValue));

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.lineTo(padding.left + chartWidth, h - padding.bottom);
            ctx.lineTo(padding.left, h - padding.bottom);
            ctx.closePath();
            ctx.fill();

            // Draw axes labels
            ctx.fillStyle = '#d1d5db';
            ctx.font = '14px "Libre Baskerville", serif';
            ctx.textAlign = 'center';
            ctx.fillText('Years', w / 2, h - 15);

            // Title
            ctx.font = 'bold 16px "Libre Baskerville", serif';
            ctx.fillText('Real Value of Debt Over Time', w / 2, 30);
        }, [initialDebt, annualPayment, interestRate, inflationRate, simulationYears]);

        useEffect(() => {
            drawPhaseDiagram();
            drawDebtChart();
        }, [drawPhaseDiagram, drawDebtChart]);

        useEffect(() => {
            const handleResize = () => {
                drawPhaseDiagram();
                drawDebtChart();
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, [drawPhaseDiagram, drawDebtChart]);

        const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = phaseCanvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const inflation = (x / rect.width) * INFLATION_MAX;
            const interest = ((rect.height - y) / rect.height) * INTEREST_MAX;

            if (isDragging || e.type === 'mousedown') {
                onInflationRateChange(Math.max(0, Math.min(INFLATION_MAX, inflation)));
                onInterestRateChange(Math.max(0, Math.min(INTEREST_MAX, interest)));
            }

            if (e.type === 'mousemove') {
                const realRate = interest - inflation;
                setTooltipData({ x: e.clientX, y: e.clientY, realRate });
            }
        };

        const handleMouseLeave = () => {
            setTooltipData(null);
        };

        const handleDebtChartHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = debtCanvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const padding = { left: 100, right: 30 };
            const chartWidth = rect.width - padding.left - padding.right;

            if (x < padding.left || x > rect.width - padding.right) {
                setHoveredPoint(null);
                return;
            }

            const year = Math.round(((x - padding.left) / chartWidth) * simulationYears);
            const simulationData = runSimulation(initialDebt, annualPayment, interestRate / 100, inflationRate / 100, simulationYears);

            if (year >= 0 && year < simulationData.dataPoints.length) {
                setHoveredPoint({ year, value: simulationData.dataPoints[year] });
            }
        };

        return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-black p-6 shadow-2xl border border-gray-800">
                        <h2 className="text-2xl font-bold mb-4 text-white">Phase Diagram: Interest Rate vs. Inflation</h2>
                        <div className="relative">
                            <div className="relative w-full pb-[100%]">
                                <canvas
                                    ref={phaseCanvasRef}
                                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseMove={handleCanvasInteraction}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={handleCanvasInteraction}
                                />
                            </div>
                            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-white font-medium select-none">
                                Inflation Rate (%) →
                            </p>
                            <p className="absolute top-1/2 -left-8 -translate-y-1/2 -rotate-90 text-sm text-white font-medium select-none">
                                Interest Rate (%) →
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-black p-6 shadow-2xl border border-gray-800">
                        <div className="h-[320px] relative">
                            <canvas
                                ref={debtCanvasRef}
                                className="absolute top-0 left-0 w-full h-full"
                                onMouseMove={handleDebtChartHover}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        </div>
                    </div>
                </div>

                {tooltipData && (
                    <div
                        className="fixed bg-black/90 text-white px-3 py-2 text-sm pointer-events-none backdrop-blur-sm border border-gray-800 z-50"
                        style={{ left: `${tooltipData.x + 15}px`, top: `${tooltipData.y + 15}px` }}
                    >
                        Real Rate: <span className={`font-bold ${tooltipData.realRate < 0 ? 'text-lime-400' : 'text-red-400'}`}>
                            {tooltipData.realRate.toFixed(1)}%
                        </span>
                    </div>
                )}

                {hoveredPoint && (
                    <div
                        className="fixed bg-black/90 text-white px-3 py-2 text-sm pointer-events-none backdrop-blur-sm border border-gray-800 z-50"
                        style={{
                            left: `${debtCanvasRef.current?.getBoundingClientRect().left || 0}px`,
                            top: `${(debtCanvasRef.current?.getBoundingClientRect().top || 0) - 30}px`
                        }}
                    >
                        Year {hoveredPoint.year}: ${hoveredPoint.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                )}
            </div>
        );
    }
);

Viewer.displayName = 'Viewer';

export default Viewer;
