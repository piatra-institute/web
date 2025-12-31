import { useState, useEffect } from 'react';

import {
    RotatingCircles,
} from '@/app/playgrounds/(2024)/(11)/coasellular-morphogenesis/logic';



export const useRotatingCircles = (
    matrixRows: number,
    matrixColumns: number,
    initialValues: number[],
    speed: number = 10,
    radius: number = 100,
    transactionCost: number = 1,
) => {
    const [autoRotate, setAutoRotate] = useState(false);
    const [rotatingCircles, setRotatingCircles] = useState(new RotatingCircles(
        matrixRows, matrixColumns, initialValues, radius, speed, transactionCost,
    ));
    const [circles, setCircles] = useState(rotatingCircles.circles);


    const rotate = () => {
        rotatingCircles.update();
        setCircles([...rotatingCircles.circles]);
    }


    useEffect(() => {
        const rotatingCircles = new RotatingCircles(
            matrixRows, matrixColumns, initialValues, radius, speed, transactionCost,
        );
        setRotatingCircles(rotatingCircles);
        setCircles(rotatingCircles.circles);
    }, [
        matrixRows,
        matrixColumns,
        initialValues,
        radius,
        speed,
        transactionCost,
    ]);

    useEffect(() => {
        if (!autoRotate) {
            return;
        }

        const interval = setInterval(() => {
            if (!autoRotate) {
                return;
            }

            rotatingCircles.update();
            setCircles([...rotatingCircles.circles]);
        }, 100);

        return () => clearInterval(interval);
    }, [
        autoRotate,
        rotatingCircles,
    ]);


    return {
        circles,
        rotate,
        autoRotate,
        setAutoRotate,
    };
};
