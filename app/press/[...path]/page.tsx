import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';

import {
    focusStyle,
} from '@/data/styles';

import Header from '@/components/Header';

import {
    findPressItemByPath,
    getPathFromParams,
} from '../logic';

import PressTitle from '../components/PressTitle';



type Props = {
    params: { path: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata,
): Promise<Metadata> {
    const pressItem = findPressItemByPath(getPathFromParams(params.path));
    if (!pressItem) {
        return {};
    }

    return {
        title: pressItem.metadata.title,
        description: pressItem.metadata.description,
    };
}


async function getPDF(
    path: any,
) {
    const fullPath = getPathFromParams(path);
    if (!fullPath.endsWith('.pdf')) {
        return;
    }

    const basePath = fullPath.replace('.pdf', '');
    const pressItem = findPressItemByPath(basePath);
    if (!pressItem) {
        return;
    }

    return pressItem.pdf;
}


async function getData(
    path: any,
) {
    const pressItem = findPressItemByPath(getPathFromParams(path));
    if (!pressItem) {
        return {};
    }

    return {
        props: {
            ...pressItem,
        },
    };
}


export default async function PressItem({
    params,
}: Props) {
    const pdfFile = await getPDF(params.path);
    if (pdfFile) {
        redirect(pdfFile);
    }

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
        details,
        pdf,
        text,
    } = data.props;

    const {
        sections,
    } = text;

    return (
        <div
            className="flex flex-col items-center w-full p-8"
            // style={{ // -- reader overwrites
            //     background: 'white !important',
            //     color: 'black !important',
            // }}
        >
            <Header />

            <div
                className="p-6 w-full max-w-2xl"
            >
                <div
                    className="text-center"
                >
                    <div
                        className="mb-4"
                    >
                        <a
                            href={pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs uppercase p-1 ${focusStyle}`}
                        >
                            . pdf
                        </a>
                    </div>

                    <PressTitle
                        {...details}
                    />
                </div>

                {sections.map((section) => {
                    const {
                        translation,
                    } = section;

                    return (
                        <div
                            key={Math.random().toString()}
                            className="my-4 w-full max-w-2xl text-justify"
                        >
                            {translation}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
