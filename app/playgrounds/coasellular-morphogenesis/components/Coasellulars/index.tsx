import React from 'react';

import {
    Point,
} from '@/app/playgrounds/coasellular-morphogenesis/logic';

import {
    useRotatingCircles,
} from '@/app/playgrounds/coasellular-morphogenesis/components/hooks';

import Button from '@/components/Button';
import Toggle from '@/components/Toggle';

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
    const {
        circles,
        rotate,
        autoRotate,
        setAutoRotate,
    } = useRotatingCircles(
        matrixRows,
        matrixColumns,
        points,
        speed,
    );

    return (
        <>
        <div
            className="flex justify-center items-center gap-8 mb-8"
        >
            <Button
                label="Step"
                onClick={() => rotate()}
                style={{
                    marginTop: 0,
                }}
            />

            <Toggle
                text="auto step"
                value={autoRotate}
                toggle={() => setAutoRotate(!autoRotate)}
            />
        </div>

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
                    {Array.from({ length: matrixColumns }).map((_, colIndex) => {
                        const row = circles[rowIndex];
                        if (!row) {
                            return null;
                        }
                        const circle = row[colIndex];
                        if (!circle) {
                            return null;
                        }
                        const {
                            points,
                            energy,
                        } = circle;

                        return (
                            <div key={rowIndex + colIndex}>
                                <Circle
                                    points={points}
                                    energy={energy}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
        </>
    );
};


export default Coasellulars;
