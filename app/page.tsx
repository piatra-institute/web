import Image from 'next/image';



export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="max-w-5xl w-full items-center justify-center grid text-center">
                <Image
                    src="/piatra-institute.png"
                    height={450}
                    width={450}
                    alt="piatra.institute"
                    className="pointer-events-none"
                />

                <h1
                    className="m-2 mx-8 p-2 bg-white text-black uppercase text-2xl font-bold"
                >
                    piatra . institute
                </h1>

                <div
                    className="p-4"
                >
                    <p className="m-1">
                        <span className="text-sm uppercase">love</span> <span className="text-emerald-500">for the other</span>
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">care</span> <span className="text-emerald-500">for the world</span>
                    </p>

                    <p className="m-1">
                        <span className="text-sm uppercase">&&nbsp;&nbsp;deep research</span>
                    </p>

                    {/* <p>
                        data · concepts · tools
                    </p> */}
                </div>
            </div>
        </main>
    );
}
