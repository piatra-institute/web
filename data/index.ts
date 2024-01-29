export interface Concern {
    id: string;
    text: string;
    references: string[];
    context: string;
}

export interface Provocation {
    id: string;
    path: string;
    date: string;
    person: string;
    title: string;
    metadata: {
        title: string;
        description: string;
    };
    concerns: Concern[];
}

export interface ProvocationsData {
    provocations: Provocation[];
}



export const REGENERATE_REQUEST_RECYCLE = process.env.REGENERATE_REQUEST_LIMIT === 'true';
export const REGENERATE_REQUEST_LIMIT = parseInt(process.env.REGENERATE_REQUEST_LIMIT || '') ?? 10;
