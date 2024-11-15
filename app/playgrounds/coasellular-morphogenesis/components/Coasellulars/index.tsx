import React from 'react';

import {
    Point,
} from '@/app/playgrounds/coasellular-morphogenesis/logic';

import {
    useRotatingCircles,
} from '@/app/playgrounds/coasellular-morphogenesis/components/hooks';

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


export interface Coasellulars {
    matrixRows: number;
    matrixColumns: number;
    points: number[];
    speed?: number;
}

const Coasellulars: React.FC<Coasellulars> = ({
    matrixRows,
    matrixColumns,
    points,
    speed = 10,
}) => {
    const circles = useRotatingCircles(
        matrixRows,
        matrixColumns,
        points,
        speed,
    );

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${matrixRows}, 1fr)`,
                gap: '1rem',
            }}
        >
            {Array.from({ length: matrixRows }).map((_, rowIndex) => (
                <div key={rowIndex}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${matrixColumns}, 1fr)`,
                        gap: '1rem',
                    }}
                >
                    {Array.from({ length: matrixColumns }).map((_, colIndex) => (
                        <div key={colIndex}>
                            <Circle
                                points={circles[rowIndex][colIndex].points}
                                energy={30}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};


export default Coasellulars;
