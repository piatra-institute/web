import React from 'react';

import {
    useRotatingCircles
} from '../hooks';

import {
    Point,
} from '../logic';

import './style.css';



const Circle: React.FC<{
    points: Point[],
    energy: number,
}> = ({
    points,
    energy,
}) => {
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

            <div>
                {energy}
            </div>
        </div>
    );
};


const PairOfCircles: React.FC<{ points: number[]; speed?: number }> = ({ points, speed = 10 }) => {
    const { circle1Points, circle2Points } = useRotatingCircles(points, speed);

    return (
        <div className="pair-of-circles">
            <Circle
                points={circle1Points}
                energy={30}
            />
            <Circle
                points={circle2Points}
                energy={50}
            />
        </div>
    );
};


export default PairOfCircles;
