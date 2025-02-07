import {
    useRef,
    useCallback,
    useState,
    useEffect,
} from 'react';

import Settings from '../Settings';
import Analysis from '../Analysis';

import {
    AnalysisData,
    Pin,
    Bin,
    BinConfig,
    DrawState,
    GridConfig,
} from '../index';



function calculatePinBias(pin: Pin, targetShape: DrawState): number {
    // Convert y-coordinate to probability of going right (0.0-1.0)
    const rowPosition = (pin.x - WIDTH * 0.25) / (WIDTH * 0.5);
    const targetY = HEIGHT - BIN_CONFIG.height;

    // Sample points near pin's vertical path
    const sampleWidth = WIDTH / PIN_GRID.cols;
    const desiredX = targetShape.points.find(point => {
        return Math.abs(point.y - targetY) < 5 &&
            Math.abs(point.x - (pin.x + rowPosition * sampleWidth)) < sampleWidth;
    })?.x ?? pin.x;

    // Bias right if target is to the right
    return desiredX > pin.x ? 0.8 : 0.2;
}


class Bead {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    active: boolean;
    binIndex: number | null;
    frozen: boolean;

    bounceFactor = BOUNCE_FACTOR;


    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.active = true;
        this.binIndex = null;
        this.frozen = false;
    }

    checkCollisionWithFrozenBeads(otherBeads: Bead[]): number {
        let highestCollision = HEIGHT;

        otherBeads.forEach(otherBead => {
            if (otherBead === this || !otherBead.frozen) return;
            if (this.binIndex !== null && otherBead.binIndex !== this.binIndex) return;

            const dx = this.x - otherBead.x;
            const dy = this.y - otherBead.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherBead.radius) {
                const collisionY = otherBead.y - this.radius * 2;
                highestCollision = Math.min(highestCollision, collisionY);

                const centeringForce = 0.1;
                if (Math.abs(this.vx) < 1) {
                    this.vx += (dx > 0 ? -centeringForce : centeringForce);
                }
            }
        });

        return highestCollision;
    }

    update(
        otherBeads: Bead[], pins: Pin[], bins: Bin[],
        areaOfEffect: boolean, morphodynamics: boolean,
        drawState: DrawState,
        options: {
            bounceFactor: number;
        },
    ): void {
        this.bounceFactor = options.bounceFactor;

        if (this.frozen) return;

        this.vy += GRAVITY;
        this.vx *= FRICTION;

        const nextX = this.x + this.vx;
        const nextY = this.y + this.vy;

        if (this.binIndex !== null) {
            const bin = bins[this.binIndex];

            if (nextX - this.radius < bin.x || nextX + this.radius > bin.x + bin.width) {
                this.vx *= -this.bounceFactor;
                this.x = nextX - this.radius < bin.x ?
                    bin.x + this.radius :
                    bin.x + bin.width - this.radius;
            } else {
                this.x = nextX;
            }
        } else {
            this.x = nextX;
        }

        const collisionY = this.checkCollisionWithFrozenBeads(otherBeads);

        if (nextY + this.radius > collisionY) {
            this.y = collisionY;
            this.vy *= -this.bounceFactor;

            if (Math.abs(this.vy) < STOP_THRESHOLD && Math.abs(this.vx) < STOP_THRESHOLD) {
                this.frozen = true;
                this.vx = 0;
                this.vy = 0;
            }
        } else {
            this.y = nextY;
        }

        if (this.y + this.radius > HEIGHT) {
            this.y = HEIGHT - this.radius;
            this.vy *= -this.bounceFactor;

            if (Math.abs(this.vy) < STOP_THRESHOLD && Math.abs(this.vx) < STOP_THRESHOLD) {
                this.frozen = true;
                this.vx = 0;
                this.vy = 0;
            }
        }

        pins.forEach(pin => {
            const dx = this.x - pin.x;
            const dy = this.y - pin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + PIN_RADIUS) {
                const isVerticalCollision = Math.abs(dx) < VERTICAL_COLLISION_THRESHOLD * PIN_RADIUS &&
                    dy < 0 &&
                    Math.abs(this.vx) < 1;

                if (isVerticalCollision) {
                    const direction = Math.random() < 0.5 ? -1 : 1;
                    this.vx = direction * RANDOM_DEFLECTION_SPEED;
                    this.vy *= -this.bounceFactor;
                } else {
                    const angle = Math.atan2(dy, dx);
                    this.x = pin.x + Math.cos(angle) * (this.radius + PIN_RADIUS);
                    this.y = pin.y + Math.sin(angle) * (this.radius + PIN_RADIUS);

                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    this.vx = Math.cos(angle) * speed * this.bounceFactor;
                    this.vy = Math.sin(angle) * speed * this.bounceFactor;
                }
            }

            if (morphodynamics && distance < this.radius + PIN_RADIUS) {
                const bias = calculatePinBias(pin, drawState);
                this.vx = (Math.random() < bias ? 1 : -1) * RANDOM_DEFLECTION_SPEED;
                this.vy *= -this.bounceFactor;
            }

            if (areaOfEffect && pin.aoe) {
                const dx = this.x - pin.x;
                const dy = this.y - pin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < pin.aoeSize) {
                    const angle = Math.atan2(dy, dx);
                    const distanceFactor = 1 - (distance / pin.aoeSize); // Smoothly reduce effect at edges
                    const maxSpeedChange = 0.1; // Limit maximum speed change per frame

                    // Apply speed modification with distance falloff and capped change
                    this.vx += Math.cos(angle) * pin.aoeSpeed * distanceFactor * maxSpeedChange;
                    this.vy += Math.sin(angle) * pin.aoeSpeed * distanceFactor * maxSpeedChange;

                    // Enforce maximum velocity to prevent excessive acceleration
                    const maxVelocity = 10;
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed > maxVelocity) {
                        const scale = maxVelocity / currentSpeed;
                        this.vx *= scale;
                        this.vy *= scale;
                    }
                }
            }
        });

        if (this.y + this.radius > HEIGHT - BIN_CONFIG.height && this.binIndex === null) {
            const binIndex = Math.floor(this.x / BIN_CONFIG.width);
            if (binIndex >= 0 && binIndex < BIN_CONFIG.count) {
                this.binIndex = binIndex;
            }
        }

        otherBeads.forEach(otherBead => {
            if (otherBead === this || otherBead.frozen) return;

            const dx = this.x - otherBead.x;
            const dy = this.y - otherBead.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherBead.radius) {
                const nx = dx / distance;
                const ny = dy / distance;
                const relativeVx = this.vx - otherBead.vx;
                const relativeVy = this.vy - otherBead.vy;
                const impulse = 2 * (relativeVx * nx + relativeVy * ny) / 2;

                this.vx -= impulse * nx * this.bounceFactor;
                this.vy -= impulse * ny * this.bounceFactor;
                otherBead.vx += impulse * nx * this.bounceFactor;
                otherBead.vy += impulse * ny * this.bounceFactor;

                const overlap = (this.radius + otherBead.radius - distance) / 2;
                this.x += nx * overlap;
                this.y += ny * overlap;
                otherBead.x -= nx * overlap;
                otherBead.y -= ny * overlap;
            }
        });
    }
}


