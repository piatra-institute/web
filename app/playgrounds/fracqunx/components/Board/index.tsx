import {
    useEffect,
    useRef,
    useState,
} from 'react';



interface Pin {
    x: number;
    y: number;
}

interface Bin {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface GridConfig {
    rows: number;
    cols: number;
    startY: number;
    spacing: {
        horizontal: number;
        vertical: number;
    };
}

interface BinConfig {
    height: number;
    width: number;
    count: number;
}

class Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    active: boolean;
    binIndex: number | null;
    frozen: boolean;

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

    checkCollisionWithFrozenBalls(otherBalls: Ball[]): number {
        let highestCollision = HEIGHT;

        otherBalls.forEach(otherBall => {
            if (otherBall === this || !otherBall.frozen) return;

            const dx = this.x - otherBall.x;
            const dy = this.y - otherBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherBall.radius) {
                const collisionY = otherBall.y - this.radius * 2;
                highestCollision = Math.min(highestCollision, collisionY);

                const centeringForce = 0.1;
                if (Math.abs(this.vx) < 1) {
                    this.vx += (dx > 0 ? -centeringForce : centeringForce);
                }
            }
        });

        return highestCollision;
    }

    update(otherBalls: Ball[], pins: Pin[], bins: Bin[]): void {
        if (this.frozen) return;

        this.vy += GRAVITY;
        this.vx *= FRICTION;

        const nextX = this.x + this.vx;
        const nextY = this.y + this.vy;

        if (this.binIndex !== null) {
            const bin = bins[this.binIndex];

            if (nextX - this.radius < bin.x || nextX + this.radius > bin.x + bin.width) {
                this.vx *= -BOUNCE_FACTOR;
                this.x = nextX - this.radius < bin.x ?
                    bin.x + this.radius :
                    bin.x + bin.width - this.radius;
            } else {
                this.x = nextX;
            }
        } else {
            this.x = nextX;
        }

        const collisionY = this.checkCollisionWithFrozenBalls(otherBalls);

        if (nextY + this.radius > collisionY) {
            this.y = collisionY;
            this.vy *= -BOUNCE_FACTOR;

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
            this.vy *= -BOUNCE_FACTOR;

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
                    this.vy *= -BOUNCE_FACTOR;
                } else {
                    const angle = Math.atan2(dy, dx);
                    this.x = pin.x + Math.cos(angle) * (this.radius + PIN_RADIUS);
                    this.y = pin.y + Math.sin(angle) * (this.radius + PIN_RADIUS);

                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    this.vx = Math.cos(angle) * speed * BOUNCE_FACTOR;
                    this.vy = Math.sin(angle) * speed * BOUNCE_FACTOR;
                }
            }
        });

        if (this.y + this.radius > HEIGHT - BIN_CONFIG.height && this.binIndex === null) {
            const binIndex = Math.floor(this.x / BIN_CONFIG.width);
            if (binIndex >= 0 && binIndex < BIN_CONFIG.count) {
                this.binIndex = binIndex;
            }
        }

        otherBalls.forEach(otherBall => {
            if (otherBall === this || otherBall.frozen) return;

            const dx = this.x - otherBall.x;
            const dy = this.y - otherBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherBall.radius) {
                const nx = dx / distance;
                const ny = dy / distance;
                const relativeVx = this.vx - otherBall.vx;
                const relativeVy = this.vy - otherBall.vy;
                const impulse = 2 * (relativeVx * nx + relativeVy * ny) / 2;

                this.vx -= impulse * nx * BOUNCE_FACTOR;
                this.vy -= impulse * ny * BOUNCE_FACTOR;
                otherBall.vx += impulse * nx * BOUNCE_FACTOR;
                otherBall.vy += impulse * ny * BOUNCE_FACTOR;

                const overlap = (this.radius + otherBall.radius - distance) / 2;
                this.x += nx * overlap;
                this.y += ny * overlap;
                otherBall.x -= nx * overlap;
                otherBall.y -= ny * overlap;
            }
        });
    }
}


const BALL_RADIUS = 6;
const PIN_RADIUS = 8;
const GRAVITY = 0.4;
const BOUNCE_FACTOR = 0.5;
const FRICTION = 0.98;
const VERTICAL_COLLISION_THRESHOLD = 0.1;
const RANDOM_DEFLECTION_SPEED = 3;
const STOP_THRESHOLD = 0.1;

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
    width: BALL_RADIUS * 2,
    count: Math.floor(WIDTH / (BALL_RADIUS * 2))
};

const BACKGROUND_COLOR = '#141414'
const PIN_COLOR = '#404040'
const BALL_COLOR = '#bef264'
const BIN_COLOR = '#454545'
const FROZEN_BALL_COLOR = '#84cc16'


const FallingBalls: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(true);


    const generatePins = (): Pin[] => {
        const pins: Pin[] = [];
        const startX = (WIDTH - (PIN_GRID.cols - 1) * PIN_GRID.spacing.horizontal) / 2;

        for (let row = 0; row < PIN_GRID.rows; row++) {
            const offsetX = row % 2 === 0 ? 0 : PIN_GRID.spacing.horizontal / 2;
            const cols = row % 2 === 0 ? PIN_GRID.cols : PIN_GRID.cols - 1;

            for (let col = 0; col < cols; col++) {
                pins.push({
                    x: startX + col * PIN_GRID.spacing.horizontal + offsetX,
                    y: PIN_GRID.startY + row * PIN_GRID.spacing.vertical
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

    const pins = generatePins();
    const bins = generateBins();

    const addBall = (): void => {
        const newBall = new Ball(WIDTH / 2, BALL_RADIUS, BALL_RADIUS);
        setBalls(prevBalls => [...prevBalls, newBall]);
    };


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
            });

            bins.forEach((bin) => {
                ctx.beginPath();
                ctx.rect(bin.x, bin.y, bin.width, bin.height);
                ctx.strokeStyle = BIN_COLOR;
                ctx.stroke();
                ctx.closePath();
            });

            balls.forEach(ball => {
                ball.update(balls, pins, bins);

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.frozen ? FROZEN_BALL_COLOR : BALL_COLOR;
                ctx.fill();
                ctx.closePath();
            });

            if (isRunning) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [
        balls,
        isRunning,
        pins,
        bins,
    ]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(addBall, 2000);
        return () => clearInterval(interval);
    }, [isRunning]);


    return (
        <div className="flex flex-col items-center gap-4 p-4 mb-24">
            <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="bg-black mb-8"
            />

            <div className="flex gap-4">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="px-4 py-2 bg-lime-50 text-black hover:bg-lime-200 transition-colors"
                >
                    {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                    onClick={addBall}
                    className="px-4 py-2 bg-lime-50 text-black hover:bg-lime-200 transition-colors"
                >
                    Add Ball
                </button>
            </div>
        </div>
    );
};


export default FallingBalls;
