import {
    PressItemDetails,
} from '@/data';



export type PressTitleProps = PressItemDetails & {
    inText?: boolean;
}


export default function PressTitle({
    inText,
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
                className={'text-xs text-left italic mb-4'}
            >
                {title}
            </div>

            <div
                className={'text-xs text-center uppercase mb-2'}
            >
                {year} / {language}
            </div>

            <div
                className={inText ?'text-lg mb-8 text-center' : 'text-base text-left'}
            >
                {translation}
            </div>
        </>
    );
}