const BEAD_RADIUS = 6;
const PIN_RADIUS = 8;
const GRAVITY = 0.4;
const BOUNCE_FACTOR = 0.5;
const FRICTION = 0.98;
const VERTICAL_COLLISION_THRESHOLD = 0.1;
const RANDOM_DEFLECTION_SPEED = 3;
const STOP_THRESHOLD = 0.1;
const MAX_BEADS = 1000;
const BEAD_ADD_INTERVAL = 200;
const AOE_CHANCE = 0.2;

const WIDTH = 600;
const HEIGHT = 700;

const PIN_GRID: GridConfig = {
    rows: 8,
    cols: 9,
    startY: 150,
    spacing: {
        horizontal: 60,
        vertical: 50,
    },
};

const BIN_CONFIG: BinConfig = {
    height: 150,
    width: BEAD_RADIUS * 2,
    count: Math.floor(WIDTH / (BEAD_RADIUS * 2))
};

const BACKGROUND_COLOR = '#141414';
const PIN_COLOR = '#404040';
const AOE_FAST_COLOR = '#ff0000';
const AOE_SLOW_COLOR = '#00ff00';
const BEAD_COLOR = '#bef264';
const BIN_COLOR = '#454545';
const FROZEN_BEAD_COLOR = '#84cc16';
const MORPHOLINE_COLOR = '#ff0000';


