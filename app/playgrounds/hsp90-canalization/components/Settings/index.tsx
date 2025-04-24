import { useState, useMemo } from 'react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import SettingsContainer from '@/components/SettingsContainer';



interface Props {
    capacity: number; setCapacity: (n: number) => void;
    gSD: number; setGSD: (n: number) => void;
    eSD: number; setESD: (n: number) => void;
    k: number; setK: (n: number) => void;
    zSlice: number; setZSlice: (n: number) => void;

    showLatent: boolean; setShowLatent: (b: boolean) => void;
    showPlane: boolean; setShowPlane: (b: boolean) => void;
    showHalos: boolean; setShowHalos: (b: boolean) => void;

    ratio: number;
    reset: () => void;
}

/* helper to apply values */
const apply = (
    p: Props,
    cfg: { C: number; g: number; e: number; k: number },
) => {
    p.setCapacity(cfg.C);
    p.setGSD(cfg.g);
    p.setESD(cfg.e);
    p.setK(cfg.k);
};

export default function Settings(p: Props) {
    /* note attached to last-clicked preset */
    const [presetNote, setPresetNote] = useState<string>('');

    /* dynamic interpretation ------------------------------------------------ */
    const summary = useMemo(() => {
        /* ratio-based message */
        const hidden = (1 - p.ratio) * 100;
        let auto =
            'Strong canalization (Rutherford & Lindquist 1998)';
        if (hidden < 70 && hidden > 30)
            auto = 'Partial masking - cryptic variance emerging (Milton 2006)';
        if (hidden <= 30)
            auto = 'Buffer depleted; latent variation visible (Flatt 2005)';

        /* combine preset note + auto note */
        return presetNote ? `${presetNote}\n${auto}` : auto;
    }, [p.ratio, presetNote]);

    /* ---------------------------------------------------------------------- */
    return (
        <SettingsContainer>
            {/* preset buttons */}
            <div className="flex gap-2 justify-center mb-6">
                <Button
                    size="xs"
                    onClick={() => {
                        apply(p, { C: 1.0, g: 0.5, e: 0.3, k: 6 });
                        setPresetNote('Wild-type baseline (all variance buffered)');
                    }}
                    label="Wild-type"
                />
                <Button
                    size="xs"
                    onClick={() => {
                        apply(p, { C: 0.4, g: 1.0, e: 0.5, k: 6 });
                        setPresetNote('Heat-shock (Hsp90 capacity transiently ↓)');
                    }}
                    label="Heat-shock"
                />
                <Button
                    size="xs"
                    onClick={() => {
                        apply(p, { C: 0.05, g: 1.5, e: 0.2, k: 4 });
                        setPresetNote('Geldanamycin-treated (Hsp90 activity ≈ 0) - buffer largely collapsed');
                    }}
                    label="GA-inhibited"
                />
            </div>

            {/* sliders */}
            {[
                {
                    label: 'Buffer&nbsp;capacity&nbsp;<i>C</i>',
                    v: p.capacity, set: p.setCapacity, min: 0, max: 1, step: 0.05,
                },
                {
                    label: '&#963;<sub>G</sub>&nbsp;(cryptic&nbsp;genetic&nbsp;SD)',
                    v: p.gSD, set: p.setGSD, min: 0, max: 2, step: 0.05,
                },
                {
                    label: '&#963;<sub>E</sub>&nbsp;(environmental&nbsp;SD)',
                    v: p.eSD, set: p.setESD, min: 0, max: 1, step: 0.05,
                },
                {
                    label: '<i>k</i>&nbsp;(buffer&nbsp;threshold&nbsp;steepness)',
                    v: p.k, set: p.setK, min: 1, max: 10, step: 0.5,
                },
                {
                    label: 'cross-section slice',
                    v: p.zSlice, set: p.setZSlice, min: -3, max: 3, step: 0.1,
                },
            ].map(s => (
                <div key={s.label} className="space-y-1">
                    <div className="flex justify-between">
                        <span dangerouslySetInnerHTML={{ __html: s.label }} />

                        <span className="text-lime-200">{s.v.toFixed(s.step < 1 ? 2 : 0)}</span>
                    </div>
                    <Input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.v}
                        onChange={v => { setPresetNote?.(''); s.set(parseFloat(v)); }}
                        compact centered
                    />
                </div>
            ))}

            <br />

            {/* toggles */}
            <Toggle text="Show latent" value={p.showLatent} toggle={() => p.setShowLatent(!p.showLatent)} />
            <Toggle text="Show section plane" value={p.showPlane} toggle={() => p.setShowPlane(!p.showPlane)} />
            <Toggle text="Show halos" value={p.showHalos} toggle={() => p.setShowHalos(!p.showHalos)} />

            <br />

            {/* metrics */}
            <div className="mt-4 space-y-1 text-sm">
                <div>
                    Buffered &#963; / Latent &#963;&nbsp;
                    <span className="text-lime-200">{Math.sqrt(p.ratio).toFixed(2)}</span>
                </div>
                <div>
                    Hidden variance&nbsp;
                    <span className="text-lime-200">{((1 - p.ratio) * 100).toFixed(0)}%</span>
                </div>
            </div>

            {/* interpretation */}
            <div className="mt-3 bg-white/10 p-2 text-xs italic whitespace-pre-line rounded">
                {summary}
            </div>

            <br />

            <Button className="w-full mt-4" onClick={() => { setPresetNote(''); p.reset(); }} label="Reset" />
        </SettingsContainer>
    );
}
