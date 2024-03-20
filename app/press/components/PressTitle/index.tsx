export interface PressTitleProps {
    link: string;
    authors: string[];
    metadata: string;
    title: string;
    year: string;
    language: string;
    translation: string;
}


export default function PressTitle({
    link,
    authors,
    metadata,
    title,
    year,
    language,
    translation,
}: PressTitleProps) {
    return (
        <>
            <div
                className={'text-sm uppercase mb-2'}
            >
                {authors.join(', ')}
            </div>

            <div
                className={'text-xs mb-2'}
            >
                {metadata}
            </div>

            <div
                className={'text-xs text-left italic mb-2'}
            >
                {title}
            </div>

            <div
                className={'text-base text-left mb-2'}
            >
                <span
                    className={'text-xs uppercase'}
                >
                    {year} / {language} /
                </span> <span
                    className={'text-lg'}
                >
                    {translation}
                </span>
            </div>
        </>
    );
}
