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

    constructor(
        rows: number,
        columns: number,
        initialValues: number[],
        radius: number,
        speed: number = 10,
    ) {
        this.circles = [];
        this.speed = speed;

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
                const direction = (rowIndex + colIndex) % 2 === 0 ? this.speed : -this.speed;
                circle.rotate(direction);
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


        interface PointPair {
            circle1: [number, number];
            point1: number;
            circle2: [number, number];
            point2: number;
        }

        const pairs: PointPair[] = [];

        this.circles.forEach((row, rowIndex) => {
            row.forEach((circle, colIndex) => {
                circle.points.forEach((point, pointIndex) => {
                    if (point.angle > 20 && point.angle < 340) {
                        return;
                    }

                    const nextCircle = this.circles[rowIndex][colIndex + 1];
                    if (nextCircle) {
                        const matchPoint = nextCircle.points
                            .map((p, i) => ({ p, i }))
                            .find(({ p }) => {
                                return p.angle > 150 && p.angle > 190
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
                });
            });
        });
        // console.log(pairs);


        // const angleThreshold = 10; // Define threshold in degrees

        // this.circles.forEach((row, rowIndex) => {
        //     row.forEach((circle, colIndex) => {
        //         circle.points.forEach((point, pointIndex) => {
        //             const neighbors = [];

        //             // Get neighbors
        //             if (rowIndex > 0) {
        //                 neighbors.push(this.circles[rowIndex - 1][colIndex].points[pointIndex]); // Top
        //             }
        //             if (rowIndex < this.circles.length - 1) {
        //                 neighbors.push(this.circles[rowIndex + 1][colIndex].points[pointIndex]); // Bottom
        //             }
        //             if (colIndex > 0) {
        //                 neighbors.push(this.circles[rowIndex][colIndex - 1].points[pointIndex]); // Left
        //             }
        //             if (colIndex < row.length - 1) {
        //                 neighbors.push(this.circles[rowIndex][colIndex + 1].points[pointIndex]); // Right
        //             }

        //             neighbors.forEach((neighbor) => {
        //                 const angleDiff = Math.abs(point.angle - neighbor.angle);
        //                 if (angleDiff <= angleThreshold || Math.abs(angleDiff - 360) <= angleThreshold) {
        //                     if (point.changed && neighbor.changed) {
        //                         return;
        //                     }

        //                     const adjustment = Math.random() > 0.5 ? 1 : -1;
        //                     point.value += adjustment;
        //                     neighbor.value -= adjustment;

        //                     point.changed = true;
        //                     neighbor.changed = true;
        //                 } else {
        //                     point.changed = false;
        //                     neighbor.changed = false;
        //                 }
        //             });
        //         });
        //     });
        // });
    }

    update() {
        this.rotate();
        this.transactPoints();
    }
}
