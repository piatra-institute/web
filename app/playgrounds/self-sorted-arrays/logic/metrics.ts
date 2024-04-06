import {
    CellData,
} from '../data';



export const computeTotalSortingSteps = (
    distribution: CellData[],
) => {

}

export const computeAverage = (
    distribution: CellData[],
) => {

}

export const computeStandardDeviation = (
    distribution: CellData[],
) => {

}

export const computeMonotonicity = (
    distribution: CellData[],
) => {

}

export const computeMonotonicityError = (
    distribution: CellData[],
) => {
    let error = 0;

    for (let i = 1; i < distribution.length; i++) {
        const previous = distribution[i - 1];
        const current = distribution[i];

        if (current < previous) {
            error++;
        }
    }
}

export const computeSortednessValue = (
    distribution: CellData[],
) => {
    let sum = 0;

    for (let i = 1; i < distribution.length; i++) {
        const previous = distribution[i - 1];
        const current = distribution[i];

        if (current > previous) {
            sum++;
        }
    }

    const sortedness = sum / distribution.length;

    return sortedness;
}

export const computeSortednessDelayedGratification = (
    distribution: CellData[],
) => {

}

export const computeAggregationValue = (
    distribution: CellData[],
) => {
    let sum = 0;

    for (let i = 1; i < distribution.length; i++) {
        const previous = distribution[i - 1];
        const current = distribution[i];

        if (current.algotype === previous.algotype) {
            sum++;
        }
    }

    const aggregation = sum / distribution.length;

    return aggregation;
}



export const computeMetrics = (
    distribution: CellData[],
) => {
    const totalSortingSteps = computeTotalSortingSteps(distribution);
    const average = computeAverage(distribution);
    const standardDeviation = computeStandardDeviation(distribution);
    const monotonicity = computeMonotonicity(distribution);
    const monotonicityError = computeMonotonicityError(distribution);
    const sortedness = computeSortednessValue(distribution);
    const sortednessDelayedGratification = computeSortednessDelayedGratification(distribution);
    const aggregation = computeAggregationValue(distribution);

    const metrics = {
        totalSortingSteps,
        average,
        standardDeviation,
        monotonicity,
        monotonicityError,
        sortedness,
        sortednessDelayedGratification,
        aggregation,
    };

    return metrics;
}
