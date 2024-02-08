import {
    renderDate,
} from '@/logic/utilities';



export default function SubtitleDateable({
    text,
    date,
} : {
    text: string;
    date: string;
}) {
    return (
        <h2
            className="text-sm uppercase underline underline-offset-4 p-2 pb-0 mb-1.5"
        >
            {renderDate(date)} · {text}
        </h2>
    );
}
