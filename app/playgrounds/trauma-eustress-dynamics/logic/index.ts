import type { MechanismData } from '../playground';

export const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

export const drawAxes = (
    ctx: CanvasRenderingContext2D, 
    w: number, 
    h: number, 
    margin: number, 
    yMid: number
): void => {
    ctx.strokeStyle = '#4d4d4d';
    ctx.lineWidth = 1.4;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin, yMid);
    ctx.lineTo(w - margin, yMid);
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, h - margin);
    ctx.stroke();
    
    // Draw dashed middle line
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(margin, yMid);
    ctx.lineTo(w - margin, yMid);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Time →', w - margin - 60, yMid - 10);
    
    ctx.save();
    ctx.translate(margin + 12, margin + 12);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('+Narrowing | –Expansion', 0, 0);
    ctx.restore();
};

export const drawNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    color: string,
    radius: number = 10
): void => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '14px system-ui, sans-serif';
    const textWidth = ctx.measureText(label).width;
    ctx.fillText(label, x - textWidth / 2, y - radius - 6);
};

export const drawLink = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = '#888',
    lineWidth: number = 1.4
): void => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

export const calculateDelta = (
    trajectory: 'res' | 'rec' | 'chronic' | 'growth',
    mechanisms: MechanismData[]
): number => {
    return mechanisms.reduce((sum, mechanism) => {
        return sum + mechanism.weight * (mechanism.inf[trajectory] || 0);
    }, 0);
};

export const calculateTrajectoryY = (
    trajectory: 'res' | 'rec' | 'chronic' | 'growth',
    mechanisms: MechanismData[],
    baseY: number,
    margin: number,
    canvasHeight: number,
    constriction?: number
): number => {
    const hRange = canvasHeight / 2 - margin;
    const delta = calculateDelta(trajectory, mechanisms);
    
    let y = baseY;
    
    if (trajectory === 'rec' && constriction !== undefined) {
        y = baseY - constriction * 0.5 * hRange;
    }
    
    y += delta * hRange;
    
    return clamp(y, margin, canvasHeight - margin);
};

export const drawMechanismSpokes = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    mechanisms: MechanismData[],
    canvasWidth: number,
    canvasHeight: number,
    margin: number
): void => {
    const baseOffset = 60;
    const extraOffset = 40;
    const nodeRadius = 9;
    
    mechanisms.forEach((mechanism, index) => {
        if (mechanism.weight === 0) return;
        
        const angle = -Math.PI / 2 + index * Math.PI / 2;
        const offset = baseOffset + extraOffset * mechanism.weight;
        
        let spokeX = centerX + offset * Math.cos(angle);
        let spokeY = centerY + offset * Math.sin(angle);
        
        spokeX = clamp(spokeX, margin, canvasWidth - margin);
        spokeY = clamp(spokeY, margin, canvasHeight - margin);
        
        drawLink(ctx, centerX, centerY, spokeX, spokeY, mechanism.color, 1 + 2 * mechanism.weight);
        drawNode(ctx, spokeX, spokeY, mechanism.name, mechanism.color, nodeRadius);
    });
};