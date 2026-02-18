'use client';

import React, {
    useState,
} from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
    linkButtonStyle,
    focusStyle,
} from '@/data/styles';

import {
    links,
} from './data';



function Logo() {
    return (
        <Image
            src="/piatra-institute.png"
            height={450}
            width={450}
            alt="piatra.institute"
            className="pointer-events-none justify-self-center"
            priority
        />
    );
}

function Title() {
    return (
        <h1
            className="w-full sm:w-auto sm:min-w-95 sm:max-w-100 p-2 bg-lime-50 text-black uppercase text-base font-bold sm:text-2xl my-4 mx-auto sm:my-4 sm:mx-auto"
        >
            piatra . institute
        </h1>
    );
}

function EmailIcon() {
    return (
        <svg
            width="14px" height="14px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                display: 'inline',
                padding: '0.1rem',
            }}
        >
            <path
                d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167"
                stroke="#f7fee7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    );
}

function Subtitle() {
    return (
        <h2 className="text-xs my-2">
            Piatra Institute of Arts & Technologies Recursively Applied
            <span
                style={{
                    marginLeft: '0.1rem',
                    padding: '0.1rem',
                }}
            >
                <a
                    href="mailto:contact@piatra.institute"
                    className={focusStyle}
                >
                    <EmailIcon />
                </a>
            </span>
        </h2>
    );
}

interface MottoProps {
    expandedNoem: boolean;
    setExpandedNoem: (value: boolean) => void;
}

function Motto({
    expandedNoem,
    setExpandedNoem,
}: MottoProps) {
    return (
        <div className="relative p-4">
            <p className="m-2">
                <span className="text-sm uppercase">love</span>
                {' '}
                <span className="text-emerald-500">
                    <span className={expandedNoem ? 'text-emerald-500' : 'text-black'}>
                        for the
                    </span>
                    {' '}other
                </span>
            </p>

            <p
                className={`absolute -translate-x-1/2 ${expandedNoem ? 'text-black' : 'text-emerald-500'} cursor-pointer`}
                style={{
                    top: '42px',
                    left: '50%',
                }}
                onClick={() => setExpandedNoem(!expandedNoem)}
            >
                for the
            </p>

            <p className="m-1">
                <span className="text-sm uppercase">care</span>
                {' '}
                <span className="text-emerald-500">
                    <span className={expandedNoem ? 'text-emerald-500' : 'text-black'}>
                        for the
                    </span>
                    {' '}world
                </span>
            </p>

            <p className="m-1">
                <span className="text-sm uppercase">&&nbsp;&nbsp;&nbsp;deep research</span>
            </p>
        </div>
    );
}

function Navigation() {
    return (
        <div className="flex flex-col md:flex-row justify-center space-x-1 md:space-x-3">
            {links.map(({ href, label }, index) => (
                <React.Fragment key={href}>
                    <Link
                        href={href}
                        className={linkButtonStyle}
                        draggable={false}
                        prefetch={true}
                    >
                        {label}
                    </Link>

                    {index < links.length - 1 && (
                        <div>·</div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}


export default function Home() {
    const [expandedNoem, setExpandedNoem] = useState(false);

    return (
        <main className="md:h-screen flex items-center justify-center p-10 select-none overflow-scroll lg:overflow-auto">
            <div className="max-w-5xl w-full items-center justify-center grid text-center text-lime-50">
                <Logo />
                <Title />
                <Subtitle />
                <Motto
                    expandedNoem={expandedNoem}
                    setExpandedNoem={setExpandedNoem}
                />
                <Navigation />
            </div>
        </main>
    );
}
