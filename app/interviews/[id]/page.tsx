import { Metadata, ResolvingMetadata } from 'next';

import {
    findInterview,
    renderDate,
} from '../logic';

import Question from '@/components/Question';



type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const id = params.id;

    const interview = findInterview(params.id);
    if (!interview) {
        return {};
    }

    return {
        title: interview.metadata.title,
        description: interview.metadata.description,
    };
}


async function getData(
    id: string,
) {
    const interview = findInterview(id);
    if (!interview) {
        return {};
    }

    return {
        props: {
            ...interview,
        },
    };
}


export default async function Interviews({
    params,
}: Props) {
    const data = await getData(params.id);
    if (!data || !data.props) {
        return (
            <div
                className="flex flex-col items-center justify-center w-full h-full"
            >
                not found
            </div>
        );
    }
    const {
        date,
        person,
        title,
        questions,
    } = data.props;

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full"
        >
            <h1
                className="text-xl font-bold mb-4"
            >
                {title}
            </h1>

            <h2
                className="text-lg mb-10"
            >
                {renderDate(date)} {person}
            </h2>

            <div
                className="max-w-[700px] m-4"
            >
                {questions.map(question => (
                    <Question
                        key={Math.random() + ''}
                        data={question}
                    />
                ))}
            </div>
        </div>
    );
}
