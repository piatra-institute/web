import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { runSimulation, Trajectory } from '../../logic';



interface ViewerProps {
    horizon: number;
    samples: number;
    riskWeight: number;
    boundaryWidth: number;
    stateNoise: number;
    observationNoise: number;
    goalState: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
    horizon,
    samples,
    riskWeight,
    boundaryWidth,
    stateNoise,
    observationNoise,
    goalState,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (canvasRef.current) {
                const link = document.createElement('a');
                link.download = `efe-visualization-${Date.now()}.png`;
                link.href = canvasRef.current.toDataURL();
                link.click();
            }
        }
    }));

    const drawTrajectories = (
        ctx: CanvasRenderingContext2D,
        trajectories: Trajectory[],
        horizon: number,
        boundaryWidth: number,
        width: number,
        height: number,
        goalState: number
    ) => {
        ctx.clearRect(0, 0, width, height);
        const goal_state = goalState;

        // Find data range
        let minS = 0, maxS = 0;
        for (const trajectory of trajectories) {
            for (const point of trajectory.path) {
                if (point.s < minS) minS = point.s;
                if (point.s > maxS) maxS = point.s;
            }
        }
        // Add padding to range and include boundary
        minS = Math.min(minS, goal_state - boundaryWidth);
        maxS = Math.max(maxS, goal_state + boundaryWidth);
        const range = maxS - minS || 1;
        minS -= range * 0.1;
        maxS += range * 0.1;

        // Map coordinates
        const mapX = (t: number) => (t / horizon) * width;
        const mapY = (s: number) => height - ((s - minS) / (maxS - minS)) * height;

        // Draw boundary
        ctx.fillStyle = 'rgba(132, 204, 22, 0.2)'; // lime-500 with opacity
        const boundaryTopY = mapY(goal_state + boundaryWidth / 2);
        const boundaryBottomY = mapY(goal_state - boundaryWidth / 2);
        ctx.fillRect(0, boundaryTopY, width, boundaryBottomY - boundaryTopY);

        // Draw goal line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mapX(0), mapY(goal_state));
        ctx.lineTo(mapX(horizon), mapY(goal_state));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw trajectories
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1.5;
        for (const trajectory of trajectories) {
            ctx.beginPath();
            ctx.moveTo(mapX(trajectory.path[0].t), mapY(trajectory.path[0].s));
            for (let i = 1; i < trajectory.path.length; i++) {
                ctx.lineTo(mapX(trajectory.path[i].t), mapY(trajectory.path[i].s));
            }
            ctx.stroke();
        }
    };

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Function to update canvas and redraw
        const updateCanvas = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 300; // Fixed height

            // Run simulation and draw after canvas is sized
            const { trajectories } = runSimulation(horizon, samples, riskWeight, boundaryWidth, stateNoise, observationNoise, goalState);
            drawTrajectories(ctx, trajectories, horizon, boundaryWidth, canvas.width, canvas.height, goalState);
        };

        // Initial draw with small delay to ensure proper mounting
        const timeoutId = setTimeout(() => {
            updateCanvas();
        }, 100);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            updateCanvas();
        });
        resizeObserver.observe(container);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [horizon, samples, riskWeight, boundaryWidth, stateNoise, observationNoise, goalState]);

    const simulationResult = runSimulation(horizon, samples, riskWeight, boundaryWidth, stateNoise, observationNoise, goalState);

    const chartData = [
        {
            name: 'Expected Free Energy (EFE)',
            value: simulationResult.meanEFE,
        },
        {
            name: 'KL Divergence',
            value: simulationResult.meanKL,
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black p-3 shadow-lg border border-gray-800" style={{ backgroundColor: '#000000' }}>
                    <p className="text-white font-semibold mb-2" style={{ color: '#ffffff' }}>{label}</p>
                    <p className="text-sm text-gray-300" style={{ color: '#d1d5db' }}>
                        Value: {payload[0].value.toFixed(4)} nats
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-6xl space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        EFE Monte-Carlo Visualization
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Simulating {samples} trajectories over {horizon} time steps
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Sampled Trajectories</h3>
                        <div ref={containerRef} className="relative w-full">
                            <canvas
                                ref={canvasRef}
                                className="w-full bg-gray-900"
                                style={{ height: '300px' }}
                            />
                        </div>
                        <div className="flex justify-center items-center space-x-6 mt-4 text-sm text-gray-400">
                            <div className="flex items-center">
                                <span className="h-4 w-4 bg-lime-500/20 mr-2"></span>
                                <span>Goal Boundary</span>
                            </div>
                            <div className="flex items-center">
                                <span className="h-1 w-4 bg-blue-500/20 mr-2"></span>
                                <span>Sampled Path</span>
                            </div>
                            <div className="flex items-center">
                                <span className="h-px w-4 border-t-2 border-dashed border-red-400 mr-2"></span>
                                <span>Goal State</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">EFE vs KL Divergence</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    angle={-20}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    label={{ value: 'Value (nats)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', offset: -15 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="rgba(132, 204, 22, 0.8)"
                                    stroke="#84cc16"
                                    strokeWidth={2}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black border border-gray-800 p-6">
                        <h4 className="font-bold text-lime-400 mb-4">Model Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">State Noise (σ):</span>
                                <span className="font-semibold text-white">{stateNoise.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Observation Noise:</span>
                                <span className="font-semibold text-white">{observationNoise.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Goal State (μ*):</span>
                                <span className="font-semibold text-white">{goalState.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 p-6">
                        <h4 className="font-bold text-lime-400 mb-4">Simulation Results</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Mean EFE:</span>
                                <span className="font-semibold text-white">
                                    {simulationResult.meanEFE.toFixed(4)} nats
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Mean KL Divergence:</span>
                                <span className="font-semibold text-white">
                                    {simulationResult.meanKL.toFixed(4)} nats
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Trajectories Shown:</span>
                                <span className="font-semibold text-white">
                                    {Math.min(simulationResult.trajectories.length, 200)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;