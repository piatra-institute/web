import { useState, useEffect } from 'react';

import {
    RotatingCircles,
} from '@/app/playgrounds/coasellular-morphogenesis/logic';



export const useRotatingCircles = (
    matrixRows: number,
    matrixColumns: number,
    initialValues: number[],
    speed: number = 10,
    radius: number = 100,
) => {
    const [rotatingCircles] = useState(new RotatingCircles(
        matrixRows, matrixColumns, initialValues, radius, speed,
    ));
    const [circles, setCircles] = useState(rotatingCircles.circles);

    useEffect(() => {
        const interval = setInterval(() => {
            rotatingCircles.update();
            setCircles([...rotatingCircles.circles]);
        }, 100);

        return () => clearInterval(interval);
    }, [rotatingCircles]);

    return circles;
};
