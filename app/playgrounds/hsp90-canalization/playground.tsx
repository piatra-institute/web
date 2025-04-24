'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import RadarGlyph from './components/RadarGlyph';



const defaults = {
    capacity: 0.15,
    gSD: 1.5,
    eSD: 0.2,
    k: 3.5,
    zSlice: 3,
    showLatent: false,
    showPlane: true,
    showHalos: false,
};

export default function Hsp90CanalizationPlayground() {
    const [capacity, setCapacity] = useState(defaults.capacity);
    const [gSD, setGSD] = useState(defaults.gSD);
    const [eSD, setESD] = useState(defaults.eSD);
    const [k, setK] = useState(defaults.k);
    const [zSlice, setZSlice] = useState(defaults.zSlice);

    const [showLatent, setShowLatent] = useState(defaults.showLatent);
    const [showPlane, setShowPlane] = useState(defaults.showPlane);
    const [showHalos, setShowHalos] = useState(defaults.showHalos);

    const [ratio,setRatio] = useState(0);
    const [axisVar, setAxisVar] = useState({x:0,y:0,z:0});

    const reset = () => {
        setCapacity(defaults.capacity);
        setGSD(defaults.gSD);
        setESD(defaults.eSD);
        setK(defaults.k);
        setZSlice(defaults.zSlice);
        setShowLatent(defaults.showLatent);
        setShowPlane(defaults.showPlane);
        setShowHalos(defaults.showHalos);
    };

    return (
        <div className="relative min-h-screen">
            {/* 3-D viewer fills page */}
            <div className="absolute inset-0">
                <Viewer
                    capacity={capacity}
                    gSD={gSD}
                    eSD={eSD}
                    k={k}
                    zSlice={zSlice}
                    showLatent={showLatent}
                    showPlane={showPlane}
                    showHalos={showHalos}
                    setRatio={setRatio}
                    setAxisVar={setAxisVar}
                />

                <RadarGlyph {...axisVar} />
            </div>

            {/* overlay text */}
            <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none">
                <Header />
                <Title text="Hsp90 Canalization Explorer" />
                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    {/* interactively visualising how the chaperone&nbsp;Hsp90
                    <br /> buffers — and releases — latent phenotypic variance */}

                    explore how the molecular chaperone Hsp90 buffers,
                    <br /> reveals and reshapes hidden phenotypic variance
                    <br />
                    <br />
                    adjust C, σ<sub>G</sub>, σ<sub>E</sub> and k with live presets
                    <br />
                    slice the cloud, toggle latent rings / halos,
                    <br />
                    read the variance-radar and fitness colours,
                    <br />
                    watch canalization strengthen or collapse in real time
                </div>
            </div>

            {/* right-hand settings panel */}
            <Settings
                capacity={capacity} setCapacity={setCapacity}
                gSD={gSD} setGSD={setGSD}
                eSD={eSD} setESD={setESD}
                k={k} setK={setK}
                zSlice={zSlice} setZSlice={setZSlice}
                showLatent={showLatent} setShowLatent={setShowLatent}
                showPlane={showPlane} setShowPlane={setShowPlane}
                showHalos={showHalos} setShowHalos={setShowHalos}
                ratio={ratio}
                reset={reset}
            />
        </div>
    );
}
