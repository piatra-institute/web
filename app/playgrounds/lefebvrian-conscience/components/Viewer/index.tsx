import React from 'react';

import {
    Agent,
} from '../../lib/agent';

interface ViewerProps {
    agents: Agent[];
    width: number;
    height: number;
}

const Viewer: React.FC<ViewerProps> = ({ agents, width, height }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = React.useRef<number>();

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const render = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            agents.forEach(agent => agent.draw(ctx));
            animationFrameIdRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [agents, width, height]);

    return (
        <canvas
            ref={canvasRef}
            id="simulationCanvas"
            width={width}
            height={height}
            style={{
                display: 'block',
                width: `${width}px`,
                height: `${height}px`
            }}
        />
    );
};

export default Viewer;
