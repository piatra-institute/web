'use client';

import {
    useRef,
    useState,
    useCallback,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';



interface Point {
    x: number;
    y: number;
    id: number;
}

interface ViewerProps {
    epsilon: number;
    useExoticStructure: boolean;
    currentView: 'metric' | 'smooth' | 'topology';
    selectedPoints: number[];
    onEpsilonChange: (value: number) => void;
    onUseExoticStructureChange: (value: boolean) => void;
    onCurrentViewChange: (view: 'metric' | 'smooth' | 'topology') => void;
    onSelectedPointsChange: (points: number[]) => void;
}

const NUM_POINTS = 35;
const padding = 30;

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(
    ({
        epsilon,
        useExoticStructure,
        currentView,
        selectedPoints,
        onSelectedPointsChange,
        onCurrentViewChange,
    }, ref) => {
        const svgRef = useRef<SVGSVGElement>(null);
        const [points, setPoints] = useState<Point[]>([]);
        const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
        const [betti0, setBetti0] = useState(0);
        const [betti1, setBetti1] = useState(0);
        const [distance, setDistance] = useState<string>('N/A');
        // Generate random points
        const generatePoints = useCallback(() => {
            const newPoints: Point[] = [];
            for (let i = 0; i < NUM_POINTS; i++) {
                newPoints.push({
                    x: Math.random() * (dimensions.width - 2 * padding) + padding,
                    y: Math.random() * (dimensions.height - 2 * padding) + padding,
                    id: i,
                });
            }
            setPoints(newPoints);
            onSelectedPointsChange([]);
            setDistance('N/A');
        }, [dimensions, onSelectedPointsChange]);

        // Calculate distance between two points
        const calculateDistance = useCallback((p1: Point, p2: Point) => {
            return Math.hypot(p1.x - p2.x, p1.y - p2.y);
        }, []);

        // Calculate topological invariants
        const calculateTopology = useCallback((adj: number[][], numEdges: number) => {
            const visited = new Array(NUM_POINTS).fill(false);
            let components = 0;

            for (let i = 0; i < NUM_POINTS; i++) {
                if (!visited[i]) {
                    components++;
                    const queue = [i];
                    visited[i] = true;
                    while (queue.length > 0) {
                        const u = queue.shift()!;
                        for (const v of adj[u]) {
                            if (!visited[v]) {
                                visited[v] = true;
                                queue.push(v);
                            }
                        }
                    }
                }
            }

            setBetti0(components);
            const betti1 = numEdges - NUM_POINTS + components;
            setBetti1(Math.max(0, betti1));
        }, []);

        // Handle point click
        const handlePointClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
            const target = event.target as SVGElement;
            if (target.tagName !== 'circle') {
                onSelectedPointsChange([]);
                setDistance('N/A');
                return;
            }

            const clickedId = parseInt(target.getAttribute('data-id') || '0');

            if (currentView === 'metric') {
                const index = selectedPoints.indexOf(clickedId);
                if (index > -1) {
                    onSelectedPointsChange(selectedPoints.filter(id => id !== clickedId));
                } else {
                    if (selectedPoints.length >= 2) {
                        onSelectedPointsChange([...selectedPoints.slice(1), clickedId]);
                    } else {
                        onSelectedPointsChange([...selectedPoints, clickedId]);
                    }
                }
            } else {
                onSelectedPointsChange([clickedId]);
            }
        }, [currentView, selectedPoints, onSelectedPointsChange]);

        const drawMetricView = useCallback(() => {
            if (selectedPoints.length === 2 && points.length > 0) {
                const p1 = points[selectedPoints[0]];
                const p2 = points[selectedPoints[1]];

                if (p1 && p2) {
                    const dist = calculateDistance(p1, p2);
                    setDistance(`${dist.toFixed(1)} units`);

                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.x.toString());
                    line.setAttribute('y1', p1.y.toString());
                    line.setAttribute('x2', p2.x.toString());
                    line.setAttribute('y2', p2.y.toString());
                    line.setAttribute('stroke', '#84CC16'); // lime-500
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '5,5');
                    svgRef.current?.appendChild(line);
                } else {
                    setDistance('N/A');
                }
            } else {
                setDistance('N/A');
            }
        }, [selectedPoints, points, calculateDistance]);

        const drawSmoothView = useCallback(() => {
            const center = { x: dimensions.width / 2, y: dimensions.height / 2 };
            const length = 20;

            points.forEach(p => {
                let angle;
                if (useExoticStructure) {
                    // "Exotic" twisted flow around the center
                    const dx = p.x - center.x;
                    const dy = p.y - center.y;
                    angle = Math.atan2(dx, -dy); // Rotated 90 degrees from vector to center
                } else {
                    // "Standard" simple flow
                    angle = -Math.PI / 4; // Uniform direction
                }

                const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                arrow.setAttribute('x1', p.x.toString());
                arrow.setAttribute('y1', p.y.toString());
                arrow.setAttribute('x2', (p.x + length * Math.cos(angle)).toString());
                arrow.setAttribute('y2', (p.y + length * Math.sin(angle)).toString());
                arrow.setAttribute('stroke', '#BEF264'); // lime-300
                arrow.setAttribute('stroke-width', '2');
                arrow.setAttribute('marker-end', 'url(#arrowhead)');
                svgRef.current?.appendChild(arrow);
            });
        }, [points, useExoticStructure, dimensions]);

        const drawTopologyView = useCallback(() => {
            if (points.length === 0) return;

            const edges: [number, number][] = [];
            const adj: number[][] = new Array(NUM_POINTS).fill(0).map(() => []);

            // Build adjacency list and edges
            for (let i = 0; i < NUM_POINTS; i++) {
                for (let j = i + 1; j < NUM_POINTS; j++) {
                    if (points[i] && points[j]) {
                        const dist = calculateDistance(points[i], points[j]);
                        if (dist < epsilon) {
                            edges.push([i, j]);
                            adj[i].push(j);
                            adj[j].push(i);
                        }
                    }
                }
            }

            // Draw 2-simplices (triangles)
            const gSimplex = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (const edge of edges) {
                const [u, v] = edge;
                const neighborsU = new Set(adj[u]);
                const neighborsV = new Set(adj[v]);
                const commonNeighbors = [...neighborsU].filter(w => neighborsV.has(w));

                for (const w of commonNeighbors) {
                    if (u < v && v < w) {
                        const p1 = points[u], p2 = points[v], p3 = points[w];
                        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        polygon.setAttribute('points', `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`);
                        polygon.setAttribute('fill', '#84CC16'); // lime-500
                        polygon.setAttribute('stroke', '#365314'); // lime-900
                        polygon.setAttribute('stroke-width', '0.5');
                        polygon.setAttribute('opacity', '0.1');
                        gSimplex.appendChild(polygon);
                    }
                }
            }
            svgRef.current?.appendChild(gSimplex);

            // Draw edges
            const gEdge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            edges.forEach(edge => {
                const p1 = points[edge[0]], p2 = points[edge[1]];
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', p1.x.toString());
                line.setAttribute('y1', p1.y.toString());
                line.setAttribute('x2', p2.x.toString());
                line.setAttribute('y2', p2.y.toString());
                line.setAttribute('stroke', '#65A30D'); // lime-600
                line.setAttribute('stroke-width', '1.5');
                line.setAttribute('opacity', '0.8');
                gEdge.appendChild(line);
            });
            svgRef.current?.appendChild(gEdge);

            calculateTopology(adj, edges.length);
        }, [points, epsilon, calculateDistance, calculateTopology]);

        const drawPoints = useCallback(() => {
            const gPoint = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            points.forEach(p => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', p.x.toString());
                circle.setAttribute('cy', p.y.toString());
                circle.setAttribute('r', '6');
                circle.setAttribute('fill', '#84CC16'); // lime-500
                circle.setAttribute('data-id', p.id.toString());
                circle.setAttribute('class', 'cursor-pointer transition-all duration-200');

                if (selectedPoints.includes(p.id)) {
                    circle.setAttribute('stroke', '#ECFCCB'); // lime-50
                    circle.setAttribute('stroke-width', '3');
                    circle.setAttribute('fill', '#BEF264'); // lime-300
                }

                gPoint.appendChild(circle);
            });
            svgRef.current?.appendChild(gPoint);
        }, [points, selectedPoints]);

        // Update visualization
        const updateVisualization = useCallback(() => {
            if (!svgRef.current) return;

            const svg = svgRef.current;
            // Clear previous drawings
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }

            // Create arrowhead marker for smooth view
            if (currentView === 'smooth') {
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', 'arrowhead');
                marker.setAttribute('viewBox', '0 0 10 10');
                marker.setAttribute('refX', '8');
                marker.setAttribute('refY', '5');
                marker.setAttribute('markerWidth', '6');
                marker.setAttribute('markerHeight', '6');
                marker.setAttribute('orient', 'auto-start-reverse');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
                path.setAttribute('fill', '#BEF264'); // lime-300
                marker.appendChild(path);
                defs.appendChild(marker);
                svg.appendChild(defs);
            }

            switch (currentView) {
                case 'metric':
                    drawMetricView();
                    break;
                case 'smooth':
                    drawSmoothView();
                    break;
                case 'topology':
                    drawTopologyView();
                    break;
            }

            // Always draw points on top
            drawPoints();
        }, [
            drawMetricView, drawPoints, drawSmoothView, drawTopologyView, currentView
        ]);

        // Update visualization when dependencies change
        useEffect(() => {
            updateVisualization();
        }, [updateVisualization, points, epsilon, selectedPoints, currentView, useExoticStructure]);

        // Export functionality
        useImperativeHandle(ref, () => ({
            exportCanvas: () => {
                const svg = svgRef.current;
                if (!svg) return;

                // Clone the SVG to avoid modifying the original
                const svgClone = svg.cloneNode(true) as SVGSVGElement;
                
                // Get the actual dimensions from the SVG
                const bbox = svg.getBBox();
                const width = Math.max(dimensions.width, bbox.x + bbox.width + 20);
                const height = Math.max(dimensions.height, bbox.y + bbox.height + 20);
                
                // Set explicit dimensions on the clone
                svgClone.setAttribute('width', width.toString());
                svgClone.setAttribute('height', height.toString());
                svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
                
                // Add background
                const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                background.setAttribute('width', width.toString());
                background.setAttribute('height', height.toString());
                background.setAttribute('fill', 'black');
                svgClone.insertBefore(background, svgClone.firstChild);

                const svgData = new XMLSerializer().serializeToString(svgClone);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                // Set canvas dimensions
                canvas.width = width * 2; // 2x for better quality
                canvas.height = height * 2;
                
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    if (ctx) {
                        // Scale for better quality
                        ctx.scale(2, 2);
                        ctx.drawImage(img, 0, 0);
                    }
                    URL.revokeObjectURL(url);

                    const dataURL = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = 'geometry-topology-playground.png';
                    link.href = dataURL;
                    link.click();
                };

                img.src = url;
            },
        }));

        // Initialize and handle resize
        useEffect(() => {
            const updateDimensions = () => {
                if (svgRef.current) {
                    const rect = svgRef.current.getBoundingClientRect();
                    setDimensions({ width: rect.width, height: rect.height });
                }
            };

            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }, []);

        // Generate points only on mount and when dimensions are set
        useEffect(() => {
            if (dimensions.width > 0 && dimensions.height > 0 && points.length === 0) {
                generatePoints();
            }
        }, [dimensions, points.length, generatePoints]);

        // Listen for randomize events
        useEffect(() => {
            const handleRandomize = () => {
                generatePoints();
            };

            window.addEventListener('randomize-points', handleRandomize);
            return () => window.removeEventListener('randomize-points', handleRandomize);
        }, [generatePoints]);

        return (
            <div className="w-full h-full flex flex-col lg:flex-row gap-8 p-6">
                {/* Visualization */}
                <div className="flex-1 bg-black border border-gray-600 p-4">
                    {/* View Tabs */}
                    <div className="mb-4 border-b border-gray-600">
                        <nav className="flex -mb-px space-x-2" aria-label="Tabs">
                            <button
                                onClick={() => onCurrentViewChange('metric')}
                                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                    currentView === 'metric'
                                        ? 'border-lime-200 bg-lime-50 text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Metric View
                            </button>
                            <button
                                onClick={() => onCurrentViewChange('smooth')}
                                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                    currentView === 'smooth'
                                        ? 'border-lime-200 bg-lime-50 text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Smooth View
                            </button>
                            <button
                                onClick={() => onCurrentViewChange('topology')}
                                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                    currentView === 'topology'
                                        ? 'border-lime-200 bg-lime-50 text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Topological View
                            </button>
                        </nav>
                    </div>

                    {/* SVG Canvas */}
                    <div className="relative">
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="500"
                            className="bg-black cursor-crosshair"
                            onClick={handlePointClick}
                        />
                    </div>
                </div>

                {/* Info Panel */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-black border border-gray-600 p-6">
                        {currentView === 'metric' && (
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-lime-200">Metric Properties</h3>
                                <p className="text-sm text-gray-400 mb-3">Allowed Transformation: Isometry (rigid motion)</p>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p><strong>Invariant: Geodesic Distance</strong></p>
                                    <p className="pl-2">Selected Distance: <span className="font-semibold text-lime-200">{distance}</span></p>
                                </div>
                            </div>
                        )}

                        {currentView === 'smooth' && (
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-lime-200">Smooth Properties</h3>
                                <p className="text-sm text-gray-400 mb-3">Allowed Transformation: Diffeomorphism (smooth map)</p>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p><strong>Invariant: Smooth Structure (μ)</strong></p>
                                    <p className="pl-2">μ-Invariant: <span className="font-semibold text-lime-200">{useExoticStructure ? '1 (Exotic)' : '0 (Standard)'}</span></p>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    Milnor showed this can be non-zero for &quot;exotic&quot; spheres that are topologically normal.
                                </p>
                            </div>
                        )}

                        {currentView === 'topology' && (
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-lime-200">Topological Properties</h3>
                                <p className="text-sm text-gray-400 mb-3">Allowed Transformation: Homeomorphism (continuous map)</p>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p><strong>Invariant: Betti Numbers</strong></p>
                                    <p className="pl-2">B₀ (Components): <span className="font-semibold text-lime-200">{betti0}</span></p>
                                    <p className="pl-2">B₁ (Holes/Loops): <span className="font-semibold text-lime-200">{betti1}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

Viewer.displayName = 'Viewer';

export default Viewer;
