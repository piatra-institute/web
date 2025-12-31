'use client';

import {
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useState,
} from 'react';

import {
    Vec3,
    KnotSpec,
    KnotDiagnostics,
    rotateXYZ,
    fmt,
} from '../../logic/knot';


export interface ViewerRef {
    resetView: () => void;
    jumpToBest: (rx: number, ry: number, rz: number) => void;
    resetEdits: () => void;
}

interface ViewerProps {
    curve: Vec3[];
    diagnostics: KnotDiagnostics;
    mode: 'A' | 'B' | 'SUM';
    knotA: KnotSpec;
    knotB: KnotSpec;
    rx: number;
    ry: number;
    rz: number;
    zoom: number;
    ropeThickness: number;
    onRotationChange: (rx: number, ry: number, rz: number) => void;
    onZoomChange: (zoom: number) => void;
    onCurveEdit?: (editedCurve: Vec3[]) => void;
}

// Apply Gaussian-weighted offset to nearby points
function applyLocalOffset(
    curve: Vec3[],
    centerIdx: number,
    offset: Vec3,
    radius: number
): Vec3[] {
    const n = curve.length;
    const result: Vec3[] = [];

    for (let i = 0; i < n; i++) {
        // Calculate distance along the curve (wrapping around)
        let dist = Math.abs(i - centerIdx);
        if (dist > n / 2) dist = n - dist;

        // Gaussian falloff
        const sigma = radius;
        const weight = Math.exp(-(dist * dist) / (2 * sigma * sigma));

        result.push({
            x: curve[i].x + offset.x * weight,
            y: curve[i].y + offset.y * weight,
            z: curve[i].z + offset.z * weight,
        });
    }

    return result;
}

// Find closest point on curve to screen position
function findClosestPoint(
    proj: { x: number; y: number; idx: number }[],
    screenX: number,
    screenY: number,
    maxDist: number
): number | null {
    let closest: { idx: number; dist: number } | null = null;

    for (const p of proj) {
        const dx = p.x - screenX;
        const dy = p.y - screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist && (!closest || dist < closest.dist)) {
            closest = { idx: p.idx, dist };
        }
    }

    return closest?.idx ?? null;
}

// Physics simulation step with fixed anchor, length constraints, and ground
function simulatePhysicsStep(
    points: Vec3[],
    anchorIdx: number,
    gravity: number,
    repulsion: number,
    groundY: number,
    segmentLengths: number[]
): Vec3[] {
    const n = points.length;
    const result: Vec3[] = points.map(p => ({ ...p }));

    // Region around anchor that is completely fixed
    const anchorRadius = Math.floor(n / 30);

    // Helper to check if point is fixed (anchor)
    const isFixed = (i: number) => {
        let distFromAnchor = Math.abs(i - anchorIdx);
        if (distFromAnchor > n / 2) distFromAnchor = n - distFromAnchor;
        return distFromAnchor < anchorRadius;
    };

    // Apply gravity to non-fixed points
    for (let i = 0; i < n; i++) {
        if (!isFixed(i)) {
            result[i].y += gravity;
        }
    }

    // Ground collision - stop at ground
    for (let i = 0; i < n; i++) {
        if (!isFixed(i) && result[i].y > groundY) {
            result[i].y = groundY;
        }
    }

    // Self-repulsion (light)
    const skipNeighbor = Math.max(10, Math.floor(n / 60));
    const repelDist = 0.15;

    for (let i = 0; i < n; i++) {
        if (isFixed(i)) continue;
        for (let j = i + skipNeighbor; j < n; j++) {
            if (n - j + i < skipNeighbor) continue;
            if (isFixed(j)) continue;

            const dx = result[j].x - result[i].x;
            const dy = result[j].y - result[i].y;
            const dz = result[j].z - result[i].z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < repelDist && dist > 0.001) {
                const force = repulsion * (repelDist - dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                const fz = (dz / dist) * force;

                result[i].x -= fx;
                result[i].y -= fy;
                result[i].z -= fz;
                result[j].x += fx;
                result[j].y += fy;
                result[j].z += fz;
            }
        }
    }

    // Enforce segment length constraints STRICTLY (many iterations)
    for (let iter = 0; iter < 20; iter++) {
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const targetLen = segmentLengths[i];

            const dx = result[j].x - result[i].x;
            const dy = result[j].y - result[i].y;
            const dz = result[j].z - result[i].z;
            const currentLen = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (currentLen > 0.0001 && Math.abs(currentLen - targetLen) > 0.0001) {
                // Move points to exact target length
                const correction = (currentLen - targetLen) / currentLen;

                const iFixed = isFixed(i);
                const jFixed = isFixed(j);

                if (iFixed && jFixed) {
                    // Both fixed, do nothing
                } else if (iFixed) {
                    // Only move j
                    result[j].x -= dx * correction;
                    result[j].y -= dy * correction;
                    result[j].z -= dz * correction;
                } else if (jFixed) {
                    // Only move i
                    result[i].x += dx * correction;
                    result[i].y += dy * correction;
                    result[i].z += dz * correction;
                } else {
                    // Move both equally
                    const half = correction * 0.5;
                    result[i].x += dx * half;
                    result[i].y += dy * half;
                    result[i].z += dz * half;
                    result[j].x -= dx * half;
                    result[j].y -= dy * half;
                    result[j].z -= dz * half;
                }
            }
        }
    }

    // Ground collision again after constraints
    for (let i = 0; i < n; i++) {
        if (!isFixed(i) && result[i].y > groundY) {
            result[i].y = groundY;
        }
    }

    return result;
}

