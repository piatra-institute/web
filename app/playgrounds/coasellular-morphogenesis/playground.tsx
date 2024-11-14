'use client';

import {
    useState,
    useEffect,
} from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import Input from '@/components/Input';



export default function CoasellularMorphogenesisPlayground() {
    return (
        <div
            className="z-10 relative flex flex-col items-center justify-center min-h-screen py-2"
        >
            <Header />

            <Title
                text="coasellular morphogenesis"
            />

            <div
                className="max-w-80 mb-6 text-center"
            >
                bioelectric and cellular agents interactions and negotiations based on Coase&apos;s theorem
            </div>

            <div>
                {/* // TODO: add playground */}
            </div>
        </div>
    );
}
