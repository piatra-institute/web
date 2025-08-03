import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
    currentYear: number;
    maxYears: number;
    portfolioValue: number;
    totalGains: number;
    investableFloat: number;
    underwritingProfit: number;
    chartData: Array<{
        year: number;
        portfolioValue: number;
        investableFloat: number;
        underwritingProfit: number;
    }>;
}

export interface ViewerRef {
    exportCanvas: () => void;
}

const Viewer = forwardRef<ViewerRef, ViewerProps>(({
    currentYear,
    maxYears,
    portfolioValue,
    totalGains,
    investableFloat,
    underwritingProfit,
    chartData,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const link = document.createElement('a');
            link.download = `berkshire-engine-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }));

    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1e9) {
            return `$${(value / 1e9).toFixed(1)}B`;
        }
        if (Math.abs(value) >= 1e6) {
            return `$${(value / 1e6).toFixed(0)}M`;
        }
        return `$${value.toLocaleString()}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const updateCanvasSize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        const draw = () => {
            const width = canvas.width / window.devicePixelRatio;
            const height = canvas.height / window.devicePixelRatio;

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            if (chartData.length === 0) {
                // Empty state
                ctx.fillStyle = '#666';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('No simulation data', width / 2, height / 2 - 10);
                
                ctx.fillStyle = '#555';
                ctx.font = '14px monospace';
                ctx.fillText('Click "Start" to begin', width / 2, height / 2 + 10);
                return;
            }

            // Chart dimensions
            const padding = 60;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2 - 100; // Leave space for metrics

            // Find max values for scaling
            const maxPortfolio = Math.max(...chartData.map(d => d.portfolioValue));
            const maxFloat = Math.max(...chartData.map(d => d.investableFloat));
            const maxValue = Math.max(maxPortfolio, maxFloat) * 1.1;

            // Draw axes
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, padding + chartHeight);
            ctx.lineTo(padding + chartWidth, padding + chartHeight);
            ctx.stroke();

            // Draw grid lines
            ctx.strokeStyle = '#222';
            ctx.setLineDash([2, 4]);
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight * i) / 5;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + chartWidth, y);
                ctx.stroke();

                // Y-axis labels
                ctx.fillStyle = '#666';
                ctx.font = '12px monospace';
                ctx.textAlign = 'right';
                const value = maxValue * (1 - i / 5);
                ctx.fillText(formatCurrency(value * 1e6), padding - 10, y + 4);
            }
            ctx.setLineDash([]);

            // Draw data
            if (chartData.length > 1) {
                const xStep = chartWidth / (maxYears - 1);

                // Portfolio value line
                ctx.strokeStyle = '#84cc16'; // lime-400
                ctx.lineWidth = 3;
                ctx.beginPath();
                chartData.forEach((point, i) => {
                    const x = padding + i * xStep;
                    const y = padding + chartHeight - (point.portfolioValue / maxValue) * chartHeight;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();

                // Float line
                ctx.strokeStyle = '#bef264'; // lime-300
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                chartData.forEach((point, i) => {
                    const x = padding + i * xStep;
                    const y = padding + chartHeight - (point.investableFloat / maxValue) * chartHeight;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                ctx.setLineDash([]);

                // Underwriting line
                ctx.strokeStyle = underwritingProfit >= 0 ? '#4ade80' : '#ef4444'; // green-400 or red-500
                ctx.lineWidth = 2;
                ctx.beginPath();
                chartData.forEach((point, i) => {
                    const x = padding + i * xStep;
                    const y = padding + chartHeight - (Math.max(0, point.underwritingProfit) / maxValue) * chartHeight;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();

                // Current position indicator
                if (currentYear > 0 && currentYear <= chartData.length) {
                    const currentX = padding + (currentYear - 1) * xStep;
                    ctx.strokeStyle = '#84cc16';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(currentX, padding);
                    ctx.lineTo(currentX, padding + chartHeight);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Dot on current position
                    const currentData = chartData[currentYear - 1];
                    const currentY = padding + chartHeight - (currentData.portfolioValue / maxValue) * chartHeight;
                    ctx.fillStyle = '#84cc16';
                    ctx.beginPath();
                    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // X-axis labels
            ctx.fillStyle = '#666';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            for (let i = 0; i <= maxYears; i += 5) {
                const x = padding + (i / maxYears) * chartWidth;
                ctx.fillText(i.toString(), x, padding + chartHeight + 20);
            }

            // Labels
            ctx.fillStyle = '#999';
            ctx.font = '14px monospace';
            ctx.save();
            ctx.translate(20, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('Value ($)', 0, 0);
            ctx.restore();

            ctx.textAlign = 'center';
            ctx.fillText('Year', width / 2, padding + chartHeight + 40);

            // Legend
            const legendY = padding + chartHeight + 60;
            const legendItems = [
                { color: '#84cc16', label: 'Portfolio Value' },
                { color: '#bef264', label: 'Float', dash: true },
                { color: underwritingProfit >= 0 ? '#4ade80' : '#ef4444', label: 'Underwriting' }
            ];

            let legendX = width / 2 - 150;
            legendItems.forEach(item => {
                ctx.strokeStyle = item.color;
                ctx.lineWidth = 2;
                if (item.dash) ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(legendX, legendY);
                ctx.lineTo(legendX + 20, legendY);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#999';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(item.label, legendX + 25, legendY + 4);
                legendX += 120;
            });

            // Metrics display
            const metricsY = height - 40;
            ctx.fillStyle = '#84cc16';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            
            const metrics = [
                { label: 'Portfolio', value: formatCurrency(portfolioValue) },
                { label: 'Gains', value: formatCurrency(totalGains), color: '#4ade80' },
                { label: 'Float', value: formatCurrency(investableFloat), color: '#bef264' },
                { label: 'Year', value: `${currentYear}/${maxYears}`, color: '#666' }
            ];

            const metricWidth = width / metrics.length;
            metrics.forEach((metric, i) => {
                const x = metricWidth * i + metricWidth / 2;
                ctx.fillStyle = metric.color || '#84cc16';
                ctx.fillText(metric.value, x, metricsY);
                ctx.fillStyle = '#666';
                ctx.font = '12px monospace';
                ctx.fillText(metric.label, x, metricsY + 18);
                ctx.font = 'bold 16px monospace';
            });
        };

        const animate = () => {
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [currentYear, maxYears, portfolioValue, totalGains, investableFloat, underwritingProfit, chartData]);

    return (
        <div className="w-full h-full bg-black rounded-lg p-4">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ imageRendering: 'crisp-edges' }}
            />
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;