import { Metadata, ResolvingMetadata } from 'next';

import {
    findDiscussionByPath,
    renderDate,
} from '../logic';

import Concern from '@/components/Concern';



type Props = {
    params: { path: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata,
): Promise<Metadata> {
    const discussion = findDiscussionByPath(params.path);
    if (!discussion) {
        return {};
    }

    return {
        title: discussion.metadata.title,
        description: discussion.metadata.description,
    };
}


async function getData(
    path: string,
) {
    const discussion = findDiscussionByPath(path);
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
    const data = await getData(params.path);
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
                className="min-w-[300px] m-4 md:max-w-[700px]"
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
