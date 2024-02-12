import { Metadata, ResolvingMetadata } from 'next';

import {
    findProvocationByPath,
} from '../logic';

import Concern from '@/components/Concern';
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
    const provocation = findProvocationByPath(params.path);
    if (!provocation) {
        return {};
    }

    return {
        title: provocation.metadata.title,
        description: provocation.metadata.description,
    };
}


async function getData(
    path: string,
) {
    const provocation = findProvocationByPath(path);
    if (!provocation) {
        return {};
    }

    return {
        props: {
            ...provocation,
        },
    };
}


export default async function Provocation({
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
        person,
        title,
        prerequisites,
        concerns,
    } = data.props;

    return (
        <div
            className="flex flex-col items-center w-full h-full p-8"
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
                {renderDate(date)} {person}
            </h2>

            <div
                className="sm:w-full md:w-[700px] -mx-8 md:mx-auto"
            >
                {prerequisites && (
                    <div
                        className="m-auto mb-10 w-full md:w-[400px]"
                    >
                        <h3
                            className="text-lg text-center font-bold mb-4"
                        >
                            prerequisites
                        </h3>

                        {prerequisites.map(prerequisite => {
                            return (
                                <div
                                    key={prerequisite}
                                    className="text-sm text-center mb-4 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: prerequisite }}
                                />
                            );
                        })}
                    </div>
                )}

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
