export class Point {
    angle: number;
    value: number;
    x: number = 0;
    y: number = 0;

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

    constructor(initialValues: number[], radius: number) {
        this.radius = radius;
        this.points = initialValues.map((value, i) => new Point((i / initialValues.length) * 360, value, radius));
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
                row.push(new Circle(points, radius));
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

    adjustPointsIfClose() {
        const angleThreshold = 10; // Define threshold in degrees

        this.circles.forEach((row) => {
            row.forEach((circle) => {
                for (let i = 0; i < circle.points.length; i++) {
                    const point1 = circle.points[i];
                    const point2 = circle.points[(i + 1) % circle.points.length];

                    const isPoint1NearZero = Math.abs(point1.angle) <= angleThreshold;
                    const isPoint2Near180 = Math.abs(point2.angle - 180) <= angleThreshold;

                    if (isPoint1NearZero && isPoint2Near180) {
                        const adjustment = Math.random() > 0.5 ? 1 : -1;
                        point1.value += adjustment;
                        point2.value -= adjustment;
                    }
                }
            });
        });
    }

    update() {
        this.rotate();
        this.adjustPointsIfClose();
    }
}