// Compute all segment lengths
function computeSegmentLengths(points: Vec3[]): number[] {
    const n = points.length;
    const lengths: number[] = [];
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        const dz = points[j].z - points[i].z;
        lengths.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
    }
    return lengths;
}

// Find the topmost point (lowest Y = highest on screen)
function findTopmostPoint(points: Vec3[]): number {
    let topIdx = 0;
    let topY = Infinity;
    for (let i = 0; i < points.length; i++) {
        if (points[i].y < topY) {
            topY = points[i].y;
            topIdx = i;
        }
    }
    return topIdx;
}

const Viewer = forwardRef<ViewerRef, ViewerProps>(({
    curve,
    diagnostics,
    mode,
    knotA,
    knotB,
    rx,
    ry,
    rz,
    zoom,
    ropeThickness,
    onRotationChange,
    onZoomChange,
    onCurveEdit,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Edit mode state
    const [editMode, setEditMode] = useState(false);

    // Edits stored as offsets per point
    const [curveOffsets, setCurveOffsets] = useState<Vec3[]>([]);

    // Physics simulation state
    const [simulating, setSimulating] = useState(false);
    const [simulatedCurve, setSimulatedCurve] = useState<Vec3[] | null>(null);
    const [anchorIdx, setAnchorIdx] = useState<number>(0);
    const [segmentLengths, setSegmentLengths] = useState<number[]>([]);
    const simulationRef = useRef<number | null>(null);

    // Dragging state
    const dragRef = useRef<{
        mode: 'rotate' | 'edit';
        down: boolean;
        startX: number;
        startY: number;
        rx: number;
        ry: number;
        rz: number;
        editIdx: number | null;
        lastScreenX: number;
        lastScreenY: number;
    } | null>(null);

    // Store projected points for hit testing
    const projRef = useRef<{ x: number; y: number; z: number; idx: number }[]>([]);

    // Apply offsets to get the working curve
    const baseCurve = curve.map((p, i) => {
        const offset = curveOffsets[i] || { x: 0, y: 0, z: 0 };
        return {
            x: p.x + offset.x,
            y: p.y + offset.y,
            z: p.z + offset.z,
        };
    });

    // Use simulated curve if available, otherwise base curve
    const workingCurve = simulatedCurve || baseCurve;

    useImperativeHandle(ref, () => ({
        resetView: () => {
            onRotationChange(0.2, 0.6, 0);
            onZoomChange(1.0);
        },
        jumpToBest: (newRx: number, newRy: number, newRz: number) => {
            onRotationChange(newRx, newRy, newRz);
        },
        resetEdits: () => {
            setCurveOffsets([]);
        },
    }));

    // Reset offsets and simulation when base curve changes
    useEffect(() => {
        setCurveOffsets([]);
        setSimulatedCurve(null);
        setSimulating(false);
        if (simulationRef.current) {
            cancelAnimationFrame(simulationRef.current);
            simulationRef.current = null;
        }
    }, [mode, knotA.p, knotA.q, knotA.mirror, knotB.p, knotB.q, knotB.mirror, curve.length]);

    // Physics simulation loop
    useEffect(() => {
        if (!simulating || segmentLengths.length === 0) {
            if (simulationRef.current) {
                cancelAnimationFrame(simulationRef.current);
                simulationRef.current = null;
            }
            return;
        }

        let currentCurve = simulatedCurve || [...baseCurve];
        const currentAnchor = anchorIdx;
        const lengths = segmentLengths;

        const step = () => {
            // Run multiple physics steps per frame
            for (let i = 0; i < 5; i++) {
                currentCurve = simulatePhysicsStep(
                    currentCurve,
                    currentAnchor,
                    0.012,   // gravity
                    0.01,    // repulsion
                    2.0,     // ground Y position
                    lengths
                );
            }

            setSimulatedCurve([...currentCurve]);
            simulationRef.current = requestAnimationFrame(step);
        };

        simulationRef.current = requestAnimationFrame(step);

        return () => {
            if (simulationRef.current) {
                cancelAnimationFrame(simulationRef.current);
            }
        };
    }, [simulating, anchorIdx, segmentLengths]);

    // Resize handler
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resize() {
            if (!canvas) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        resize();

        return () => ro.disconnect();
    }, []);

    // Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        // Background
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        if (workingCurve.length < 2) return;

        const pts = workingCurve.map((p) => rotateXYZ(p, rx, ry, rz));

        // Find z range for normalization
        let minZ = Infinity, maxZ = -Infinity;
        for (const p of pts) {
            if (p.z < minZ) minZ = p.z;
            if (p.z > maxZ) maxZ = p.z;
        }
        const zRange = maxZ - minZ || 1;

        // Perspective project
        const fov = 3.5;
        const scale = 0.38 * Math.min(w, h) * zoom;

        const proj = pts.map((p, idx) => {
            const zOffset = p.z + fov;
            const k = 1 / zOffset;
            return {
                x: w / 2 + p.x * scale * k,
                y: h / 2 + p.y * scale * k,
                z: p.z,
                zNorm: (p.z - minZ) / zRange,
                idx,
            };
        });

        // Store for hit testing
        projRef.current = proj;

        // Count crossings for display
        let crossingCount = 0;
        const n = proj.length;
        const skipNeighbor = Math.max(10, Math.floor(n / 50));

        for (let i = 0; i < n; i++) {
            const i2 = (i + 1) % n;
            for (let j = i + skipNeighbor; j < n; j++) {
                if (n - j + i < skipNeighbor) continue;
                const j2 = (j + 1) % n;

                // Simple segment intersection check
                const ax1 = proj[i].x, ay1 = proj[i].y;
                const ax2 = proj[i2].x, ay2 = proj[i2].y;
                const bx1 = proj[j].x, by1 = proj[j].y;
                const bx2 = proj[j2].x, by2 = proj[j2].y;

                const dax = ax2 - ax1, day = ay2 - ay1;
                const dbx = bx2 - bx1, dby = by2 - by1;
                const det = dax * (-dby) - day * (-dbx);

                if (Math.abs(det) > 1e-9) {
                    const cx = bx1 - ax1, cy = by1 - ay1;
                    const tA = (cx * (-dby) - cy * (-dbx)) / det;
                    const tB = (dax * cy - day * cx) / det;

                    if (tA > 0.05 && tA < 0.95 && tB > 0.05 && tB < 0.95) {
                        crossingCount++;
                    }
                }
            }
        }

        // Sort segments by depth
        type Seg = { i: number; z: number; zNorm: number };
        const segs: Seg[] = [];
        for (let i = 0; i < proj.length; i++) {
            const j = (i + 1) % proj.length;
            const avgZ = 0.5 * (proj[i].z + proj[j].z);
            const avgZNorm = 0.5 * (proj[i].zNorm + proj[j].zNorm);
            segs.push({ i, z: avgZ, zNorm: avgZNorm });
        }
        segs.sort((a, b) => a.z - b.z);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments (far to near)
        for (const s of segs) {
            const i = s.i;
            const j = (i + 1) % proj.length;
            const a2 = proj[i];
            const b2 = proj[j];

            const dx = b2.x - a2.x;
            const dy = b2.y - a2.y;
            const segLen = Math.hypot(dx, dy);
            if (segLen < 0.3) continue;

            const brightness = 0.35 + 0.65 * s.zNorm;

            // Check if this point has been edited
            const hasOffset = curveOffsets[i] &&
                (Math.abs(curveOffsets[i].x) > 0.001 ||
                 Math.abs(curveOffsets[i].y) > 0.001 ||
                 Math.abs(curveOffsets[i].z) > 0.001);

            // Outline
            const outlineR = Math.round(20 * brightness);
            const outlineG = Math.round(40 * brightness);
            const outlineB = Math.round(10 * brightness);
            ctx.lineWidth = ropeThickness + 3;
            ctx.strokeStyle = `rgb(${outlineR}, ${outlineG}, ${outlineB})`;
            ctx.beginPath();
            ctx.moveTo(a2.x, a2.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();

            // Main rope - slightly different color if edited
            let mainR, mainG, mainB;
            if (hasOffset) {
                mainR = Math.round(200 * brightness);
                mainG = Math.round(150 * brightness);
                mainB = Math.round(50 * brightness);
            } else {
                mainR = Math.round(132 * brightness);
                mainG = Math.round(204 * brightness);
                mainB = Math.round(22 * brightness);
            }
            ctx.lineWidth = ropeThickness;
            ctx.strokeStyle = `rgb(${mainR}, ${mainG}, ${mainB})`;
            ctx.beginPath();
            ctx.moveTo(a2.x, a2.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();

            // Highlight
            if (s.zNorm > 0.6) {
                const highlightIntensity = (s.zNorm - 0.6) * 2.5;
                const hlR = Math.round(180 + 75 * highlightIntensity);
                const hlG = Math.round(230 + 25 * highlightIntensity);
                const hlB = Math.round(100 + 50 * highlightIntensity);
                const nx = -dy / segLen;
                const ny = dx / segLen;
                ctx.lineWidth = ropeThickness * 0.25;
                ctx.strokeStyle = `rgb(${hlR}, ${hlG}, ${hlB})`;
                ctx.beginPath();
                ctx.moveTo(a2.x + nx * ropeThickness * 0.25, a2.y + ny * ropeThickness * 0.25);
                ctx.lineTo(b2.x + nx * ropeThickness * 0.25, b2.y + ny * ropeThickness * 0.25);
                ctx.stroke();
            }
        }

        // In edit mode, show grab points along the curve
        if (editMode) {
            const step = Math.max(1, Math.floor(proj.length / 60));
            for (let i = 0; i < proj.length; i += step) {
                const p = proj[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(132, 204, 22, 0.4)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw ground plane during simulation
        if (simulating) {
            const groundY = 2.0;
            const groundWorldY = groundY;
            // Project ground plane (approximate as a line across the view)
            const fov = 3.5;
            const groundZ = 0;
            const groundK = 1 / (groundZ + fov);
            const groundScreenY = h / 2 + groundWorldY * scale * groundK;

            ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(0, groundScreenY);
            ctx.lineTo(w, groundScreenY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Ground label
            ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
            ctx.font = '11px ui-monospace, monospace';
            ctx.fillText('ground', 10, groundScreenY - 5);
        }

        // Show anchor point during simulation
        if (simulating && anchorIdx >= 0 && anchorIdx < proj.length) {
            const anchor = proj[anchorIdx];
            // Draw pin
            ctx.beginPath();
            ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Pin head
            ctx.beginPath();
            ctx.arc(anchor.x, anchor.y - 12, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Pin stem
            ctx.beginPath();
            ctx.moveTo(anchor.x, anchor.y - 7);
            ctx.lineTo(anchor.x, anchor.y);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // HUD overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const showingEdits = curveOffsets.some(o => o && (Math.abs(o.x) > 0.001 || Math.abs(o.y) > 0.001 || Math.abs(o.z) > 0.001));
        const hudHeight = (editMode || simulating) ? 104 : 84;
        ctx.fillRect(12, 12, 340, hudHeight);
        ctx.strokeStyle = simulating ? 'rgba(234, 179, 8, 0.5)' : 'rgba(132, 204, 22, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 12, 340, hudHeight);

        ctx.fillStyle = simulating ? '#eab308' : '#84cc16';
        ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

        let title: string;
        if (mode === 'A') {
            title = `Knot A: T(${knotA.p},${knotA.q})${knotA.mirror ? ' (mirror)' : ''}`;
        } else if (mode === 'B') {
            title = `Knot B: T(${knotB.p},${knotB.q})${knotB.mirror ? ' (mirror)' : ''}`;
        } else {
            title = 'A # B (connected sum)';
        }
        if (showingEdits) title += ' (edited)';
        if (simulating) title += ' [simulating]';

        ctx.fillText(title, 22, 34);

        ctx.fillStyle = '#9ca3af';
        ctx.fillText(
            `crossings: ${crossingCount}  writhe: ${diagnostics.crossing.writhe}`,
            22,
            54
        );
        ctx.fillText(
            `length: ${fmt(diagnostics.length)}  thickness: ${fmt(diagnostics.thickness)}`,
            22,
            74
        );

        if (editMode) {
            ctx.fillStyle = '#84cc16';
            ctx.fillText(
                'drag on knot to deform · shift+drag to rotate',
                22,
                94
            );
        } else if (simulating) {
            ctx.fillStyle = '#eab308';
            ctx.fillText(
                'physics: gravity + repulsion · click Stop to pause',
                22,
                94
            );
        }
    }, [workingCurve, rx, ry, rz, zoom, mode, knotA, knotB, diagnostics, ropeThickness, editMode, curveOffsets, simulating, anchorIdx]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

        const rect = canvas.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        // In edit mode without shift, try to grab the knot
        if (editMode && !e.shiftKey) {
            const hitIdx = findClosestPoint(projRef.current, localX, localY, 25);
            if (hitIdx !== null) {
                dragRef.current = {
                    mode: 'edit',
                    down: true,
                    startX: e.clientX,
                    startY: e.clientY,
                    rx, ry, rz,
                    editIdx: hitIdx,
                    lastScreenX: localX,
                    lastScreenY: localY,
                };
                return;
            }
        }

        // Otherwise, rotate
        dragRef.current = {
            mode: 'rotate',
            down: true,
            startX: e.clientX,
            startY: e.clientY,
            rx, ry, rz,
            editIdx: null,
            lastScreenX: localX,
            lastScreenY: localY,
        };
    }, [rx, ry, rz, editMode]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current?.down) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        if (dragRef.current.mode === 'edit' && dragRef.current.editIdx !== null) {
            // Calculate screen delta
            const screenDx = localX - dragRef.current.lastScreenX;
            const screenDy = localY - dragRef.current.lastScreenY;

            // Convert screen movement to 3D offset
            // We'll move in the camera's right and up directions
            const scale = 0.005 / zoom;

            // Get camera axes based on current rotation
            const cosRx = Math.cos(rx), sinRx = Math.sin(rx);
            const cosRy = Math.cos(ry), sinRy = Math.sin(ry);

            // Right vector (screen X direction in world space)
            const rightX = cosRy;
            const rightY = 0;
            const rightZ = -sinRy;

            // Up vector (screen Y direction in world space, inverted because screen Y is down)
            const upX = sinRy * sinRx;
            const upY = -cosRx;
            const upZ = cosRy * sinRx;

            const offset: Vec3 = {
                x: (screenDx * rightX - screenDy * upX) * scale,
                y: (screenDx * rightY - screenDy * upY) * scale,
                z: (screenDx * rightZ - screenDy * upZ) * scale,
            };

            // Apply offset with falloff to nearby points
            const newOffsets = applyLocalOffset(
                curveOffsets.length === workingCurve.length ? curveOffsets : workingCurve.map(() => ({ x: 0, y: 0, z: 0 })),
                dragRef.current.editIdx,
                offset,
                30 // radius of influence
            );

            setCurveOffsets(newOffsets);
            dragRef.current.lastScreenX = localX;
            dragRef.current.lastScreenY = localY;
        } else {
            // Rotation mode
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;

            const speed = 0.006;
            let newRz = dragRef.current.rz;
            if (e.shiftKey) {
                newRz = dragRef.current.rz + dx * speed;
            }

            onRotationChange(
                dragRef.current.rx + dy * speed,
                dragRef.current.ry + dx * speed,
                newRz
            );
        }
    }, [onRotationChange, zoom, rx, curveOffsets, workingCurve]);

    const onPointerUp = useCallback(() => {
        if (dragRef.current) {
            dragRef.current.down = false;
        }
    }, []);


    const toggleEditMode = useCallback(() => {
        setEditMode(prev => !prev);
    }, []);

    const resetEdits = useCallback(() => {
        setCurveOffsets([]);
        setSimulatedCurve(null);
        setSimulating(false);
    }, []);

    const toggleSimulation = useCallback(() => {
        if (!simulating) {
            // Start simulation - find topmost point as anchor and store segment lengths
            const startCurve = simulatedCurve || [...baseCurve];
            const topIdx = findTopmostPoint(startCurve);
            setAnchorIdx(topIdx);
            // Store original segment lengths to maintain rope length
            const lengths = computeSegmentLengths(startCurve);
            setSegmentLengths(lengths);
            if (!simulatedCurve) {
                setSimulatedCurve(startCurve);
            }
        }
        setSimulating(prev => !prev);
    }, [simulating, simulatedCurve, baseCurve]);

    const hasEdits = curveOffsets.some(o => o && (Math.abs(o.x) > 0.001 || Math.abs(o.y) > 0.001 || Math.abs(o.z) > 0.001));
    const hasSimulation = simulatedCurve !== null;

    return (
        <div className="w-full h-full bg-black relative">
            <canvas
                ref={canvasRef}
                className={`w-full h-full ${editMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                    onClick={toggleSimulation}
                    className={`px-3 py-2 text-sm border ${
                        simulating
                            ? 'bg-yellow-500 text-black border-yellow-500'
                            : 'bg-black/70 text-gray-300 border-lime-500/30 hover:border-lime-500'
                    }`}
                >
                    {simulating ? 'Stop' : 'Simulate'}
                </button>
                <button
                    onClick={toggleEditMode}
                    className={`px-3 py-2 text-sm border ${
                        editMode
                            ? 'bg-lime-500 text-black border-lime-500'
                            : 'bg-black/70 text-gray-300 border-lime-500/30 hover:border-lime-500'
                    }`}
                >
                    {editMode ? 'Exit Edit' : 'Edit Knot'}
                </button>
                {(hasEdits || hasSimulation) && (
                    <button
                        onClick={resetEdits}
                        className="px-3 py-2 text-sm bg-black/70 text-gray-300 border border-red-500/50 hover:border-red-500"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
