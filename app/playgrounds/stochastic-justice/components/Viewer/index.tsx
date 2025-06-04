import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { generateHeatmapData } from '../../logic';

interface ViewerProps {
  corruption: number;
  randomness: number;
  onMarkerDrag: (c: number, r: number) => void;
}

interface ChartArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const Viewer = forwardRef<{ exportImage: () => void }, ViewerProps>(
  ({ corruption, randomness, onMarkerDrag }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; v: number } | null>(null);
    const chartAreaRef = useRef<ChartArea | null>(null);
    const dataMatrixRef = useRef(generateHeatmapData(0.05));

    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (canvasRef.current) {
          const link = document.createElement('a');
          link.download = 'stochastic-justice.png';
          link.href = canvasRef.current.toDataURL();
          link.click();
        }
      },
    }));

    const drawHeatmap = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Define chart area with margins
      const margin = { top: 60, right: 60, bottom: 80, left: 80 };
      const chartArea: ChartArea = {
        left: margin.left,
        top: margin.top,
        right: rect.width - margin.right,
        bottom: rect.height - margin.bottom,
        width: rect.width - margin.left - margin.right,
        height: rect.height - margin.top - margin.bottom,
      };
      chartAreaRef.current = chartArea;

      // Draw heatmap cells first (before grid lines)
      const cellWidth = chartArea.width / 21;
      const cellHeight = chartArea.height / 21;

      dataMatrixRef.current.forEach((cell) => {
        const x = chartArea.left + cell.x * chartArea.width;
        const y = chartArea.top + (1 - cell.y) * chartArea.height;
        const alpha = Math.min(Math.max(cell.v, 0), 1);
        
        ctx.fillStyle = `rgba(89, 161, 79, ${alpha})`;
        ctx.fillRect(x - cellWidth / 2, y - cellHeight / 2, cellWidth, cellHeight);
      });

      // Draw grid and axes on top of heatmap
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;

      // Draw vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = chartArea.left + (i / 10) * chartArea.width;
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = chartArea.top + (i / 10) * chartArea.height;
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
      }

      // Draw axes
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, chartArea.bottom);
      ctx.lineTo(chartArea.right, chartArea.bottom);
      ctx.moveTo(chartArea.left, chartArea.top);
      ctx.lineTo(chartArea.left, chartArea.bottom);
      ctx.stroke();

      // Draw axis labels
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // X-axis labels
      for (let i = 0; i <= 10; i++) {
        const x = chartArea.left + (i / 10) * chartArea.width;
        ctx.fillText((i / 10).toFixed(1), x, chartArea.bottom + 10);
      }

      // Y-axis labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 10; i++) {
        const y = chartArea.top + (i / 10) * chartArea.height;
        ctx.fillText((1 - i / 10).toFixed(1), chartArea.left - 10, y);
      }

      // Draw axis titles
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Institutional Corruption Coefficient (C)', rect.width / 2, chartArea.bottom + 40);

      ctx.save();
      ctx.translate(20, rect.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Decision Process Stochasticity (R)', 0, 0);
      ctx.restore();

      // Draw zone annotations
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Ideal Fair Zone
      ctx.fillStyle = 'rgba(0, 200, 200, 0.15)';
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartArea.left, chartArea.top, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText('Ideal Fair', chartArea.left + chartArea.width * 0.1, chartArea.top + chartArea.height * 0.1);

      // Corrupt & Unfair Zone
      ctx.fillStyle = 'rgba(255, 100, 0, 0.15)';
      ctx.fillRect(chartArea.left + chartArea.width * 0.8, chartArea.top + chartArea.height * 0.8, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartArea.left + chartArea.width * 0.8, chartArea.top + chartArea.height * 0.8, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText('Corrupt & Unfair', chartArea.left + chartArea.width * 0.9, chartArea.top + chartArea.height * 0.9);

      // Random Justice Zone
      ctx.fillStyle = 'rgba(180, 180, 180, 0.15)';
      ctx.fillRect(chartArea.left + chartArea.width * 0.4, chartArea.top + chartArea.height * 0.4, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartArea.left + chartArea.width * 0.4, chartArea.top + chartArea.height * 0.4, chartArea.width * 0.2, chartArea.height * 0.2);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText('Random Justice', chartArea.left + chartArea.width * 0.5, chartArea.top + chartArea.height * 0.5);
    }, []);

    const drawOverlay = useCallback(() => {
      const canvas = overlayRef.current;
      const chartArea = chartAreaRef.current;
      if (!canvas || !chartArea) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw marker
      const step = 0.05;
      const C_snapped = Math.round(corruption / step) * step;
      const R_snapped = Math.round(randomness / step) * step;

      const markerX = chartArea.left + C_snapped * chartArea.width;
      const markerY = chartArea.top + (1 - R_snapped) * chartArea.height;

      ctx.beginPath();
      ctx.arc(markerX, markerY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffeb3b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Draw tooltip on hover
      if (hoveredCell) {
        const tooltipX = chartArea.left + hoveredCell.x * chartArea.width;
        const tooltipY = chartArea.top + (1 - hoveredCell.y) * chartArea.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        
        const text = `C: ${hoveredCell.x.toFixed(2)}, R: ${hoveredCell.y.toFixed(2)}, H*: ${hoveredCell.v.toFixed(3)}`;
        ctx.font = '12px sans-serif';
        const metrics = ctx.measureText(text);
        const padding = 8;
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 20;

        let boxX = tooltipX - boxWidth / 2;
        let boxY = tooltipY - boxHeight - 10;

        // Keep tooltip within canvas bounds
        if (boxX < 0) boxX = 0;
        if (boxX + boxWidth > rect.width) boxX = rect.width - boxWidth;
        if (boxY < 0) boxY = tooltipY + 10;

        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
      }
    }, [corruption, randomness, hoveredCell]);

    useEffect(() => {
      drawHeatmap();
      const handleResize = () => {
        drawHeatmap();
        drawOverlay();
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [drawHeatmap, drawOverlay]);

    useEffect(() => {
      drawOverlay();
    }, [drawOverlay]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const chartArea = chartAreaRef.current;
      if (!canvas || !chartArea) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within chart area
      if (x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom) {
        const plotX = (x - chartArea.left) / chartArea.width;
        const plotY = 1 - (y - chartArea.top) / chartArea.height;

        // Find closest cell
        const step = 0.05;
        const closestX = Math.round(plotX / step) * step;
        const closestY = Math.round(plotY / step) * step;

        const cell = dataMatrixRef.current.find(c => 
          Math.abs(c.x - closestX) < 0.001 && Math.abs(c.y - closestY) < 0.001
        );

        setHoveredCell(cell || null);
      } else {
        setHoveredCell(null);
      }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      const chartArea = chartAreaRef.current;
      if (!canvas || !chartArea || e.target !== overlayRef.current) return;

      const rect = canvas.getBoundingClientRect();
      setIsDragging(true);

      const handleMove = (event: MouseEvent) => {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const plotX = (x - chartArea.left) / chartArea.width;
        const plotY = 1 - (y - chartArea.top) / chartArea.height;

        const C = Math.max(0, Math.min(1, plotX));
        const R = Math.max(0, Math.min(1, plotY));

        onMarkerDrag(parseFloat(C.toFixed(2)), parseFloat(R.toFixed(2)));
      };

      const handleUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      handleMove(e.nativeEvent);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    }, [onMarkerDrag]);

    return (
      <div className="relative w-full h-full" onMouseDown={handleMouseDown}>
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
        <canvas 
          ref={overlayRef} 
          className="absolute inset-0 w-full h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
        />
      </div>
    );
  }
);

Viewer.displayName = 'Viewer';

export default Viewer;