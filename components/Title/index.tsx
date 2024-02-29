export default function Title({
    text,
} : {
    text: string;
}) {
    return (
        <h1
            className="text-md text-center uppercase font-bold mb-10"
        >
            {text}
        </h1>
    );
}
