export interface Paper {
    id: string;
    path: string;
    date: string;
    title: string;
    abstract: string;
    metadata: {
        title: string;
        description: string;
    };
    text: PaperText;
}

export interface PaperText {
    sections: PaperSection[];
}

export interface PaperSection {
    id: string;
    title: string;
    paragraphs: string[];
}


export interface PapersData {
    papers: Paper[];
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
    prerequisites?: string[];
    concerns: Concern[];
}

export interface Concern {
    id: string;
    text: string;
    references: string[];
    context: string;
}


export interface ProvocationsData {
    provocations: Provocation[];
}


export type Completion = {
    id: string;
    createdAt: string;
    concernID: string;
    completion: string;
};



export const REGENERATE_REQUEST_RECYCLE = process.env.REGENERATE_REQUEST_LIMIT === 'true';
export const REGENERATE_REQUEST_LIMIT = parseInt(process.env.REGENERATE_REQUEST_LIMIT || '') ?? 10;
export const REGENERATE_REQUEST_PER_CONCERN_LIMIT = parseInt(process.env.REGENERATE_REQUEST_PER_CONCERN_LIMIT || '') ?? 30;
