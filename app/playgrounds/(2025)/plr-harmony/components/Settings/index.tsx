'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';

const NOTE_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

interface SettingsProps {
    onSettingsChange: (params: {
        srcRoot: number;
        srcMaj: boolean;
        dstRoot: number;
        dstMaj: boolean;
        maxPaths: number;
        rWeight: number;
        useFlats: boolean;
    }) => void;
}

export interface SettingsRef {
    reset: () => void;
}

const Settings = forwardRef<SettingsRef, SettingsProps>(({ onSettingsChange }, ref) => {
    const [srcRoot, setSrcRoot] = useState(0); // C
    const [srcMaj, setSrcMaj] = useState(true);
    const [dstRoot, setDstRoot] = useState(4); // E
    const [dstMaj, setDstMaj] = useState(true);
    const [maxPaths, setMaxPaths] = useState(16);
    const [rWeight, setRWeight] = useState(2);
    const [useFlats, setUseFlats] = useState(false);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setSrcRoot(0);
            setSrcMaj(true);
            setDstRoot(4);
            setDstMaj(true);
            setMaxPaths(16);
            setRWeight(2);
            setUseFlats(false);
        }
    }));

    useEffect(() => {
        onSettingsChange({
            srcRoot,
            srcMaj,
            dstRoot,
            dstMaj,
            maxPaths,
            rWeight,
            useFlats
        });
    }, [srcRoot, srcMaj, dstRoot, dstMaj, maxPaths, rWeight, useFlats, onSettingsChange]);

    const notes = useFlats ? NOTE_FLATS : NOTE_SHARPS;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Source Triad</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-gray-400 text-sm">Root Note</label>
                        <select
                            value={srcRoot}
                            onChange={(e) => setSrcRoot(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                        >
                            {notes.map((note, i) => (
                                <option key={i} value={i}>{note}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Major"
                            onClick={() => setSrcMaj(true)}
                            className={srcMaj ? 'bg-lime-500/20 border-lime-500' : ''}
                        />
                        <Button
                            label="Minor"
                            onClick={() => setSrcMaj(false)}
                            className={!srcMaj ? 'bg-lime-500/20 border-lime-500' : ''}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Target Triad</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-gray-400 text-sm">Root Note</label>
                        <select
                            value={dstRoot}
                            onChange={(e) => setDstRoot(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 bg-black border border-lime-500/20 text-lime-400 focus:outline-none focus:border-lime-500/50"
                        >
                            {notes.map((note, i) => (
                                <option key={i} value={i}>{note}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Major"
                            onClick={() => setDstMaj(true)}
                            className={dstMaj ? 'bg-lime-500/20 border-lime-500' : ''}
                        />
                        <Button
                            label="Minor"
                            onClick={() => setDstMaj(false)}
                            className={!dstMaj ? 'bg-lime-500/20 border-lime-500' : ''}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Options</h3>
                <div className="space-y-3">
                    <SliderInput
                        label="Max Paths"
                        value={maxPaths}
                        onChange={setMaxPaths}
                        min={1}
                        max={64}
                        step={1}
                    />
                    <SliderInput
                        label="R Weight"
                        value={rWeight}
                        onChange={setRWeight}
                        min={1}
                        max={5}
                        step={1}
                    />
                    <Toggle
                        text="Use Flats"
                        value={useFlats}
                        toggle={() => setUseFlats(!useFlats)}
                    />
                </div>
            </div>

            <Button
                label="Reset"
                onClick={() => {
                    setSrcRoot(0);
                    setSrcMaj(true);
                    setDstRoot(4);
                    setDstMaj(true);
                    setMaxPaths(16);
                    setRWeight(2);
                    setUseFlats(false);
                }}
                className="w-full"
            />
        </div>
    );
});

Settings.displayName = 'Settings';

export default Settings;