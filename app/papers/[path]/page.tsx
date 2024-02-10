import { Metadata, ResolvingMetadata } from 'next';

import {
    findPaperByPath,
} from '../logic';

import Header from '@/components/Header';

import {
    renderDate,
} from '@/logic/utilities';



type Props = {
    params: { path: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata,
): Promise<Metadata> {
    const paper = findPaperByPath(params.path);
    if (!paper) {
        return {};
    }

    return {
        title: paper.metadata.title,
        description: paper.metadata.description,
    };
}


async function getData(
    path: string,
) {
    const paper = findPaperByPath(path);
    if (!paper) {
        return {};
    }

    return {
        props: {
            ...paper,
        },
    };
}


export default async function Paper({
    params,
}: Props) {
    const data = await getData(params.path);
    if (!data || !data.props) {
        return (
            <div
                className="flex flex-col items-center justify-center w-full h-full"
            >
                <Header />

                <div>
                    not found
                </div>
            </div>
        );
    }

    const {
        date,
        title,
        abstract,
        text,
    } = data.props;

    const {
        sections,
    } = text;

    return (
        <div
            className="flex flex-col items-center w-full p-8"
        >
            <Header />

            <h1
                className="text-xl text-center font-bold my-4"
            >
                {title}
            </h1>

            <h2
                className="text-lg mb-10"
            >
                {renderDate(date)}
            </h2>

            <div
                className="text-md mb-10"
            >
                {abstract}
            </div>

            {sections.map((section) => {
                const {
                    id,
                    title,
                    paragraphs,
                } = section;

                return (
                    <div
                        key={Math.random().toString()}
                        className="my-4 w-full max-w-2xl"
                    >
                        <h2
                            className="text-lg font-bold mb-2"
                            id={id}
                        >
                            <a
                                href={`#${id}`}
                            >
                                {title}
                            </a>
                        </h2>

                        {paragraphs.map((paragraph) => (
                            <p
                                key={Math.random().toString()}
                                className="text-md"
                                dangerouslySetInnerHTML={{__html: paragraph}}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
