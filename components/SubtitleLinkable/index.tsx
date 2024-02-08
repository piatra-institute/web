import Link from 'next/link';

import {
    linkAnchorStyle,
} from '@/data/styles';



export default function SubtitleLinkable({
    text,
    link,
} : {
    text: string;
    link: string;
}) {
    return (
        <h2
            className="mb-2"
        >
            <Link
                href={link}
                target="_blank"
                className={linkAnchorStyle}
            >
                {text}
            </Link>
        </h2>
    );
}
