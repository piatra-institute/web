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
    circle1: Circle;
    circle2: Circle;
    speed: number;

    constructor(initialValues: number[], radius: number, speed: number = 10) {
        this.circle1 = new Circle(initialValues, radius);
        this.circle2 = new Circle(initialValues, radius);
        this.speed = speed;
    }

    rotate() {
        this.circle1.rotate(this.speed);
        this.circle2.rotate(-this.speed); // Rotate the second circle in the opposite direction
    }

    // adjustPointsIfClose() {
    //     for (let i = 0; i < this.circle1.points.length; i++) {
    //         const point1 = this.circle1.points[i];
    //         const point2 = this.circle2.points[i];

    //         const distance = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    //         if (distance < 30) {
    //             const adjustment = Math.random() > 0.5 ? 1 : -1;
    //             point1.value += adjustment;
    //             point2.value -= adjustment;
    //         }
    //     }
    // }

    adjustPointsIfClose() {
        const angleThreshold = 10; // Define threshold in degrees

        for (let i = 0; i < this.circle1.points.length; i++) {
            const point1 = this.circle1.points[i];
            const point2 = this.circle2.points[i];

            // Check if point1 is near 0° and point2 is near 180°
            const isPoint1NearZero = Math.abs(point1.angle) <= angleThreshold;
            const isPoint2Near180 = Math.abs(point2.angle - 180) <= angleThreshold;

            if (isPoint1NearZero && isPoint2Near180) {
                const adjustment = Math.random() > 0.5 ? 1 : -1;
                point1.value += adjustment;
                point2.value -= adjustment;
            }
        }
    }

    update() {
        this.rotate();
        this.adjustPointsIfClose();
    }
}
