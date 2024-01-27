export interface Question {
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
    questions: Question[];
}

export interface DiscussionsData {
    discussions: Discussion[];
}
