import { useState, useEffect } from 'react';

import {
    RotatingCircles,
} from './logic';



export const useRotatingCircles = (
    initialValues: number[],
    speed: number = 10,
    radius: number = 100,
) => {
    const [rotatingCircles] = useState(new RotatingCircles(initialValues, radius, speed));
    const [circle1Points, setCircle1Points] = useState(rotatingCircles.circle1.points);
    const [circle2Points, setCircle2Points] = useState(rotatingCircles.circle2.points);

    useEffect(() => {
        const interval = setInterval(() => {
            rotatingCircles.update();
            setCircle1Points([...rotatingCircles.circle1.points]);
            setCircle2Points([...rotatingCircles.circle2.points]);
        }, 100);

        return () => clearInterval(interval);
    }, [rotatingCircles]);

    return { circle1Points, circle2Points };
};
