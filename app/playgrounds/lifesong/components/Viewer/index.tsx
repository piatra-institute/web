import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
  // Phase space parameters
  dimensions: number;
  attractorType: string;
  timeScale: number;
  nonlinearity: number;
  
  // Biological rhythms
  heartRate: number;
  breathingRate: number;
  brainwaveFreq: number;
  circadianPeriod: number;
  
  // Musical mapping
  scaleType: string;
  tempo: number;
  harmonicComplexity: number;
  timbreVariation: number;
  
  // Evolutionary parameters
  fitnessFunction: string;
  mutationRate: number;
  selectionPressure: number;
  
  // Visualization
  showPhaseSpace: boolean;
  showRhythms: boolean;
  showSpectrum: boolean;
  colorMode: string;
  
  // Audio
  enableAudio: boolean;
  volume: number;
  speedMs: number;
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

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  
  const [time, setTime] = useState(0);
  const [phaseSpacePoints, setPhaseSpacePoints] = useState<PhaseSpacePoint[]>([]);
  const [biologicalRhythms, setBiologicalRhythms] = useState<BiologicalRhythm[]>([]);
  const [spectrum, setSpectrum] = useState<number[]>([]);

  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = 'lifesong-phase-space.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }));

  // Initialize biological rhythms
  useEffect(() => {
    const rhythms: BiologicalRhythm[] = [
      {
        name: 'Heart',
        frequency: heartRate / 60, // Hz
        amplitude: 1.0,
        phase: 0,
        color: '#ef4444'
      },
      {
        name: 'Breathing',
        frequency: breathingRate / 60, // Hz
        amplitude: 0.8,
        phase: Math.PI / 4,
        color: '#3b82f6'
      },
      {
        name: 'Brainwave',
        frequency: brainwaveFreq,
        amplitude: 0.6,
        phase: Math.PI / 2,
        color: '#a855f7'
      },
      {
        name: 'Circadian',
        frequency: 1 / (circadianPeriod * 3600), // Hz (very low frequency)
        amplitude: 0.4,
        phase: 0,
        color: '#f59e0b'
      }
    ];
    setBiologicalRhythms(rhythms);
  }, [heartRate, breathingRate, brainwaveFreq, circadianPeriod]);

  // Initialize phase space points
  useEffect(() => {
    const numPoints = 50;
    const points: PhaseSpacePoint[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const radius = 100 + Math.random() * 50;
      
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: dimensions >= 3 ? (Math.random() - 0.5) * 200 : 0,
        vx: -Math.sin(angle) * 0.5,
        vy: Math.cos(angle) * 0.5,
        vz: dimensions >= 3 ? (Math.random() - 0.5) * 0.5 : 0,
        age: 0,
        frequency: 440 + Math.random() * 440, // Musical frequency
        amplitude: Math.random() * 0.5 + 0.5,
        phase: Math.random() * 2 * Math.PI
      });
    }
    
    setPhaseSpacePoints(points);
  }, [dimensions, attractorType]);

  // Audio synthesis setup
  useEffect(() => {
    if (enableAudio && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = undefined;
      }
    };
  }, [enableAudio]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const dt = speedMs / 1000 * timeScale;
      setTime(prev => prev + dt);
      
      setPhaseSpacePoints(prev => prev.map(point => {
        // Update position based on phase space dynamics
        let { x, y, z, vx, vy, vz } = point;
        
        // Apply attractor dynamics
        switch (attractorType) {
          case 'fixed-point':
            vx += -x * 0.01;
            vy += -y * 0.01;
            if (dimensions >= 3) vz! += -z! * 0.01;
            break;
            
          case 'limit-cycle':
            const r = Math.sqrt(x * x + y * y);
            const targetRadius = 100;
            vx += ((targetRadius - r) * x / r - y) * 0.01;
            vy += ((targetRadius - r) * y / r + x) * 0.01;
            break;
            
          case 'strange':
            // Lorenz-like attractor
            const sigma = 10, rho = 28, beta = 8/3;
            vx += sigma * (y - x) * 0.01;
            vy += (x * (rho - (z || 0)) - y) * 0.01;
            if (dimensions >= 3) vz! += (x * y - beta * (z || 0)) * 0.01;
            break;
            
          case 'torus':
            // Two-frequency oscillation
            const omega1 = 0.1, omega2 = 0.15;
            vx += -x * omega1 * omega1 + Math.sin(time * omega2) * 0.5;
            vy += -y * omega1 * omega1 + Math.cos(time * omega2) * 0.5;
            break;
        }
        
        // Add biological rhythm influences
        biologicalRhythms.forEach((rhythm, i) => {
          const influence = Math.sin(time * 2 * Math.PI * rhythm.frequency + rhythm.phase) * rhythm.amplitude * 0.1;
          if (i % 2 === 0) {
            vx += influence;
          } else {
            vy += influence;
          }
        });
        
        // Add nonlinearity
        if (nonlinearity > 0) {
          const magnitude = Math.sqrt(vx * vx + vy * vy);
          if (magnitude > 0) {
            const nonlinearFactor = 1 + nonlinearity * Math.sin(magnitude * 0.1);
            vx *= nonlinearFactor;
            vy *= nonlinearFactor;
          }
        }
        
        // Update positions
        x += vx * dt;
        y += vy * dt;
        if (dimensions >= 3) z! += vz! * dt;
        
        // Update musical parameters based on position
        const frequency = 220 + (Math.abs(x) + Math.abs(y)) * 0.5;
        const amplitude = Math.min(1, Math.sqrt(vx * vx + vy * vy) * 0.1);
        
        return {
          ...point,
          x, y, z,
          vx, vy, vz,
          age: point.age + dt,
          frequency,
          amplitude
        };
      }));
      
      // Update spectrum for visualization
      const frequencies = phaseSpacePoints.map(p => p.frequency);
      const spectrumBins = 64;
      const newSpectrum = new Array(spectrumBins).fill(0);
      
      frequencies.forEach(freq => {
        const bin = Math.floor((freq - 220) / (880 - 220) * spectrumBins);
        if (bin >= 0 && bin < spectrumBins) {
          newSpectrum[bin] += 1;
        }
      });
      
      setSpectrum(newSpectrum);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    speedMs, timeScale, attractorType, nonlinearity, biologicalRhythms,
    phaseSpacePoints.length, dimensions
  ]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw phase space if enabled
    if (showPhaseSpace) {
      drawPhaseSpace(ctx, centerX, centerY);
    }
    
    // Draw biological rhythms if enabled
    if (showRhythms) {
      drawBiologicalRhythms(ctx, canvas.width, canvas.height);
    }
    
    // Draw spectrum if enabled
    if (showSpectrum) {
      drawSpectrum(ctx, canvas.width, canvas.height);
    }
    
    // Draw info overlay
    drawInfoOverlay(ctx, canvas.width, canvas.height);
    
  }, [phaseSpacePoints, biologicalRhythms, spectrum, showPhaseSpace, showRhythms, showSpectrum, colorMode, time]);

  const drawPhaseSpace = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const scale = 1.5;
    
    // Draw trajectory trails
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 1;
    
    // Draw current points
    ctx.globalAlpha = 1.0;
    phaseSpacePoints.forEach((point, i) => {
      const x = centerX + point.x * scale;
      const y = centerY + point.y * scale;
      
      // Color based on selected mode
      let color = '#84cc16';
      switch (colorMode) {
        case 'frequency':
          const freqHue = ((point.frequency - 220) / (880 - 220)) * 120;
          color = `hsl(${freqHue}, 70%, 50%)`;
          break;
        case 'amplitude':
          const ampBrightness = Math.floor(point.amplitude * 255);
          color = `rgb(${ampBrightness}, 255, ${ampBrightness})`;
          break;
        case 'phase':
          const phaseHue = (point.phase / (2 * Math.PI)) * 360;
          color = `hsl(${phaseHue}, 80%, 60%)`;
          break;
        case 'energy':
          const energy = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
          const energyBrightness = Math.min(255, Math.floor(energy * 100));
          color = `rgb(255, ${energyBrightness}, 0)`;
          break;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw velocity vectors
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + point.vx * 10, y + point.vy * 10);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  };

  const drawBiologicalRhythms = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const startX = 20;
    const rhythmHeight = 60;
    const timeWindow = 10; // seconds
    const pixelsPerSecond = (width - 40) / timeWindow;
    
    biologicalRhythms.forEach((rhythm, i) => {
      const y = 20 + i * rhythmHeight;
      
      // Draw rhythm wave
      ctx.strokeStyle = rhythm.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let t = 0; t < timeWindow; t += 0.1) {
        const x = startX + t * pixelsPerSecond;
        const amplitude = Math.sin((time - timeWindow + t) * 2 * Math.PI * rhythm.frequency + rhythm.phase);
        const yPos = y + amplitude * 20;
        
        if (t === 0) {
          ctx.moveTo(x, yPos);
        } else {
          ctx.lineTo(x, yPos);
        }
      }
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = rhythm.color;
      ctx.font = '12px monospace';
      ctx.fillText(`${rhythm.name}: ${rhythm.frequency.toFixed(2)}Hz`, startX, y - 5);
    });
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const spectrumY = height - 120;
    const barWidth = (width - 40) / spectrum.length;
    
    ctx.fillStyle = 'rgba(132, 204, 22, 0.1)';
    ctx.fillRect(20, spectrumY, width - 40, 100);
    
    spectrum.forEach((magnitude, i) => {
      const x = 20 + i * barWidth;
      const barHeight = (magnitude / Math.max(...spectrum, 1)) * 80;
      
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(x, spectrumY + 100 - barHeight, barWidth - 1, barHeight);
    });
    
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('Frequency Spectrum', 20, spectrumY - 5);
  };

  const drawInfoOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    
    const info = [
      `Time: ${time.toFixed(1)}s`,
      `Attractor: ${attractorType}`,
      `Dimensions: ${dimensions}`,
      `Points: ${phaseSpacePoints.length}`,
      `Audio: ${enableAudio ? 'ON' : 'OFF'}`,
    ];
    
    info.forEach((text, i) => {
      ctx.fillText(text, width - 20, 20 + i * 16);
    });
  };

  return (
    <div className="w-full h-full bg-black relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full border border-gray-700 rounded-lg"
      />
      {enableAudio && (
        <div className="absolute bottom-4 left-4 text-xs text-lime-400 font-mono">
          ♪ Audio synthesis enabled
        </div>
      )}
    </div>
  );
});

Viewer.displayName = 'LifesongViewer';

export default Viewer;