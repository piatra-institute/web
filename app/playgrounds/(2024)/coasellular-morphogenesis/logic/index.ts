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