const FallingBeads: React.FC = () => {
    const timeRef = useRef(0);
    const analysisRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [beads, setBeads] = useState<Bead[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [areaOfEffect, setAreaOfEffect] = useState(false);
    const [morphodynamics, setMorphodynamics] = useState(false);
    const [drawState, setDrawState] = useState<DrawState>({ points: [], isDrawing: false });

    const [maxBeads, setMaxBeads] = useState(MAX_BEADS);
    const [releaseInterval, setReleaseInterval] = useState(BEAD_ADD_INTERVAL);
    const [bounceFactor, setBounceFactor] = useState(BOUNCE_FACTOR);

    const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);



    const generatePins = (
        areaOfEffect: boolean,
    ): Pin[] => {
        const pins: Pin[] = [];
        const startX = (WIDTH - (PIN_GRID.cols - 1) * PIN_GRID.spacing.horizontal) / 2;

        for (let row = 0; row < PIN_GRID.rows; row++) {
            const offsetX = row % 2 === 0 ? 0 : PIN_GRID.spacing.horizontal / 2;
            const cols = row % 2 === 0 ? PIN_GRID.cols : PIN_GRID.cols - 1;

            for (let col = 0; col < cols; col++) {
                const aoe = areaOfEffect ? Math.random() < AOE_CHANCE : false;
                let aoeSize = 0;
                let aoeSpeed = 0;
                if (aoe) {
                    aoeSize = Math.random() * 30 + BEAD_RADIUS * 2;
                    aoeSpeed = (Math.random() * 10 + 5) * (Math.random() < 0.5 ? -1 : 1);
                }

                pins.push({
                    x: startX + col * PIN_GRID.spacing.horizontal + offsetX,
                    y: PIN_GRID.startY + row * PIN_GRID.spacing.vertical,
                    aoe,
                    aoeSize,
                    aoeSpeed,
                });
            }
        }
        return pins;
    };

    const generateBins = (): Bin[] => {
        const bins: Bin[] = [];
        const y = HEIGHT - BIN_CONFIG.height;

        for (let i = 0; i < BIN_CONFIG.count; i++) {
            bins.push({
                x: i * BIN_CONFIG.width,
                y,
                width: BIN_CONFIG.width,
                height: BIN_CONFIG.height
            });
        }
        return bins;
    };

    const [pins, setPins] = useState(generatePins(areaOfEffect));
    const bins = generateBins();

    const gameStateRef = useRef({ pins, beads, bins });


    const addBead = useCallback(() => {
        if (beads.length >= maxBeads) return;

        const newBead = new Bead(WIDTH / 2, BEAD_RADIUS, BEAD_RADIUS);
        setBeads(prevBeads => [...prevBeads, newBead]);
    }, [
        beads,
        maxBeads,
    ]);


    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!morphodynamics) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        setDrawState({
            points: [{
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }],
            isDrawing: true
        });
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!morphodynamics || !drawState.isDrawing) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        setDrawState(prev => ({
            ...prev,
            points: [...prev.points, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }]
        }));
    };

    const handleCanvasMouseUp = () => {
        setDrawState(prev => ({ ...prev, isDrawing: false }));
    };

    const reset = () => {
        setBeads([]);
        setIsRunning(false);
        setAreaOfEffect(false);
        setMorphodynamics(false);
        setDrawState({ points: [], isDrawing: false });
        setAnalysisData([]);
    }


    const formatValue = (value: any) => {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
          return 0;
        }
        return Number(value.toFixed(3));
    }

    const calculateTrajectoryVariance = useCallback((activeBeads: Bead[]) => {
        try {
            if (!Array.isArray(activeBeads) || activeBeads.length === 0) return 0;

            const validBeads = activeBeads.filter(ball =>
                ball && typeof ball.vy === 'number' && isFinite(ball.vy));

            if (validBeads.length === 0) return 0;

            const avgVy = validBeads.reduce((sum, ball) => sum + ball.vy, 0) / validBeads.length;
            return formatValue(validBeads.reduce((acc, ball) =>
                acc + Math.pow(ball.vy - avgVy, 2), 0) / validBeads.length);
        } catch (error) {
            console.error('Variance calculation error:', error);
            return 0;
        }
    }, []);

    const calculateLocalEntropy = (bins: Bin[], beads: Bead[]) => {
        const beadsPerBin = new Array(bins.length).fill(0);
        beads.forEach(ball => {
            if (ball.binIndex !== null) {
                beadsPerBin[ball.binIndex]++;
            }
        });

        const total = beadsPerBin.reduce((a, b) => a + b, 0);
        if (total === 0) return 0;

        return -beadsPerBin.reduce((acc, count) => {
            const p = count / total;
            return acc + (p === 0 ? 0 : p * Math.log2(p));
        }, 0);
    }

    const calculateAOEImpact = (pins: Pin[], beads: Bead[]) => {
        const aoePins = pins.filter(pin => pin.aoe);
        if (aoePins.length === 0) return 0;

        return aoePins.reduce((acc, pin) => {
            const affectedBeads = beads.filter(ball =>
                Math.hypot(ball.x - pin.x, ball.y - pin.y) <= pin.aoeSize);
            return acc + (affectedBeads.length * Math.abs(pin.aoeSpeed));
        }, 0) / aoePins.length;
    }


    /** Game state */
    useEffect(() => {
        gameStateRef.current = { pins, beads, bins };
    }, [pins, beads, bins]);

    /** Generate pins */
    useEffect(() => {
        setPins(generatePins(areaOfEffect));
    }, [
        areaOfEffect,
    ]);

    /** Clear morpholine */
    useEffect(() => {
        if (!morphodynamics) {
            setDrawState({ points: [], isDrawing: false });
        }
    }, [
        morphodynamics,
    ]);

    /** Render */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = (): void => {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            ctx.fillStyle = BACKGROUND_COLOR;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            pins.forEach(pin => {
                ctx.beginPath();
                ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = PIN_COLOR;
                ctx.fill();
                ctx.closePath();

                if (pin.aoe) {
                    ctx.beginPath();
                    ctx.arc(pin.x, pin.y, pin.aoeSize, 0, Math.PI * 2);
                    ctx.strokeStyle = pin.aoeSpeed > 0 ? AOE_FAST_COLOR : AOE_SLOW_COLOR;
                    ctx.stroke();
                    ctx.closePath();
                }
            });

            bins.forEach((bin) => {
                ctx.beginPath();
                ctx.rect(bin.x, bin.y, bin.width, bin.height);
                ctx.strokeStyle = BIN_COLOR;
                ctx.stroke();
                ctx.closePath();
            });

            beads.forEach(ball => {
                ball.update(
                    beads, pins, bins,
                    areaOfEffect, morphodynamics, drawState,
                    {
                        bounceFactor,
                    },
                );

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.frozen ? FROZEN_BEAD_COLOR : BEAD_COLOR;
                ctx.fill();
                ctx.closePath();
            });

            if (morphodynamics && drawState.points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(drawState.points[0].x, drawState.points[0].y);
                drawState.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.strokeStyle = MORPHOLINE_COLOR;
                ctx.stroke();
            }

            if (isRunning) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [
        beads,
        isRunning,
        pins,
        bins,
        areaOfEffect,
        morphodynamics,
        drawState,
        bounceFactor,
    ]);

    /** Bead release interval */
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(addBead, releaseInterval);

        return () => clearInterval(interval);
    }, [
        isRunning,
        addBead,
        releaseInterval,
    ]);

    /** Analysis */
    useEffect(() => {
        if (!isRunning) return;

        analysisRef.current = setInterval(() => {
            const { pins, beads, bins } = gameStateRef.current;
            const activeBeads = beads.filter(ball => ball.active);
            timeRef.current += 1;

            setAnalysisData(prev => [...prev, {
                time: timeRef.current,
                trajectoryVariance: calculateTrajectoryVariance(activeBeads),
                localEntropy: calculateLocalEntropy(bins, beads),
                // morpholineAlignment: calculateAOEImpact(pins, beads),
                morpholineAlignment: 0,
            }].slice(-50));
        }, 1000);

        return () => {
            if (analysisRef.current) {
                clearInterval(analysisRef.current);
            }
        };
    }, [
        isRunning,
        calculateTrajectoryVariance,
    ]);


    return (
        <div className="flex flex-col items-center gap-4 p-4 mb-24">
            <Settings
                maxBeads={maxBeads}
                setMaxBeads={setMaxBeads}
                releaseInterval={releaseInterval}
                setReleaseInterval={setReleaseInterval}
                bounceFactor={bounceFactor}
                setBounceFactor={setBounceFactor}
            />

            <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="bg-black mb-8"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                style={{
                    cursor: morphodynamics ? 'crosshair' : 'default',
                }}
            />

            <div
                className="flex gap-4"
            >
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-lime-50 min-w-[180px] text-black hover:bg-lime-200 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={
                        `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${isRunning ? 'bg-lime-50' : 'bg-lime-200'}`
                    }
                >
                    {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                    onClick={addBead}
                    className="px-4 py-2 bg-lime-50 min-w-[180px] text-black hover:bg-lime-200 transition-colors"
                >
                    Add Bead
                </button>
            </div>

            <div
                className="flex gap-4"
            >
                <button
                    onClick={() => setAreaOfEffect(!areaOfEffect)}
                    className={
                        `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${areaOfEffect ? 'bg-lime-200' : 'bg-lime-50'}`
                    }
                >
                    Area of Effect
                </button>
                <button
                    onClick={() => setMorphodynamics(!morphodynamics)}
                    className={
                        `px-4 py-2 min-w-[180px] text-black hover:bg-lime-200 transition-colors ${morphodynamics ? 'bg-lime-200' : 'bg-lime-50'}`
                    }
                >
                    Morphodynamics
                </button>
            </div>

            <Analysis
                data={analysisData}
            />
        </div>
    );
};


export default FallingBeads;
