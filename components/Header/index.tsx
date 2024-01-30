import Link from 'next/link';
import Image from 'next/image';



export default function Header() {
    return (
        <header
            className="mb-8"
        >
            <Link
                href="/"
            >
                <Image
                    src="/piatra-institute.png"
                    height={175}
                    width={175}
                    alt="piatra.institute"
                    className="pointer-events-none justify-self-center mb-2"
                    priority
                />

                <h1
                    className="font-bold"
                >
                    PIATRA . INSTITUTE
                </h1>
            </Link>
        </header>
    );
}
