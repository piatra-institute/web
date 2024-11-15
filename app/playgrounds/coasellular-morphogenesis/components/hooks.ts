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
    const [rotatingCircles, setRotatingCircles] = useState(new RotatingCircles(
        matrixRows, matrixColumns, initialValues, radius, speed,
    ));
    const [circles, setCircles] = useState(rotatingCircles.circles);


    useEffect(() => {
        setRotatingCircles(new RotatingCircles(
            matrixRows, matrixColumns, initialValues, radius, speed,
        ));
    }, [
        matrixRows,
        matrixColumns,
        initialValues,
        radius,
        speed,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            rotatingCircles.update();
            setCircles([...rotatingCircles.circles]);
        }, 100);

        return () => clearInterval(interval);
    }, [rotatingCircles]);


    return circles;
};
