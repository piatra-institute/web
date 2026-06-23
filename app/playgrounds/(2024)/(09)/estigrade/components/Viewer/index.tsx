'use client';

import Image from 'next/image';


interface ViewerProps {
    finalGrade: number;
}


export default function Viewer({ finalGrade }: ViewerProps) {
    return (
        <div className="flex flex-col items-center text-lime-100">
            <div className="max-w-[300px] p-4 min-h-[22px] overflow-auto md:max-w-[700px] mb-8 text-center">
                <Image
                    src="/assets-playgrounds/estigrade/estigrade-formula.png"
                    alt="estigrade formula"
                    className="select-none"
                    height={22}
                    width={600}
                    priority={true}
                    draggable={false}
                    style={{
                        width: '600px',
                        height: '22px',
                        maxWidth: 'initial',
                    }}
                />
            </div>

            <div className="flex justify-between mt-8 mb-12 text-xl font-bold">
                <div>Final Grade:</div>
                <div className="px-4 xl:px-8 text-lime-400">
                    {finalGrade}
                </div>
            </div>
        </div>
    );
}
