import { Metadata, ResolvingMetadata } from 'next';

import {
    findDiscussion,
    renderDate,
} from '../logic';

import Concern from '@/components/Concern';



type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const id = params.id;

    const discussion = findDiscussion(params.id);
    if (!discussion) {
        return {};
    }

    return {
        title: discussion.metadata.title,
        description: discussion.metadata.description,
    };
}


async function getData(
    id: string,
) {
    const discussion = findDiscussion(id);
    if (!discussion) {
        return {};
    }

    return {
        props: {
            ...discussion,
        },
    };
}


export default async function Discussions({
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
        concerns,
    } = data.props;

    return (
        <div
            className="flex flex-col items-center w-full h-full p-8"
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
                {concerns.map(concern => (
                    <Concern
                        key={concern.id}
                        data={concern}
                    />
                ))}
            </div>
        </div>
    );
}
