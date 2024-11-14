import React from 'react';

import {
    useRotatingCircles
} from '../hooks';

import {
    Point,
} from '../logic';

import './style.css';



const Circle: React.FC<{ points: Point[] }> = ({ points }) => {
    return (
        <div className="circle">
            {points.map((point, index) => (
                <div
                    key={index}
                    className="point"
                    style={{
                        transform: `translate(${point.x}px, ${point.y}px)`,
                    }}
                >
                    {point.value}
                </div>
            ))}
        </div>
    );
};


const PairOfCircles: React.FC<{ points: number[]; speed?: number }> = ({ points, speed = 10 }) => {
    const { circle1Points, circle2Points } = useRotatingCircles(points, speed);

    return (
        <div className="pair-of-circles">
            <Circle points={circle1Points} />
            <Circle points={circle2Points} />
        </div>
    );
};


export default PairOfCircles;
