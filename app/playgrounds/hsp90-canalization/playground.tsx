'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import RadarGlyph from './components/RadarGlyph';
import FitnessLegend from './components/FitnessLegend';
import { CaptureHandle } from './components/CaptureHelper';



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
    const viewerRef = useRef<CaptureHandle>(null);

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

    const exportPNG = () => {
        requestAnimationFrame(() => {
            if (!viewerRef.current) return;
            const dataURL = viewerRef.current.capture();

            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `hsp90_snapshot_${Date.now()}.png`;
            a.click();
        });
    };

    return (
        <div className="relative min-h-screen">
            {/* 3-D viewer fills page */}
            <div className="absolute inset-0">
                <Viewer
                    ref={viewerRef}
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

                <div className="absolute bottom-4 left-4">
                    <FitnessLegend />
                </div>
            </div>

            {/* overlay text */}
            <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none">
                <Header />
                <Title text="Hsp90 Canalization Explorer" />
                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    {/* interactively visualising how the chaperone&nbsp;Hsp90
                    <br /> buffers — and releases — latent phenotypic variance */}

                    explore how the molecular chaperone Hsp90 buffers,
                    <br />
                    reveals and reshapes hidden phenotypic variance

                    <br />
                    <br />

                    adjust buffer capacity <i>C</i>
                    <br />
                    cryptic genetic standard deviation &#963;<sub>G</sub>
                    <br />
                    environmental standard deviation &#963;<sub>E</sub>
                    <br />
                    buffer threshold steepness <i>k</i>
                    <br />
                    <br />
                    {/* slice the cloud, toggle latent rings / halos,
                    <br />
                    read the variance-radar and fitness colors,
                    <br />
                    watch canalization strengthen or collapse in real time */}
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
                onExport={exportPNG}
            />
        </div>
    );
}
