import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';


interface ViewerProps {
    dimensions: number;
    attractorType: string;
    timeScale: number;
    nonlinearity: number;
    heartRate: number;
    breathingRate: number;
    brainwaveFreq: number;
    circadianPeriod: number;
    scaleType: string;
    tempo: number;
    harmonicComplexity: number;
    timbreVariation: number;
    fitnessFunction: string;
    mutationRate: number;
    selectionPressure: number;
    showPhaseSpace: boolean;
    showRhythms: boolean;
    showSpectrum: boolean;
    colorMode: string;
    enableAudio: boolean;
    volume: number;
    speedMs: number;
}

export type LifesongExportKind = 'image' | 'audio' | 'video';

export interface LifesongExportOptions {
    kind: LifesongExportKind;
    includeOverlay: boolean;
}

export interface LifesongViewerRef {
    exportCanvas: (includeOverlay?: boolean) => Promise<void>;
    exportAudio: () => Promise<void>;
    exportVideo: (includeOverlay?: boolean) => Promise<void>;
    exportMedia: (options: LifesongExportOptions) => Promise<void>;
}

interface PhaseSpacePoint {
    x: number;
    y: number;
    z?: number;
    vx: number;
    vy: number;
    vz?: number;
    age: number;
    frequency: number;
    amplitude: number;
    phase: number;
}

