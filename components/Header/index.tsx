import Link from 'next/link';
import Image from 'next/image';



export default function Header() {
    return (
        <header
            className="my-8"
        >
            <Link
                href="/"
                tabIndex={-1}
            >
                <Image
                    src="/piatra-institute.png"
                    height={175}
                    width={175}
                    alt="piatra.institute"
                    className="pointer-events-none justify-self-center m-auto mb-2"
                    priority
                />

                <h1
                    className="font-bold text-lg text-center uppercase"
                >
                    PIATRA . INSTITUTE
                </h1>
            </Link>
        </header>
    );
}
