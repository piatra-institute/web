export interface AirportData {
    current: {
        cs: number;
        profits: number;
        welfare: number;
    };
    private: {
        cs: number;
        profits: number;
        welfare: number;
    };
}

export const baseData: Record<string, AirportData> = {
    'ATL': { 
        current: { cs: 0.0113, profits: 6.3653 + 1.1126, welfare: 7.4892 }, 
        private: { cs: 0.1431, profits: 6.8100 + 38.8209, welfare: 45.774 } 
    },
    'ORD': { 
        current: { cs: 0.0173, profits: 8.3726 + 28.0044, welfare: 36.3943 }, 
        private: { cs: 0.0210, profits: 9.2461 + 14.1468, welfare: 23.4139 } 
    },
    'IAH': { 
        current: { cs: 0.0005, profits: 1.0149 + 13.6806, welfare: 14.696 }, 
        private: { cs: 0.0005, profits: 1.0692 + 2.5189, welfare: 3.5886 } 
    },
    'MSP': { 
        current: { cs: 0.0750, profits: 2.8167 + 2.1456, welfare: 5.0373 }, 
        private: { cs: 0.0016, profits: 2.7049 + 0.0005, welfare: 2.707 } 
    },
    'JFK': { 
        current: { cs: 0.1013, profits: 4.1109 + 36.4014, welfare: 40.6136 }, 
        private: { cs: 0.0008, profits: 4.4381 + 0.7796, welfare: 5.2185 } 
    },
    'SFO': { 
        current: { cs: 0.0006, profits: 0.3820 + 1.1545, welfare: 1.5371 }, 
        private: { cs: 0.0059, profits: 4.2178 + 4.3269, welfare: 8.5506 } 
    },
    'SLC': { 
        current: { cs: 0.0421, profits: 1.5086 + 1.2166, welfare: 2.7673 }, 
        private: { cs: 0.0167, profits: 1.5198 + 2.5446, welfare: 4.0811 } 
    },
    'BWI': { 
        current: { cs: 0.0653, profits: 2.6130 + 4.2523, welfare: 6.9306 }, 
        private: { cs: 0.1685, profits: 2.8009 + 2.9561, welfare: 5.9255 } 
    },
    'IAD': { 
        current: { cs: 0.0371, profits: 1.6426 + 3.4171, welfare: 5.0968 }, 
        private: { cs: 0.0036, profits: 1.8447 + 1.9611, welfare: 3.8094 } 
    }
};

export interface OutcomeData {
    current: {
        cs: number;
        profits: number;
        welfare: number;
    };
    private: {
        cs: number;
        profits: number;
        welfare: number;
    };
}

export function calculateOutcomes(
    selectedAirport: string,
    ramseyLambda: number,
    networkEffect: number
): OutcomeData {
    const base = baseData[selectedAirport];

    // Simulate Current Model based on sliders
    const currentCS = base.current.cs * (1 + networkEffect / 100);
    const currentProfits = base.current.profits * (1 - (ramseyLambda - 0.5)); // Higher lambda slightly reduces profit focus
    const currentWelfare = currentCS + currentProfits * ramseyLambda; // Welfare is CS + profit weighted by lambda

    // Simulate Privatized Model based on sliders
    // Privatized model is less sensitive to Ramsey lambda, but still affected by network effects
    const privateCS = base.private.cs * (1 + networkEffect / 100);
    const privateProfits = base.private.profits * (1 + networkEffect / 150); // Stronger profit motive
    const privateWelfare = privateCS + privateProfits; // Pure profit max means welfare is just sum of surpluses

    return {
        current: { cs: currentCS, profits: currentProfits, welfare: currentWelfare },
        private: { cs: privateCS, profits: privateProfits, welfare: privateWelfare }
    };
}

export function formatValue(val: number): string {
    return (val * 1000).toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        notation: 'compact' 
    });
}