export interface AnalysisData {
    time: number;
    trajectoryVariance: number;
    localEntropy: number;
    morpholineAlignment: number;
}


export interface Pin {
    x: number;
    y: number;
    aoe: boolean;
    aoeSize: number;
    aoeSpeed: number;
}

export interface Bin {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface GridConfig {
    rows: number;
    cols: number;
    startY: number;
    spacing: {
        horizontal: number;
        vertical: number;
    };
}

export interface BinConfig {
    height: number;
    width: number;
    count: number;
}

export interface DrawState {
    points: { x: number; y: number }[];
    isDrawing: boolean;
}
