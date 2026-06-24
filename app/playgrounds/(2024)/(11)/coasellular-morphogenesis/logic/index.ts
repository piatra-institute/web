export interface PointPair {
    circle1: [number, number];
    point1: number;
    circle2: [number, number];
    point2: number;
}


export class Point {
    angle: number;
    value: number;
    x: number = 0;
    y: number = 0;
    changed = false;

    constructor(angle: number, value: number, radius: number) {
        this.angle = angle;
        this.value = value;
        this.updatePosition(radius);
    }

    updatePosition(radius: number) {
        this.x = radius * Math.cos((this.angle * Math.PI) / 180);
        this.y = radius * Math.sin((this.angle * Math.PI) / 180);
    }

    rotate(degrees: number, radius: number) {
        this.angle = (this.angle + degrees) % 360;
        this.updatePosition(radius);
    }
}


export class Circle {
    points: Point[];
    radius: number;
    energy: number;

    constructor(
        initialValues: number[],
        radius: number,
        energy: number,
    ) {
        this.radius = radius;
        this.points = initialValues.map((value, i) => new Point((i / initialValues.length) * 360, value, radius));
        this.energy = energy;
    }

    rotate(degrees: number) {
        this.points.forEach((point) => point.rotate(degrees, this.radius));
    }
}


export class RotatingCircles {
    circles: Circle[][];
    speed: number;
    transactionCost: number;

    constructor(
        rows: number,
        columns: number,
        initialValues: number[],
        radius: number,
        speed: number = 10,
        transactionCost: number = 1,
    ) {
        this.circles = [];
        this.speed = speed;
        this.transactionCost = transactionCost;

        for (let i = 0; i < rows; i++) {
            const row: Circle[] = [];
            for (let j = 0; j < columns; j++) {
                const pointsCount = initialValues.length / (rows * columns);
                const points = initialValues.slice((i * columns + j) * pointsCount, (i * columns + j + 1) * pointsCount);
                const energy = Math.floor(Math.random() * 100);
                row.push(new Circle(
                    points,
                    radius,
                    energy,
                ));
            }
            this.circles.push(row);
        }
    }

    rotate() {
        this.circles.forEach((row, rowIndex) => {
            row.forEach((circle, colIndex) => {
                // const direction = (rowIndex + colIndex) % 2 === 0 ? this.speed : -this.speed;
                // circle.rotate(direction);
                circle.rotate(this.speed);
            });
        });
    }

    transactPoints() {
        // for all the circles make pairs
        //
        //          a1            a2
        //      d1  C1  b1    d2  C2   b2
        //          c1            c2
        //          a3            a4
        //      d3  C3  b3    d4  C4   b4
        //          c3            c4
        //
        // a Circle C can have neighbors with the points a, b, c, d
        // make pairs for instance here
        // C1-b1 with C2-d2
        // C1-c1 with C3-a3
        // C2-c2 with C4-a4
        // C3-b3 with C4-d4
        // account for the fact that there might be an unknown number of points
        // and compute neighbors given an angle of 10 degrees from the origin

        const pairs: PointPair[] = [];

        this.circles.forEach((row, rowIndex) => {
            row.forEach((circle, colIndex) => {
                circle.points.forEach((point, pointIndex) => {
                    if (point.angle < 20 || point.angle > 340) {
                        const nextCircle = this.circles[rowIndex][colIndex + 1];
                        if (nextCircle) {
                            const matchPoint = nextCircle.points
                                .map((p, i) => ({ p, i }))
                                .find(({ p }) => {
                                    return p.angle > 150 && p.angle < 190
                                });

                            if (matchPoint) {
                                pairs.push({
                                    circle1: [rowIndex, colIndex],
                                    point1: pointIndex,
                                    circle2: [rowIndex, colIndex + 1],
                                    point2: matchPoint.i,
                                });
                            }
                        }
                    }

                    if (point.angle > 70 && point.angle < 110) {
                        const nextCircle = this.circles[rowIndex + 1] ? this.circles[rowIndex + 1][colIndex] : null;
                        if (nextCircle) {
                            const matchPoint = nextCircle.points
                                .map((p, i) => ({ p, i }))
                                .find(({ p }) => {
                                    return p.angle > 250 && p.angle < 290
                                });

                            if (matchPoint) {
                                pairs.push({
                                    circle1: [rowIndex, colIndex],
                                    point1: pointIndex,
                                    circle2: [rowIndex + 1, colIndex],
                                    point2: matchPoint.i,
                                });
                            }
                        }
                    }
                });
            });
        });

        for (const pair of pairs) {
            const point1 = this.circles[pair.circle1[0]][pair.circle1[1]].points[pair.point1];
            const point2 = this.circles[pair.circle2[0]][pair.circle2[1]].points[pair.point2];

            const adjustment1 = Math.random() > 0.5 ? 1 : -1;
            const adjustment2 = -adjustment1;

            this.circles[pair.circle1[0]][pair.circle1[1]].points[pair.point1].value = point1.value + adjustment1;
            this.circles[pair.circle2[0]][pair.circle2[1]].points[pair.point2].value = point2.value + adjustment2;

            this.circles[pair.circle1[0]][pair.circle1[1]].energy += this.transactionCost * adjustment1;
            this.circles[pair.circle2[0]][pair.circle2[1]].energy -= this.transactionCost * adjustment2;
        }
    }

