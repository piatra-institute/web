export type Trajectory = 'res' | 'rec' | 'chronic' | 'growth';

export interface MechanismData {
    name: string;
    color: string;
    inf: {
        res: number;
        rec: number;
        chronic: number;
        growth: number;
    };
    weight: number;
}

/**
 * Default mechanism coefficients (beta-weights). Each mechanism contributes a
 * signed influence to each of the four post-event trajectories, scaled by its
 * slider weight. Positive influence pushes a trajectory upward (toward
 * narrowing), negative influence pushes it downward (toward expansion).
 *
 * Sign conventions follow the trauma-response literature cited in the panels:
 * threat appraisal and rumination raise chronic narrowing, social support and
 * neuro-flexibility lower it, and neuro-flexibility is the dominant driver of
 * post-traumatic growth.
 */
export const defaultMechanisms: MechanismData[] = [
    { name: 'Appraisal', color: '#ff5252', inf: { res: -0.10, rec: 0, chronic: 0.15, growth: -0.10 }, weight: 1 },
    { name: 'Rumination', color: '#ffb300', inf: { res: 0, rec: 0.08, chronic: 0.20, growth: 0 }, weight: 1 },
    { name: 'Social', color: '#64b5f6', inf: { res: -0.13, rec: -0.08, chronic: 0, growth: 0 }, weight: 1 },
    { name: 'NeuroFlex', color: '#4db6ac', inf: { res: 0, rec: 0, chronic: 0, growth: -0.18 }, weight: 1 },
];

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
    ctx.fillText('+Narrowing | -Expansion', 0, 0);
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
    trajectory: Trajectory,
    mechanisms: MechanismData[]
): number => {
    return mechanisms.reduce((sum, mechanism) => {
        return sum + mechanism.weight * (mechanism.inf[trajectory] || 0);
    }, 0);
};

/**
 * Sign of the threat appraisal of the event. Δ > 0 is distress (narrowing),
 * Δ < 0 is eustress (expansion), Δ = 0 is the neutral threshold separating the
 * two regimes. Returns 'distress', 'eustress', or 'threshold'.
 */
export const stressRegime = (constriction: number): 'distress' | 'eustress' | 'threshold' => {
    if (constriction > 0) return 'distress';
    if (constriction < 0) return 'eustress';
    return 'threshold';
};

/**
 * Normalised vertical position of a trajectory in [-1, +1] bandwidth units,
 * where +1 is full narrowing and -1 is full expansion. This is the
 * canvas-independent core the Viewer renders: resilience and recovery hang off
 * the baseline (0), chronic off the event node yTra = +Δ, growth off the
 * expansion node yExp = -(1 - Δ). Recovery additionally relaxes by Δ * 0.5
 * toward expansion, modelling the delayed rebound below baseline.
 */
export const trajectoryBandwidth = (
    trajectory: Trajectory,
    mechanisms: MechanismData[],
    constriction: number
): number => {
    const delta = calculateDelta(trajectory, mechanisms);
    switch (trajectory) {
        case 'res':
            return delta;
        case 'rec':
            return -constriction * 0.5 + delta;
        case 'chronic':
            return constriction + delta;
        case 'growth':
            return -(1 - constriction) + delta;
    }
};

export const calculateTrajectoryY = (
    trajectory: Trajectory,
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