interface BiologicalRhythm {
    name: string;
    frequency: number;
    amplitude: number;
    phase: number;
    color: string;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface AudioVoice {
    oscillator: OscillatorNode;
    gain: GainNode;
}

interface VoicePlan {
    frequencies: number[];
    gains: number[];
    waveforms: OscillatorType[];
    masterGain: number;
}

const AUDIO_VOICE_COUNT = 4;
const DEFAULT_CANVAS_SIZE = { width: 1100, height: 680 };
const EXPORT_AUDIO_SECONDS = 12;
const EXPORT_VIDEO_SECONDS = 6;
const EXPORT_VIDEO_FPS = 30;

const SCALES: Record<string, number[]> = {
    pentatonic: [0, 2, 4, 7, 9],
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'whole-tone': [0, 2, 4, 6, 8, 10],
};

const FITNESS_OFFSETS: Record<string, number> = {
    harmony: 0,
    complexity: 5,
    stability: -5,
    novelty: 9,
};

function finiteOr(value: number, fallback: number): number {
    return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
    const finiteValue = finiteOr(value, min);
    return Math.max(min, Math.min(max, finiteValue));
}

function frequencyToMidi(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
}

function midiToFrequency(midi: number): number {
    return 440 * 2 ** ((midi - 69) / 12);
}

function quantizeFrequency(frequency: number, scaleType: string): number {
    const scale = SCALES[scaleType] ?? SCALES.pentatonic;
    const midi = frequencyToMidi(clamp(frequency, 55, 1760));
    const baseOctave = Math.floor(midi / 12);
    let closest = midi;
    let closestDistance = Infinity;

    for (let octave = baseOctave - 1; octave <= baseOctave + 1; octave += 1) {
        for (const pitchClass of scale) {
            const candidate = octave * 12 + pitchClass;
            const distance = Math.abs(candidate - midi);
            if (distance < closestDistance) {
                closest = candidate;
                closestDistance = distance;
            }
        }
    }

    return clamp(midiToFrequency(closest), 70, 1400);
}

function waveformFor(index: number, timbreVariation: number): OscillatorType {
    const waveforms: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
    const spread = Math.floor(clamp(timbreVariation, 0, 1) * (waveforms.length - 1));
    return waveforms[Math.min(waveforms.length - 1, index + spread)];
}

function triangle(phase: number): number {
    return (2 / Math.PI) * Math.asin(Math.sin(phase));
}

function waveformSample(type: OscillatorType, phase: number): number {
    switch (type) {
        case 'triangle':
            return triangle(phase);
        case 'sawtooth':
            return 2 * (phase / (2 * Math.PI) - Math.floor(0.5 + phase / (2 * Math.PI)));
        case 'square':
            return Math.sin(phase) >= 0 ? 1 : -1;
        default:
            return Math.sin(phase);
    }
}

function averagePointFrequency(points: PhaseSpacePoint[]): number {
    const sample = points
        .slice(0, 12)
        .map(point => point.frequency)
        .filter(Number.isFinite);

    if (sample.length === 0) return 440;
    return sample.reduce((sum, frequency) => sum + frequency, 0) / sample.length;
}

function formatRhythmFrequency(rhythm: BiologicalRhythm): string {
    if (rhythm.frequency < 0.01) {
        const hours = 1 / (rhythm.frequency * 3600);
        return `${hours.toFixed(1)}h`;
    }
    return `${rhythm.frequency.toFixed(2)}Hz`;
}

function buildVoicePlan({
    phaseSpacePoints,
    heartRate,
    breathingRate,
    brainwaveFreq,
    harmonicComplexity,
    mutationRate,
    nonlinearity,
    scaleType,
    selectionPressure,
    tempo,
    timbreVariation,
    fitnessFunction,
    time,
    volume,
}: {
    phaseSpacePoints: PhaseSpacePoint[];
    heartRate: number;
    breathingRate: number;
    brainwaveFreq: number;
    harmonicComplexity: number;
    mutationRate: number;
    nonlinearity: number;
    scaleType: string;
    selectionPressure: number;
    tempo: number;
    timbreVariation: number;
    fitnessFunction: string;
    time: number;
    volume: number;
}): VoicePlan {
    const pointFrequency = averagePointFrequency(phaseSpacePoints);
    const fitnessOffset = FITNESS_OFFSETS[fitnessFunction] ?? 0;
    const safeTempo = clamp(tempo, 30, 240);
    const pulse = 0.72 + 0.28 * Math.sin(finiteOr(time, 0) * 2 * Math.PI * (safeTempo / 60));
    const frequencies = [
        110 + clamp(heartRate, 0, 220) * 2.25 + pointFrequency * 0.06,
        130 + clamp(breathingRate, 0, 80) * 6.5 + clamp(harmonicComplexity, 0, 1) * 90,
        100 + clamp(brainwaveFreq, 0, 80) * 18 + clamp(nonlinearity, 0, 1) * 80,
        pointFrequency * (0.52 + clamp(harmonicComplexity, 0, 1) * 0.5) +
            clamp(mutationRate, 0, 1) * 700 +
            fitnessOffset,
    ].map(freq => quantizeFrequency(freq, scaleType));

    const gains = [
        0.15 * pulse,
        0.11 + clamp(breathingRate, 0, 80) / 500,
        0.08 + clamp(harmonicComplexity, 0, 1) * 0.08,
        0.06 + clamp(selectionPressure, 0, 1) * 0.07,
    ].map(gain => clamp(gain, 0, 0.3));

    return {
        frequencies,
        gains,
        waveforms: Array.from({ length: AUDIO_VOICE_COUNT }, (_, index) => waveformFor(index, timbreVariation)),
        masterGain: clamp(volume, 0, 1) * 0.42,
    };
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Could not export canvas'));
        }, 'image/png');
    });
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, value: string) => {
        for (let i = 0; i < value.length; i += 1) {
            view.setUint8(offset + i, value.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i += 1) {
        const sample = clamp(samples[i], -1, 1);
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

function supportedVideoMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
    ];
    return candidates.find(candidate => MediaRecorder.isTypeSupported(candidate)) ?? '';
}

function getCanvasLayout(
    width: number,
    height: number,
    showRhythms: boolean,
    showSpectrum: boolean,
) {
    const margin = 22;
    const titleHeight = 36;
    const gap = 14;
    const rhythmHeight = showRhythms ? Math.min(128, Math.max(72, height * 0.2)) : 0;
    const spectrumHeight = showSpectrum ? Math.min(110, Math.max(64, height * 0.16)) : 0;

    const rhythm: Rect = {
        x: margin,
        y: margin + titleHeight,
        width: width - margin * 2,
        height: rhythmHeight,
    };

    const spectrum: Rect = {
        x: margin,
        y: height - margin - spectrumHeight,
        width: width - margin * 2,
        height: spectrumHeight,
    };

    const phaseY = margin + titleHeight + (showRhythms ? rhythmHeight + gap : 0);
    const phaseBottom = showSpectrum ? spectrum.y - gap : height - margin;
    const phase: Rect = {
        x: margin,
        y: phaseY,
        width: width - margin * 2,
        height: Math.max(120, phaseBottom - phaseY),
    };

    return { phase, rhythm, spectrum };
}

function drawPanel(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    label: string,
    includeOverlay: boolean,
) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(132, 204, 22, 0.045)';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (!includeOverlay) return;

    ctx.fillStyle = 'rgba(217, 249, 157, 0.45)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, rect.x + 10, rect.y + 18);
}