    update() {
        this.rotate();
        this.transactPoints();
    }
}


// #region deterministic core
// The live simulation injects randomness in two places: each circle's starting
// energy (Math.random) and the sign of every value adjustment (Math.random>0.5).
// The deterministic core below strips that noise so the model's structural
// invariants can be verified exactly. These are the load-bearing economic claims
// of the model and are independent of the random draws.

export interface DeterministicTransaction {
    /** index of the boundary point on the lower-index circle of the pair */
    give: number;
    /** index of the boundary point on the higher-index circle of the pair */
    take: number;
    /** signed unit moved from `give` to `take` (±1) */
    sign: number;
}


/**
 * Enumerate the neighbour boundary pairs for a rows-by-columns grid of circles
 * whose points sit at fixed equal angular spacing. A horizontal pair exists for
 * every interior vertical edge of the grid; a vertical pair for every interior
 * horizontal edge. Each pair contributes exactly one transaction. This is the
 * deterministic skeleton of `RotatingCircles.transactPoints` with the angular
 * gating satisfied (a point is always in the boundary cone at some rotation).
 */
export function neighbourPairCount(rows: number, columns: number): number {
    const horizontal = rows * Math.max(0, columns - 1);
    const vertical = Math.max(0, rows - 1) * columns;
    return horizontal + vertical;
}


/**
 * Total scalar value held across every point in the grid. The transaction rule
 * moves a unit from one paired point to the other (value1 += a, value2 -= a),
 * so this quantity is conserved by construction: the Coasean result that
 * bargaining redistributes endowments without creating or destroying value.
 */
export function totalPointValue(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0);
}


/**
 * Apply a deterministic sequence of transactions to a flat value array. Each
 * transaction moves `sign` units from `give` to `take`. Returns the resulting
 * array. Used to demonstrate that, whatever the signs, the total is invariant.
 */
export function applyTransactions(
    values: number[],
    transactions: DeterministicTransaction[],
): number[] {
    const out = values.slice();
    for (const t of transactions) {
        out[t.give] -= t.sign;
        out[t.take] += t.sign;
    }
    return out;
}


/**
 * Net energy change of the whole grid after one transaction, holding the
 * transaction cost fixed. In `transactPoints` both circles of a pair have their
 * energy moved by `transactionCost * adjustment1` with the SAME sign, so the
 * grid energy is not conserved: each transaction injects 2 * cost * sign units
 * of energy. This returns the magnitude per transaction (|sign| = 1), the cost
 * of running the bargaining machinery itself.
 */
export function energyPerTransaction(transactionCost: number): number {
    return 2 * transactionCost;
}


/**
 * Total energy expended to run `pairs` transactions at a given cost. Equal to
 * pairs * energyPerTransaction(cost) by linearity. This is the model's analogue
 * of cumulative transaction cost: the friction that, in Coase's theorem, decides
 * whether efficient bargaining actually happens.
 */
export function cumulativeTransactionEnergy(pairs: number, transactionCost: number): number {
    return pairs * energyPerTransaction(transactionCost);
}
// #endregion deterministic core
