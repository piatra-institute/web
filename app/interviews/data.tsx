import data from './data.json';



export interface Question {
    text: string;
    references: string[];
    context: string;
}

export interface Interview {
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

export interface Data {
    interviews: Interview[];
}


export default data as Data;
