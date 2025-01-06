import React, {
    useRef, useEffect, useState, useCallback,
} from 'react';

import Settings from '../Settings';

import Button from '@/components/Button';



interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    frozen: boolean;
}

interface Peg {
    x: number;
    y: number;
    radius: number;
}

interface Bin {
    x: number;
    width: number;
    top: number;
    height: number;
}

const GaltonBoard: React.FC = () => {
    // -----------------------------
    // 1. CONFIGURABLE PARAMETERS
    // -----------------------------
    const [rows, setRows] = useState(5);             // # of peg rows
    const [columns, setColumns] = useState(10);      // # of peg columns
    const [horizontalSpacing, setHorizontalSpacing] = useState(30);
    const [verticalSpacing, setVerticalSpacing] = useState(35);
    const [binCount, setBinCount] = useState(8);
    const [elasticity, setElasticity] = useState(0.5); // bounce factor
    const [maxBalls, setMaxBalls] = useState(100);
    const [releaseInterval, setReleaseInterval] = useState(200); // ms

    // Canvas dims
    const canvasWidth = 400;
    const canvasHeight = 700;

    // --------------------------------------
    // 2. REFS FOR PEGS, BINS, BALLS, TIMERS
    // --------------------------------------
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pegsRef = useRef<Peg[]>([]);
    const binsRef = useRef<Bin[]>([]);
    const ballsRef = useRef<Ball[]>([]);

    const animationIdRef = useRef<number | null>(null);
    const releaseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const ballsReleasedRef = useRef<number>(0);


    // -----------------------------
    // 3. INIT PEGS & BINS
    // -----------------------------
    useEffect(() => {
        // Generate peg positions
        const newPegs: Peg[] = [];
        for (let r = 0; r < rows; r++) {
            // Stagger every other row
            const offset = r % 2 === 0 ? 0 : horizontalSpacing / 2;
            for (let c = 0; c < columns; c++) {
                const x = offset + c * horizontalSpacing + (canvasWidth - (columns - 1) * horizontalSpacing) / 2;
                const y = 180 + r * verticalSpacing; // Start pegs a bit lower, below funnel
                newPegs.push({ x, y, radius: 6 });
            }
        }
        pegsRef.current = newPegs;
    }, [rows, columns, horizontalSpacing, verticalSpacing]);

    useEffect(() => {
        // Define bins as translucent columns at bottom
        const binHeight = 200;
        const binTop = canvasHeight - binHeight;
        const w = canvasWidth / binCount;
        const newBins: Bin[] = [];
        for (let i = 0; i < binCount; i++) {
            newBins.push({
                x: i * w,
                width: w,
                top: binTop,
                height: binHeight
            });
        }
        binsRef.current = newBins;
    }, [binCount]);

    // -----------------------------
    // 4. BALL RELEASE MECHANISM
    // -----------------------------
    /**
     * Spawns a single ball and increments the release count.
     */
    const spawnBall = useCallback(() => {
        if (ballsReleasedRef.current < maxBalls) {
            ballsReleasedRef.current++;
            const ball: Ball = {
                // x: canvasWidth / 2,
                x: canvasWidth / 2 + Math.random() * 20 - 10,
                y: 30,
                vx: Math.random() * 2 - 1,
                // vx: 0,
                vy: 0,
                radius: 5,
                frozen: false,
            };
            ballsRef.current.push(ball);
        } else {
            // Stop if we've released all
            if (releaseTimerRef.current) {
                clearInterval(releaseTimerRef.current);
                releaseTimerRef.current = null;
            }
        }
    }, [maxBalls]);

    /**
     * Starts the ball-release mechanism, clearing old data/timers first.
     */
    const startBallRelease = useCallback(() => {
        // Clear any existing timer
        if (releaseTimerRef.current) {
            clearInterval(releaseTimerRef.current);
        }
        // Reset counters and storage
        ballsReleasedRef.current = 0;
        ballsRef.current = [];

        // Set a fresh interval
        releaseTimerRef.current = setInterval(spawnBall, releaseInterval);
    }, [spawnBall, releaseInterval]);

    useEffect(() => {
        startBallRelease();
        return () => {
            if (releaseTimerRef.current) {
                clearInterval(releaseTimerRef.current);
            }
        };
    }, [startBallRelease]);


    // -----------------------------
    // 6. HELPER FUNCTIONS
    // -----------------------------
    const drawBackground = (ctx: CanvasRenderingContext2D) => {
        // 1) Wooden background
        ctx.fillStyle = '#CDAA7D';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 2) Darker wooden border
        ctx.strokeStyle = '#8B5E3C';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        // 3) Funnel: two trapezoids up top
        ctx.fillStyle = '#AA8456';
        // Left trapezoid
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.lineTo(canvasWidth * 0.45, 50);
        ctx.lineTo(canvasWidth * 0.55, 150);
        ctx.lineTo(0, 150);
        ctx.closePath();
        ctx.fill();
        // Right trapezoid
        ctx.beginPath();
        ctx.moveTo(canvasWidth, 50);
        ctx.lineTo(canvasWidth * 0.55, 50);
        ctx.lineTo(canvasWidth * 0.45, 150);
        ctx.lineTo(canvasWidth, 150);
        ctx.closePath();
        ctx.fill();
    };

    const drawPegs = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#555';
        pegsRef.current.forEach((peg) => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, peg.radius, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    const drawBins = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.3)';
        ctx.lineWidth = 2;
        binsRef.current.forEach((bin) => {
            ctx.fillRect(bin.x, bin.top, bin.width - 1, bin.height);
            ctx.strokeRect(bin.x, bin.top, bin.width - 1, bin.height);
        });
        ctx.restore();
    };

    const drawBalls = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'red';
        ballsRef.current.forEach((ball) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    // Physics update: gravity, collisions with walls, bins, pegs, other balls
    const updateBalls = useCallback(() => {
        const gravity = 0.2;
        const floorFriction = 0.05;
        const bottom = canvasHeight;
        const rightEdge = canvasWidth;

        // Move each ball
        ballsRef.current.forEach((ball) => {
            if (!ball.frozen) {
                // Gravity
                ball.vy += gravity;
                // Update position
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Left/right walls
                if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                    ball.vx = -ball.vx * elasticity;
                } else if (ball.x + ball.radius > rightEdge) {
                    ball.x = rightEdge - ball.radius;
                    ball.vx = -ball.vx * elasticity;
                }

                // Check bin collisions
                let inBin = false;
                for (const bin of binsRef.current) {
                    const withinBinX =
                        ball.x + ball.radius > bin.x &&
                        ball.x - ball.radius < bin.x + bin.width;
                    if (withinBinX && ball.y + ball.radius >= bin.top) {
                        // Force ball inside bin horizontally?
                        // If you'd like to lock horizontal inside bin, you can clamp x and set vx=0
                        // For now, we'll do simpler floor collisions at bin bottom.
                        const binBottom = bin.top + bin.height;
                        if (ball.y + ball.radius >= binBottom) {
                            ball.y = binBottom - ball.radius;
                            if (Math.abs(ball.vy) > 1) {
                                ball.vy = -ball.vy * elasticity;
                            } else {
                                // freeze
                                ball.vy = 0;
                                ball.vx *= (1 - floorFriction);
                                if (Math.abs(ball.vx) < 0.2) {
                                    ball.vx = 0;
                                    ball.frozen = true;
                                }
                            }
                        }
                        inBin = true;
                        break;
                    }
                }

                // If not in any bin, check bottom floor
                if (!inBin && ball.y + ball.radius >= bottom) {
                    ball.y = bottom - ball.radius;
                    if (Math.abs(ball.vy) > 1) {
                        ball.vy = -ball.vy * elasticity;
                    } else {
                        ball.vy = 0;
                        ball.vx *= (1 - floorFriction);
                        if (Math.abs(ball.vx) < 0.2) {
                            ball.vx = 0;
                            ball.frozen = true;
                        }
                    }
                }

                // Peg collisions
                pegsRef.current.forEach((peg) => {
                    const dx = ball.x - peg.x;
                    const dy = ball.y - peg.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = ball.radius + peg.radius;
                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        // Push out
                        ball.x += nx * overlap;
                        ball.y += ny * overlap;
                        // Reflect velocity
                        const dot = ball.vx * nx + ball.vy * ny;
                        ball.vx -= 2 * dot * nx * elasticity;
                        ball.vy -= 2 * dot * ny * elasticity;
                    }
                });
            }
        });

        // Ball-ball collisions (O(n^2) approach)
        for (let i = 0; i < ballsRef.current.length; i++) {
            for (let j = i + 1; j < ballsRef.current.length; j++) {
                const ballA = ballsRef.current[i];
                const ballB = ballsRef.current[j];
                const dx = ballA.x - ballB.x;
                const dy = ballA.y - ballB.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = ballA.radius + ballB.radius;
                if (dist < minDist) {
                    // Overlap
                    const overlap = (minDist - dist) / 2;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    if (!ballA.frozen) {
                        ballA.x += nx * overlap;
                        ballA.y += ny * overlap;
                    }
                    if (!ballB.frozen) {
                        ballB.x -= nx * overlap;
                        ballB.y -= ny * overlap;
                    }
                    // Reflect velocities
                    const rvx = ballB.vx - ballA.vx;
                    const rvy = ballB.vy - ballA.vy;
                    const dot = rvx * nx + rvy * ny;
                    if (dot < 0) {
                        const combinedE = elasticity;
                        const impulse = -(1 + combinedE) * dot * 0.5;
                        if (!ballA.frozen) {
                            ballA.vx -= impulse * nx;
                            ballA.vy -= impulse * ny;
                        }
                        if (!ballB.frozen) {
                            ballB.vx += impulse * nx;
                            ballB.vy += impulse * ny;
                        }
                    }
                }
            }
        }
    }, [
        elasticity,
    ]);

    // -----------------------------
    // 5. MAIN ANIMATION LOOP
    // -----------------------------
    useEffect(() => {
        const animate = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear entire canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // (A) Draw stylized background (frame, funnel, etc.)
            drawBackground(ctx);

            // (B) Draw translucent bins
            drawBins(ctx);

            // (C) Draw pegs
            drawPegs(ctx);

            // (D) Update & draw balls with basic physics
            updateBalls();
            drawBalls(ctx);

            // Schedule next
            animationIdRef.current = requestAnimationFrame(animate);
        };

        // Start
        animationIdRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationIdRef.current !== null) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [
        elasticity,
        updateBalls,
    ]);


    const reset = () => {
        // Clear all balls, reset counters
        ballsRef.current = [];
        ballsReleasedRef.current = 0;

        startBallRelease();
    }



    // -----------------------------
    // 7. RENDER + UI
    // -----------------------------
    return (
        <div style={{ textAlign: 'center' }}>
            <div
                className="flex items-center justify-center"
            >
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{ border: '1px solid black' }}
                />
            </div>

            <div
                style={{
                    marginTop: '1rem',
                    marginBottom: '4rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'center',
                }}
            >
                <Button
                    label="Reset"
                    onClick={() => {
                        reset();
                    }}
                />
            </div>

            <Settings
                rows={rows}
                setRows={setRows}
                columns={columns}
                setColumns={setColumns}
                horizontalSpacing={horizontalSpacing}
                setHorizontalSpacing={setHorizontalSpacing}
                verticalSpacing={verticalSpacing}
                setVerticalSpacing={setVerticalSpacing}
                binCount={binCount}
                setBinCount={setBinCount}
                elasticity={elasticity}
                setElasticity={setElasticity}
                maxBalls={maxBalls}
                setMaxBalls={setMaxBalls}
                releaseInterval={releaseInterval}
                setReleaseInterval={setReleaseInterval}
            />
        </div>
    );
};

export default GaltonBoard;
