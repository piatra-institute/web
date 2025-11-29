'use client';

import { useRef, useState } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
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

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
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
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        Hsp90 is a molecular chaperone that plays a crucial role in genetic
                        canalization - the ability of organisms to maintain consistent
                        phenotypes despite genetic and environmental variation. This playground
                        visualizes how Hsp90 buffers latent phenotypic variance.
                    </p>
                    <p>
                        Under normal conditions, Hsp90 masks the effects of cryptic genetic
                        variation, ensuring stable development. However, when Hsp90 function
                        is compromised (by stress, mutations, or inhibition), previously
                        hidden traits become visible, potentially accelerating evolution.
                    </p>
                    <p>
                        Key concepts include: genetic canalization, phenotypic buffering,
                        cryptic genetic variation, molecular chaperones, and evolutionary
                        capacitance in developmental systems.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
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
    );

    return (
        <PlaygroundLayout
            title="hsp90 canalization"
            subtitle="molecular chaperone buffers and reveals hidden phenotypic variance; explore how hsp90 shapes evolutionary potential"
            description={
                <a
                    href="https://www.nature.com/articles/24550"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    1998, Rutherford & Lindquist, Hsp90 as a Capacitor for Morphological Evolution
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}
