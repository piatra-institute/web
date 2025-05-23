export default function Title({
    text,
} : {
    text: string;
}) {
    return (
        <h1
            className="text-md text-center text-shadow uppercase font-bold mb-10 z-50"
        >
            {text}
        </h1>
    );
}
