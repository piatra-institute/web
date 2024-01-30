import { Metadata, ResolvingMetadata } from 'next';

import {
    findProvocationByPath,
    renderDate,
} from '../logic';

import Concern from '@/components/Concern';
import Header from '@/components/Header';



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


export default async function Provocations({
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
        concerns,
    } = data.props;

    return (
        <div
            className="flex flex-col items-center w-full h-full p-8"
        >
            <Header />

            <h1
                className="text-xl font-bold mt-4 mb-4"
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
