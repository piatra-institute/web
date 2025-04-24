import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import { useMemo } from 'react';

interface Props {
    /* sliders */
    capacity: number; setCapacity: (n: number) => void;
    gSD: number; setGSD: (n: number) => void;
    eSD: number; setESD: (n: number) => void;
    k: number; setK: (n: number) => void;
    zSlice: number; setZSlice: (n: number) => void;
    /* toggles */
    showLatent: boolean; setShowLatent: (b: boolean) => void;
    showPlane: boolean; setShowPlane: (b: boolean) => void;
    showHalos: boolean; setShowHalos: (b: boolean) => void;
    /* live data from Viewer */
    ratio: number;
    /* util */
    reset: () => void;
}

export default function Settings(p: Props) {
    /* derive nicer metrics */
    const { hiddenPct, summary } = useMemo(() => {
        const hidden = (1 - p.ratio) * 100;
        let comment = 'Strong canalization (Rutherford & Lindquist 1998)';
        if (hidden < 70 && hidden > 30)
            comment = 'Partial masking – cryptic variance emerging (Milton 2006)';
        if (hidden <= 30)
            comment = 'Buffer depleted; latent variation visible (Flatt 2005)';
        return { hiddenPct: hidden.toFixed(0), summary: comment };
    }, [p.ratio]);

    return (
        <div className="absolute right-0 top-0 z-10 mr-4 mt-4 w-[22rem]
                    bg-black/60 backdrop-blur-sm border border-white/20 text-white">

            {/* panel header ---------------------------------------------------- */}
            <div className="border-b border-white/20 px-4 py-2 font-semibold">
                Settings
            </div>

            {/* numeric sliders ------------------------------------------------- */}
            <div className="p-4 space-y-4">
                {[
                    { label: 'Capacity (C)', v: p.capacity, set: p.setCapacity, min: 0, max: 1, step: 0.05 },
                    { label: 'σ G', v: p.gSD, set: p.setGSD, min: 0, max: 2, step: 0.05 },
                    { label: 'σ E', v: p.eSD, set: p.setESD, min: 0, max: 1, step: 0.05 },
                    { label: 'k (steep.)', v: p.k, set: p.setK, min: 1, max: 10, step: 0.5 },
                    { label: 'Z-slice', v: p.zSlice, set: p.setZSlice, min: -3, max: 3, step: 0.1 },
                ].map(s => (
                    <div key={s.label} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span>{s.label}</span>
                            <span className="text-lime-200">{s.v.toFixed(s.step < 1 ? 2 : 0)}</span>
                        </div>
                        <Input
                            type="range" min={s.min} max={s.max} step={s.step}
                            value={s.v}
                            onChange={v => s.set(parseFloat(v))}
                            compact centered
                        />
                    </div>
                ))}

                {/* toggles ------------------------------------------------------- */}
                <Toggle text="Show latent" value={p.showLatent} toggle={() => p.setShowLatent(!p.showLatent)} />
                <Toggle text="Show section plane" value={p.showPlane} toggle={() => p.setShowPlane(!p.showPlane)} />
                <Toggle text="Show halos" value={p.showHalos} toggle={() => p.setShowHalos(!p.showHalos)} />

                {/* metrics ------------------------------------------------------- */}
                <div className="mt-4 space-y-1 text-sm">
                    <div>Buffered σ / Latent σ&nbsp;&nbsp;
                        <span className="text-lime-200">{Math.sqrt(p.ratio).toFixed(2)}</span>
                    </div>
                    <div>Hidden variance&nbsp;&nbsp;
                        <span className="text-lime-200">{hiddenPct}%</span>
                    </div>
                </div>

                {/* interpretation area ------------------------------------------ */}
                <div className="mt-3 bg-white/10 p-2 text-xs italic rounded">
                    {summary}
                </div>

                <Button onClick={p.reset} label="Reset" />
            </div>
        </div>
    );
}