function colorForPoint(point: PhaseSpacePoint, colorMode: string): string {
    switch (colorMode) {
        case 'frequency': {
            const freqHue = ((point.frequency - 220) / (880 - 220)) * 120;
            return `hsl(${freqHue}, 70%, 50%)`;
        }
        case 'amplitude': {
            const ampBrightness = Math.floor(point.amplitude * 255);
            return `rgb(${ampBrightness}, 255, ${ampBrightness})`;
        }
        case 'phase': {
            const phaseHue = (point.phase / (2 * Math.PI)) * 360;
            return `hsl(${phaseHue}, 80%, 60%)`;
        }
        case 'energy': {
            const energy = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
            const energyBrightness = Math.min(255, Math.floor(energy * 100));
            return `rgb(255, ${energyBrightness}, 0)`;
        }
        default:
            return '#84cc16';
    }
}

const Viewer = forwardRef<LifesongViewerRef, ViewerProps>(({
    dimensions,
    attractorType,
    timeScale,
    nonlinearity,
    heartRate,
    breathingRate,
    brainwaveFreq,
    circadianPeriod,
    scaleType,
    tempo,
    harmonicComplexity,
    timbreVariation,
    fitnessFunction,
    mutationRate,
    selectionPressure,
    showPhaseSpace,
    showRhythms,
    showSpectrum,
    colorMode,
    enableAudio,
    volume,
    speedMs,
}, ref) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const audioContextRef = useRef<AudioContext | undefined>(undefined);
    const masterGainRef = useRef<GainNode | undefined>(undefined);
    const audioVoicesRef = useRef<AudioVoice[]>([]);

    const [time, setTime] = useState(0);
    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
    const [phaseSpacePoints, setPhaseSpacePoints] = useState<PhaseSpacePoint[]>([]);
    const [biologicalRhythms, setBiologicalRhythms] = useState<BiologicalRhythm[]>([]);
    const [spectrum, setSpectrum] = useState<number[]>([]);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;

        let frameID: number | undefined;
        const measure = () => {
            const rect = frame.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) return;

            const next = {
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            };

            setCanvasSize(prev => (
                prev.width === next.width && prev.height === next.height ? prev : next
            ));
        };

        measure();

        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(() => {
                if (frameID) cancelAnimationFrame(frameID);
                frameID = requestAnimationFrame(measure);
            });
            observer.observe(frame);
            return () => {
                if (frameID) cancelAnimationFrame(frameID);
                observer.disconnect();
            };
        }

        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    useEffect(() => {
        const rhythms: BiologicalRhythm[] = [
            {
                name: 'Heart',
                frequency: heartRate / 60,
                amplitude: 1.0,
                phase: 0,
                color: '#ef4444',
            },
            {
                name: 'Breathing',
                frequency: breathingRate / 60,
                amplitude: 0.8,
                phase: Math.PI / 4,
                color: '#3b82f6',
            },
            {
                name: 'Brainwave',
                frequency: brainwaveFreq,
                amplitude: 0.6,
                phase: Math.PI / 2,
                color: '#a855f7',
            },
            {
                name: 'Circadian',
                frequency: 1 / (circadianPeriod * 3600),
                amplitude: 0.4,
                phase: 0,
                color: '#f59e0b',
            },
        ];
        setBiologicalRhythms(rhythms);
    }, [heartRate, breathingRate, brainwaveFreq, circadianPeriod]);

    useEffect(() => {
        const numPoints = 56;
        const points: PhaseSpacePoint[] = [];

        for (let i = 0; i < numPoints; i += 1) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const radius = 90 + Math.random() * 44;

            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: dimensions >= 3 ? (Math.random() - 0.5) * 170 : 0,
                vx: -Math.sin(angle) * 0.5,
                vy: Math.cos(angle) * 0.5,
                vz: dimensions >= 3 ? (Math.random() - 0.5) * 0.5 : 0,
                age: 0,
                frequency: 440 + Math.random() * 440,
                amplitude: Math.random() * 0.5 + 0.5,
                phase: Math.random() * 2 * Math.PI,
            });
        }

        setPhaseSpacePoints(points);
    }, [dimensions, attractorType]);

    const stopAudio = useCallback(() => {
        const context = audioContextRef.current;
        const now = context?.currentTime ?? 0;

        audioVoicesRef.current.forEach(({ oscillator, gain }) => {
            try {
                gain.gain.setTargetAtTime(0, now, 0.02);
                oscillator.stop(now + 0.06);
            } catch {
                // already stopped
            }
            try {
                oscillator.disconnect();
                gain.disconnect();
            } catch {
                // already disconnected
            }
        });

        audioVoicesRef.current = [];

        try {
            masterGainRef.current?.disconnect();
        } catch {
            // already disconnected
        }
        masterGainRef.current = undefined;

        if (context) {
            void context.close();
        }
        audioContextRef.current = undefined;
    }, []);

    const ensureAudioGraph = useCallback(() => {
        const AudioContextConstructor =
            window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextConstructor) return undefined;

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextConstructor();
        }

        const context = audioContextRef.current;

        if (!masterGainRef.current) {
            const masterGain = context.createGain();
            masterGain.gain.setValueAtTime(0, context.currentTime);
            masterGain.connect(context.destination);
            masterGainRef.current = masterGain;
        }

        while (audioVoicesRef.current.length < AUDIO_VOICE_COUNT) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = waveformFor(audioVoicesRef.current.length, timbreVariation);
            oscillator.frequency.setValueAtTime(220, context.currentTime);
            gain.gain.setValueAtTime(0, context.currentTime);
            oscillator.connect(gain);
            gain.connect(masterGainRef.current);
            oscillator.start();

            audioVoicesRef.current.push({ oscillator, gain });
        }

        return context;
    }, [timbreVariation]);

    useEffect(() => {
        if (!enableAudio) {
            stopAudio();
            return;
        }

        const context = ensureAudioGraph();
        if (context?.state === 'suspended') {
            void context.resume();
        }
    }, [enableAudio, ensureAudioGraph, stopAudio]);

    useEffect(() => () => stopAudio(), [stopAudio]);

    useEffect(() => {
        if (!enableAudio) return;

        const context = ensureAudioGraph();
        const masterGain = masterGainRef.current;
        if (!context || !masterGain) return;

        const voicePlan = buildVoicePlan({
            phaseSpacePoints,
            heartRate,
            breathingRate,
            brainwaveFreq,
            harmonicComplexity,
            mutationRate,
            nonlinearity,
            scaleType,
            selectionPressure,
            tempo,
            timbreVariation,
            fitnessFunction,
            time,
            volume,
        });

        masterGain.gain.setTargetAtTime(voicePlan.masterGain, context.currentTime, 0.05);

        audioVoicesRef.current.forEach(({ oscillator, gain }, index) => {
            oscillator.type = voicePlan.waveforms[index] ?? 'sine';
            oscillator.frequency.setTargetAtTime(
                voicePlan.frequencies[index] ?? 220,
                context.currentTime,
                0.04,
            );
            gain.gain.setTargetAtTime(
                voicePlan.gains[index] ?? 0,
                context.currentTime,
                0.08,
            );
        });
    }, [
        biologicalRhythms,
        brainwaveFreq,
        breathingRate,
        enableAudio,
        ensureAudioGraph,
        fitnessFunction,
        harmonicComplexity,
        heartRate,
        mutationRate,
        nonlinearity,
        phaseSpacePoints,
        scaleType,
        selectionPressure,
        tempo,
        timbreVariation,
        time,
        volume,
    ]);

    useEffect(() => {
        const animate = () => {
            const dt = speedMs / 1000 * timeScale;

            setTime(prev => prev + dt);
            setPhaseSpacePoints(prev => {
                const nextPoints = prev.map(point => {
                    let { x, y, z, vx, vy, vz } = point;
                    x = finiteOr(x, 0);
                    y = finiteOr(y, 0);
                    z = finiteOr(z ?? 0, 0);
                    vx = finiteOr(vx, 0);
                    vy = finiteOr(vy, 0);
                    vz = finiteOr(vz ?? 0, 0);

                    switch (attractorType) {
                        case 'fixed-point':
                            vx += -x * 0.01;
                            vy += -y * 0.01;
                            if (dimensions >= 3) vz! += -z! * 0.01;
                            break;
                        case 'limit-cycle': {
                            const r = Math.max(1, Math.sqrt(x * x + y * y));
                            const targetRadius = 100;
                            vx += ((targetRadius - r) * x / r - y) * 0.01;
                            vy += ((targetRadius - r) * y / r + x) * 0.01;
                            break;
                        }
                        case 'strange': {
                            const sigma = 10;
                            const rho = 28;
                            const beta = 8 / 3;
                            vx += sigma * (y - x) * 0.01;
                            vy += (x * (rho - (z || 0)) - y) * 0.01;
                            if (dimensions >= 3) vz! += (x * y - beta * (z || 0)) * 0.01;
                            break;
                        }
                        case 'torus': {
                            const omega1 = 0.1;
                            const omega2 = 0.15;
                            vx += -x * omega1 * omega1 + Math.sin(time * omega2) * 0.5;
                            vy += -y * omega1 * omega1 + Math.cos(time * omega2) * 0.5;
                            break;
                        }
                    }

                    biologicalRhythms.forEach((rhythm, i) => {
                        const influence =
                            Math.sin(time * 2 * Math.PI * rhythm.frequency + rhythm.phase) *
                            rhythm.amplitude *
                            0.1;

                        if (i % 2 === 0) {
                            vx += influence;
                        } else {
                            vy += influence;
                        }
                    });

                    if (nonlinearity > 0) {
                        const magnitude = Math.sqrt(vx * vx + vy * vy);
                        if (magnitude > 0) {
                            const nonlinearFactor = 1 + nonlinearity * Math.sin(magnitude * 0.1);
                            vx *= nonlinearFactor;
                            vy *= nonlinearFactor;
                        }
                    }

                    vx = clamp(vx, -180, 180);
                    vy = clamp(vy, -180, 180);
                    vz = clamp(vz ?? 0, -180, 180);

                    x += vx * dt;
                    y += vy * dt;
                    if (dimensions >= 3) z += vz * dt;

                    x = clamp(x, -420, 420);
                    y = clamp(y, -420, 420);
                    z = clamp(z ?? 0, -280, 280);

                    const frequency = clamp(220 + (Math.abs(x) + Math.abs(y)) * 0.5, 110, 1320);
                    const amplitude = clamp(Math.sqrt(vx * vx + vy * vy) * 0.1, 0, 1);

                    return {
                        ...point,
                        x,
                        y,
                        z: dimensions >= 3 ? z : 0,
                        vx,
                        vy,
                        vz,
                        age: point.age + dt,
                        frequency,
                        amplitude,
                    };
                });

                const spectrumBins = 64;
                const newSpectrum = new Array(spectrumBins).fill(0);
                nextPoints.forEach(point => {
                    const bin = Math.floor(((point.frequency - 220) / (880 - 220)) * spectrumBins);
                    if (bin >= 0 && bin < spectrumBins) {
                        newSpectrum[bin] += 1;
                    }
                });
                setSpectrum(newSpectrum);

                return nextPoints;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        speedMs,
        timeScale,
        attractorType,
        nonlinearity,
        biologicalRhythms,
        dimensions,
        time,
    ]);

    const renderFrame = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        includeOverlay: boolean,
        renderTime: number,
    ) => {
        const layout = getCanvasLayout(width, height, showRhythms, showSpectrum);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(132, 204, 22, 0.08)';
        ctx.fillRect(0, 0, width, 1);
        ctx.fillRect(0, height - 1, width, 1);

        if (includeOverlay) {
            drawTitle(ctx, width);
        }

        if (showRhythms) {
            drawBiologicalRhythms(ctx, layout.rhythm, renderTime, includeOverlay);
        }

        if (showPhaseSpace) {
            drawPhaseSpace(ctx, layout.phase, renderTime, includeOverlay);
        } else {
            drawPanel(ctx, layout.phase, 'phase space hidden', includeOverlay);
        }

        if (showSpectrum) {
            drawSpectrum(ctx, layout.spectrum, includeOverlay);
        }

        if (includeOverlay) {
            drawInfoOverlay(ctx, width, renderTime);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        renderFrame(ctx, canvas.width, canvas.height, true, time);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        canvasSize,
        phaseSpacePoints,
        biologicalRhythms,
        spectrum,
        showPhaseSpace,
        showRhythms,
        showSpectrum,
        colorMode,
        time,
    ]);

    const drawTitle = (ctx: CanvasRenderingContext2D, width: number) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#d9f99d';
        ctx.font = '13px monospace';
        ctx.fillText('lifesong · biological rhythms as phase-space music', 22, 26);

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(217, 249, 157, 0.45)';
        ctx.font = '11px monospace';
        ctx.fillText(`${scaleType} · ${tempo} bpm · ${fitnessFunction}`, width - 22, 26);
    };

    const drawPhaseSpace = (
        ctx: CanvasRenderingContext2D,
        rect: Rect,
        renderTime: number,
        includeOverlay: boolean,
    ) => {
        drawPanel(ctx, rect, `${attractorType} attractor · ${dimensions}D`, includeOverlay);

        if (phaseSpacePoints.length === 0) return;

        const maxX = Math.max(
            1,
            ...phaseSpacePoints.map(point => Math.abs(finiteOr(point.x, 0))),
        );
        const maxY = Math.max(
            1,
            ...phaseSpacePoints.map(point => Math.abs(finiteOr(point.y, 0))),
        );
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const scale = Math.min(
            (rect.width - 44) / (maxX * 2),
            (rect.height - 44) / (maxY * 2),
            2.35,
        );

        ctx.strokeStyle = 'rgba(132, 204, 22, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rect.x + 14, centerY);
        ctx.lineTo(rect.x + rect.width - 14, centerY);
        ctx.moveTo(centerX, rect.y + 24);
        ctx.lineTo(centerX, rect.y + rect.height - 14);
        ctx.stroke();

        const loopPhase =
            ((renderTime % EXPORT_VIDEO_SECONDS) / EXPORT_VIDEO_SECONDS) *
            2 *
            Math.PI;
        const rotation = loopPhase * (attractorType === 'strange' ? 0.9 : 0.55);
        const pulseX = 1 + 0.08 * Math.sin(loopPhase * 2);
        const pulseY = 1 + 0.08 * Math.cos(loopPhase * 2);

        phaseSpacePoints.forEach(point => {
            const depth = dimensions >= 3 ? clamp(point.z ?? 0, -180, 180) : 0;
            const localAngle = Math.atan2(point.y, point.x);
            const waveSize = 10 + point.amplitude * 16 + harmonicComplexity * 10;
            const waveX = Math.cos(localAngle * 2 + loopPhase * 2 + point.phase) * waveSize;
            const waveY = Math.sin(localAngle * 2 - loopPhase * 2 + point.phase) * waveSize;
            const twist = dimensions >= 3 ? (depth / 260) * Math.sin(loopPhase + point.phase) : 0;
            const cos = Math.cos(rotation + twist);
            const sin = Math.sin(rotation + twist);
            const animatedX =
                point.x * pulseX +
                waveX +
                Math.sin(loopPhase + point.phase) * depth * 0.045;
            const animatedY =
                point.y * pulseY +
                waveY +
                Math.cos(loopPhase + point.phase) * depth * 0.045;
            const rotatedX = animatedX * cos - animatedY * sin;
            const rotatedY = animatedX * sin + animatedY * cos;
            const x = centerX + rotatedX * scale + depth * 0.08 * Math.cos(loopPhase);
            const y = centerY + rotatedY * scale - depth * 0.05 * Math.sin(loopPhase);
            const color = colorForPoint(point, colorMode);
            const radius = 1.8 + point.amplitude * 2.2;

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.36;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + (point.vx * cos - point.vy * sin) * 7,
                y + (point.vx * sin + point.vy * cos) * 7,
            );
            ctx.stroke();
        });

        ctx.globalAlpha = 1;
    };

    const drawBiologicalRhythms = (
        ctx: CanvasRenderingContext2D,
        rect: Rect,
        renderTime: number,
        includeOverlay: boolean,
    ) => {
        drawPanel(ctx, rect, 'biological rhythm channels', includeOverlay);

        const startX = rect.x + 14;
        const endX = rect.x + rect.width - 14;
        const timeWindow = 8;
        const pixelsPerSecond = (endX - startX) / timeWindow;
        const laneHeight = (rect.height - 28) / Math.max(1, biologicalRhythms.length);

        biologicalRhythms.forEach((rhythm, i) => {
            const baseline = rect.y + 30 + i * laneHeight + laneHeight / 2;
            const amplitudePx = Math.max(6, laneHeight * 0.32);

            ctx.strokeStyle = rhythm.color;
            ctx.globalAlpha = 0.78;
            ctx.lineWidth = 1.6;
            ctx.beginPath();

            for (let t = 0; t < timeWindow; t += 0.08) {
                const x = startX + t * pixelsPerSecond;
                const wave =
                    Math.sin((renderTime - timeWindow + t) * 2 * Math.PI * rhythm.frequency + rhythm.phase);
                const y = baseline + wave * amplitudePx * rhythm.amplitude;

                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            ctx.globalAlpha = 1;
            if (!includeOverlay) return;

            ctx.fillStyle = rhythm.color;
            ctx.font = '11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${rhythm.name} · ${formatRhythmFrequency(rhythm)}`, startX, baseline - amplitudePx - 4);
        });
    };

    const drawSpectrum = (
        ctx: CanvasRenderingContext2D,
        rect: Rect,
        includeOverlay: boolean,
    ) => {
        drawPanel(ctx, rect, 'frequency spectrum', includeOverlay);

        if (spectrum.length === 0) return;

        const x0 = rect.x + 12;
        const y0 = rect.y + 28;
        const width = rect.width - 24;
        const height = rect.height - 40;
        const maxMagnitude = Math.max(...spectrum, 1);
        const barWidth = width / spectrum.length;

        spectrum.forEach((magnitude, i) => {
            const x = x0 + i * barWidth;
            const barHeight = (magnitude / maxMagnitude) * height;
            const alpha = 0.25 + (magnitude / maxMagnitude) * 0.6;

            ctx.fillStyle = `rgba(132, 204, 22, ${alpha})`;
            ctx.fillRect(x, y0 + height - barHeight, Math.max(1, barWidth - 1), barHeight);
        });
    };

    const drawInfoOverlay = (ctx: CanvasRenderingContext2D, width: number, renderTime: number) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';

        const info = [
            `t ${renderTime.toFixed(1)}s`,
            `${phaseSpacePoints.length} points`,
            `audio ${enableAudio ? 'on' : 'off'}`,
        ];

        info.forEach((text, i) => {
            ctx.fillText(text, width - 22, 48 + i * 15);
        });
    };

    const exportCanvas = async (includeOverlay = true) => {
        const source = canvasRef.current;
        const width = source?.width ?? DEFAULT_CANVAS_SIZE.width;
        const height = source?.height ?? DEFAULT_CANVAS_SIZE.height;
        const exportCanvasElement = document.createElement('canvas');
        exportCanvasElement.width = width;
        exportCanvasElement.height = height;

        const ctx = exportCanvasElement.getContext('2d');
        if (!ctx) return;

        renderFrame(ctx, width, height, includeOverlay, time);
        const blob = await canvasToBlob(exportCanvasElement);
        downloadBlob(blob, `lifesong-still-${includeOverlay ? 'annotated' : 'clean'}.png`);
    };

    const renderSongWav = () => {
        const sampleRate = 44_100;
        const totalSamples = EXPORT_AUDIO_SECONDS * sampleRate;
        const samples = new Float32Array(totalSamples);
        const voicePlan = buildVoicePlan({
            phaseSpacePoints,
            heartRate,
            breathingRate,
            brainwaveFreq,
            harmonicComplexity,
            mutationRate,
            nonlinearity,
            scaleType,
            selectionPressure,
            tempo,
            timbreVariation,
            fitnessFunction,
            time: 0,
            volume: Math.max(volume, 0.08),
        });
        const safeTempo = clamp(tempo, 30, 240);
        const beatLength = 60 / safeTempo;
        const phrase = [0, 2, 4, 7, 9, 7, 4, 2];
        const phases = new Array(AUDIO_VOICE_COUNT).fill(0);

        for (let i = 0; i < totalSamples; i += 1) {
            const t = i / sampleRate;
            const fadeIn = clamp(t / 0.35, 0, 1);
            const fadeOut = clamp((EXPORT_AUDIO_SECONDS - t) / 0.55, 0, 1);
            const envelope = fadeIn * fadeOut;
            const phraseIndex = Math.floor(t / beatLength) % phrase.length;
            const breathLfo = 0.72 + 0.28 * Math.sin(t * 2 * Math.PI * clamp(breathingRate, 1, 80) / 60);
            const heartLfo = 0.86 + 0.14 * Math.sin(t * 2 * Math.PI * clamp(heartRate, 1, 220) / 60);
            let value = 0;

            for (let voice = 0; voice < AUDIO_VOICE_COUNT; voice += 1) {
                const interval = phrase[(phraseIndex + voice * 2) % phrase.length] + voice * 7;
                const baseFrequency = voicePlan.frequencies[voice] ?? 220;
                const frequency = quantizeFrequency(baseFrequency * 2 ** (interval / 12), scaleType);
                const vibrato = 1 + Math.sin(t * 2 * Math.PI * (0.18 + voice * 0.07)) * 0.006;
                phases[voice] += (2 * Math.PI * frequency * vibrato) / sampleRate;
                const fundamental = waveformSample(voicePlan.waveforms[voice] ?? 'sine', phases[voice]);
                const harmonic = Math.sin(phases[voice] * 2 + voice) * clamp(harmonicComplexity, 0, 1) * 0.28;
                const voiceEnvelope = voice === 0 ? heartLfo : voice === 1 ? breathLfo : 1;

                value += (fundamental + harmonic) * (voicePlan.gains[voice] ?? 0) * voiceEnvelope;
            }

            samples[i] = clamp(value * voicePlan.masterGain * 1.7 * envelope, -0.92, 0.92);
        }

        return encodeWav(samples, sampleRate);
    };

    const exportAudio = async () => {
        downloadBlob(renderSongWav(), 'lifesong-song.wav');
    };

    const exportVideo = async (includeOverlay = true) => {
        const mimeType = supportedVideoMimeType();
        const source = canvasRef.current;

        if (!mimeType || typeof MediaRecorder === 'undefined' || !source?.captureStream) {
            window.alert('Video export is not supported in this browser.');
            return;
        }

        const width = source.width;
        const height = source.height;
        const exportCanvasElement = document.createElement('canvas');
        exportCanvasElement.width = width;
        exportCanvasElement.height = height;

        const ctx = exportCanvasElement.getContext('2d');
        if (!ctx) return;

        const stream = exportCanvasElement.captureStream(EXPORT_VIDEO_FPS);
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            downloadBlob(
                new Blob(chunks, { type: mimeType }),
                `lifesong-loop-${includeOverlay ? 'annotated' : 'clean'}.webm`,
            );
        };

        recorder.start();
        const startedAt = performance.now();

        const draw = (now: number) => {
            const elapsed = (now - startedAt) / 1000;
            renderFrame(ctx, width, height, includeOverlay, time + elapsed);

            if (elapsed < EXPORT_VIDEO_SECONDS) {
                requestAnimationFrame(draw);
            } else {
                recorder.stop();
            }
        };

        requestAnimationFrame(draw);
    };

    useImperativeHandle(ref, () => ({
        exportCanvas,
        exportAudio,
        exportVideo,
        exportMedia: async (options: LifesongExportOptions) => {
            if (options.kind === 'audio') {
                await exportAudio();
                return;
            }
            if (options.kind === 'video') {
                await exportVideo(options.includeOverlay);
                return;
            }
            await exportCanvas(options.includeOverlay);
        },
    }));

    return (
        <div
            ref={frameRef}
            className="relative h-[min(72vh,560px)] min-h-[420px] w-[min(94vw,1120px)] overflow-hidden border border-lime-500/25 bg-black md:h-[min(78vh,700px)]"
        >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute inset-0 h-full w-full"
            />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wide text-lime-200/45">
                <span>
                    {showPhaseSpace ? 'phase' : 'phase hidden'} · {showRhythms ? 'rhythms' : 'rhythms hidden'} · {showSpectrum ? 'spectrum' : 'spectrum hidden'}
                </span>
                {enableAudio && (
                    <span className="text-lime-400">
                        audio synthesis · volume {(volume * 100).toFixed(0)}%
                    </span>
                )}
            </div>
        </div>
    );
});

Viewer.displayName = 'LifesongViewer';

export default Viewer;
