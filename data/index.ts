export interface Concern {
    id: string;
    text: string;
    references: string[];
    context: string;
}

export interface Discussion {
    id: string;
    date: string;
    person: string;
    title: string;
    metadata: {
        title: string;
        description: string;
    };
    concerns: Concern[];
}

export interface DiscussionsData {
    discussions: Discussion[];
}
