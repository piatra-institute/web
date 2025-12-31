import { FC, useEffect, useRef, MutableRefObject } from 'react';
import type { MechanismData } from '../../playground';
import { 
    drawAxes, 
    drawNode, 
    drawLink, 
    drawMechanismSpokes,
    calculateTrajectoryY,
    lerp
} from '../../logic';

interface ViewerProps {
    constriction: number;
    mechanisms: MechanismData[];
    isPlaying: boolean;
    animationRef: MutableRefObject<{ direction: number; targetConstriction: number }>;
    onAnimationUpdate: (newConstriction: number, newDirection: number) => void;
}

const colors = {
    pre: '#4caf50',
    threat: '#f44336',
    eustress: '#66bb6a',
    res: '#2196f3',
    rec: '#ff9800',
    chronic: '#9c27b0',
    growth: '#009688'
};

const Viewer: FC<ViewerProps> = ({
    constriction,
    mechanisms,
    isPlaying,
    animationRef,
    onAnimationUpdate,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationIdRef = useRef<number | undefined>(undefined);
    const currentConstrictionRef = useRef<number>(constriction);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const w = canvas.width;
            const h = canvas.height;
            
            if (isPlaying) {
                let newTarget = animationRef.current.targetConstriction + 0.003 * animationRef.current.direction;
                let newDirection = animationRef.current.direction;
                
                if (newTarget >= 1) {
                    newTarget = 1;
                    newDirection = -1;
                }
                if (newTarget <= -1) {
                    newTarget = -1;
                    newDirection = 1;
                }
                
                onAnimationUpdate(newTarget, newDirection);
            }
            
            currentConstrictionRef.current = lerp(
                currentConstrictionRef.current, 
                animationRef.current.targetConstriction, 
                0.06
            );
            
            // Clear canvas
            ctx.clearRect(0, 0, w, h);
            
            const margin = 60;
            const xPre = margin + (w - 2 * margin) * 0.12;
            const xTra = margin + (w - 2 * margin) * 0.32;
            const step = (w - 2 * margin) * 0.13;
            const xRes = xTra + step;
            const xRec = xRes + step;
            const xChr = xRec + step;
            const xGro = xChr + step;
            const yMid = h / 2;
            
            // Draw axes
            drawAxes(ctx, w, h, margin, yMid);
            
            const Δ = currentConstrictionRef.current;
            const yTra = yMid - Δ * (yMid - margin);
            const yExp = yMid + (1 - Δ) * (h - margin - yMid);
            
            // Calculate trajectory positions
            const yRes = calculateTrajectoryY('res', mechanisms, yMid, margin, h);
            const yRec = calculateTrajectoryY('rec', mechanisms, yMid, margin, h, Δ);
            const yChr = calculateTrajectoryY('chronic', mechanisms, yTra, margin, h);
            const yGro = calculateTrajectoryY('growth', mechanisms, yExp, margin, h);
            
            const label = Δ < 0 ? 'Eustress' : 'Trauma';
            const centerCol = Δ < 0 ? colors.eustress : colors.threat;
            
            // Draw connections
            drawLink(ctx, xPre, yMid, xTra, yTra);
            drawLink(ctx, xTra, yTra, xRes, yRes);
            drawLink(ctx, xTra, yTra, xRec, yRec);
            drawLink(ctx, xTra, yTra, xChr, yChr);
            drawLink(ctx, xTra, yTra, xGro, yGro);
            
            // Draw nodes
            drawNode(ctx, xPre, yMid, 'Pre', colors.pre);
            drawNode(ctx, xTra, yTra, label, centerCol);
            drawNode(ctx, xRes, yRes, 'Resilience', colors.res);
            drawNode(ctx, xRec, yRec, 'Recovery', colors.rec);
            drawNode(ctx, xChr, yChr, 'Chronic', colors.chronic);
            drawNode(ctx, xGro, yGro, 'Growth', colors.growth);
            
            // Draw mechanism spokes
            drawMechanismSpokes(ctx, xTra, yTra, mechanisms, w, h, margin);
            
            // Draw current delta value
            ctx.fillStyle = '#e6e6e6';
            ctx.font = '14px system-ui, sans-serif';
            ctx.fillText(`Δ=${Δ.toFixed(2)}`, margin + 6, margin - 20);
            
            animationIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [constriction, mechanisms, isPlaying, animationRef, onAnimationUpdate]);

    return (
        <canvas 
            ref={canvasRef}
            className="w-full h-full"
        />
    );
};

export default Viewer;