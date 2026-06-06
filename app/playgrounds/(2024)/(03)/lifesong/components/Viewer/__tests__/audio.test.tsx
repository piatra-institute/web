import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import Viewer from '../index';


class FakeAudioParam {
    value = 0;

    setValueAtTime = vi.fn((value: number) => {
        if (!Number.isFinite(value)) throw new Error('non-finite AudioParam value');
        this.value = value;
    });

    setTargetAtTime = vi.fn((value: number) => {
        if (!Number.isFinite(value)) throw new Error('non-finite AudioParam value');
        this.value = value;
    });

    linearRampToValueAtTime = vi.fn((value: number) => {
        if (!Number.isFinite(value)) throw new Error('non-finite AudioParam value');
        this.value = value;
    });
}

class FakeGainNode {
    gain = new FakeAudioParam();
    connect = vi.fn();
    disconnect = vi.fn();
}

class FakeOscillatorNode {
    frequency = new FakeAudioParam();
    type: OscillatorType = 'sine';
    connect = vi.fn();
    disconnect = vi.fn();
    start = vi.fn();
    stop = vi.fn();
}

const createdOscillators: FakeOscillatorNode[] = [];

class FakeAudioContext {
    currentTime = 0;
    destination = {};
    state: AudioContextState = 'running';

    createGain() {
        return new FakeGainNode();
    }

    createOscillator() {
        const oscillator = new FakeOscillatorNode();
        createdOscillators.push(oscillator);
        return oscillator;
    }

    resume = vi.fn(() => Promise.resolve());
    close = vi.fn(() => Promise.resolve());
}

const canvasContext = {
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    globalAlpha: 1,
    lineWidth: 1,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
};

const defaultProps = {
    dimensions: 3,
    attractorType: 'strange',
    timeScale: 1,
    nonlinearity: 0.5,
    heartRate: 72,
    breathingRate: 16,
    brainwaveFreq: 10,
    circadianPeriod: 24,
    scaleType: 'pentatonic',
    tempo: 120,
    harmonicComplexity: 0.5,
    timbreVariation: 0.3,
    fitnessFunction: 'harmony',
    mutationRate: 0.05,
    selectionPressure: 0.7,
    showPhaseSpace: true,
    showRhythms: true,
    showSpectrum: true,
    colorMode: 'frequency',
    enableAudio: true,
    volume: 0.5,
    speedMs: 50,
};

beforeEach(() => {
    createdOscillators.length = 0;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('webkitAudioContext', FakeAudioContext);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const getContextSpy = vi.spyOn(
        HTMLCanvasElement.prototype,
        'getContext',
    ) as unknown as { mockImplementation: (implementation: () => unknown) => void };
    getContextSpy.mockImplementation(() => canvasContext);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

test('enabling audio creates audible oscillator voices', () => {
    render(<Viewer {...defaultProps} />);

    expect(createdOscillators.length).toBeGreaterThan(0);
    expect(createdOscillators.every((oscillator) => oscillator.connect.mock.calls.length > 0)).toBe(true);
    expect(createdOscillators.every((oscillator) => oscillator.start.mock.calls.length === 1)).toBe(true);
});

test('audio synthesis guards non-finite parameter values', () => {
    expect(() => {
        render(
            <Viewer
                {...defaultProps}
                brainwaveFreq={Number.NaN}
                harmonicComplexity={Number.POSITIVE_INFINITY}
                tempo={Number.NaN}
                volume={Number.NaN}
            />,
        );
    }).not.toThrow();
});
