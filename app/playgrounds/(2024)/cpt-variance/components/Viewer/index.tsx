import React, { useEffect, useRef, useState } from 'react';

interface ViewerProps {
  chargeViolation: number;
  parityViolation: number;
  timeViolation: number;
  cptViolation: number;
  showIndividualTransforms: boolean;
  showCombinedTransforms: boolean;
  showKaonOscillations: boolean;
  showMatterAntimatter: boolean;
  animationSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  charge: number;
  type: 'matter' | 'antimatter';
  color: string;
  age: number;
}

const Viewer: React.FC<ViewerProps> = ({
  chargeViolation,
  parityViolation,
  timeViolation,
  cptViolation,
  showIndividualTransforms,
  showCombinedTransforms,
  showKaonOscillations,
  showMatterAntimatter,
  animationSpeed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [time, setTime] = useState(0);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const numParticles = 20;
    
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        charge: Math.random() > 0.5 ? 1 : -1,
        type: Math.random() > 0.5 ? 'matter' : 'antimatter',
        color: Math.random() > 0.5 ? '#84cc16' : '#22c55e',
        age: 0,
      });
    }
    setParticles(newParticles);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setTime(prev => prev + animationSpeed * 0.016);
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx * animationSpeed,
        y: particle.y + particle.vy * animationSpeed,
        age: particle.age + animationSpeed * 0.016,
        // Apply CPT violations
        vx: particle.vx * (1 - cptViolation * 0.1),
        vy: particle.vy * (1 - cptViolation * 0.1),
      })));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationSpeed, cptViolation]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw symmetry transformations
    if (showIndividualTransforms) {
      drawIndividualTransforms(ctx, canvas);
    }
    
    if (showCombinedTransforms) {
      drawCombinedTransforms(ctx, canvas);
    }
    
    if (showKaonOscillations) {
      drawKaonOscillations(ctx, canvas);
    }
    
    if (showMatterAntimatter) {
      drawMatterAntimatterAsymmetry(ctx, canvas);
    }
    
    // Draw particles
    particles.forEach(particle => {
      drawParticle(ctx, particle);
    });
    
    // Draw violation indicators
    drawViolationIndicators(ctx, canvas);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particles, showIndividualTransforms, showCombinedTransforms, showKaonOscillations, showMatterAntimatter, chargeViolation, parityViolation, timeViolation, cptViolation, time]);

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const violationAlpha = 1 - (chargeViolation + parityViolation + timeViolation) / 3;
    
    ctx.save();
    ctx.globalAlpha = violationAlpha;
    
    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x % 800, particle.y % 400, 4, 0, 2 * Math.PI);
    ctx.fillStyle = particle.type === 'matter' ? '#84cc16' : '#ef4444';
    ctx.fill();
    
    // Draw charge indicator
    ctx.fillStyle = particle.charge > 0 ? '#ffffff' : '#000000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(particle.charge > 0 ? '+' : '-', particle.x % 800, (particle.y % 400) + 3);
    
    ctx.restore();
  };

  const drawIndividualTransforms = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 4;
    const centerY = canvas.height / 2;
    
    // C transformation
    ctx.save();
    ctx.strokeStyle = `rgba(132, 204, 22, ${1 - chargeViolation})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX - 60, centerY, 30, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('C', centerX - 60, centerY + 4);
    ctx.restore();
    
    // P transformation  
    ctx.save();
    ctx.strokeStyle = `rgba(132, 204, 22, ${1 - parityViolation})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P', centerX, centerY + 4);
    ctx.restore();
    
    // T transformation
    ctx.save();
    ctx.strokeStyle = `rgba(132, 204, 22, ${1 - timeViolation})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX + 60, centerY, 30, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('T', centerX + 60, centerY + 4);
    ctx.restore();
  };

  const drawCombinedTransforms = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Combined CPT
    const cptIntegrity = 1 - cptViolation * 10; // Scale for visibility
    ctx.save();
    ctx.strokeStyle = `rgba(132, 204, 22, ${cptIntegrity})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.stroke();
    
    if (cptViolation > 0) {
      ctx.strokeStyle = `rgba(239, 68, 68, ${cptViolation * 10})`;
      ctx.setLineDash([2, 8]);
      ctx.stroke();
    }
    
    ctx.fillStyle = cptIntegrity > 0.5 ? '#84cc16' : '#ef4444';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CPT', centerX, centerY + 6);
    ctx.restore();
  };

  const drawKaonOscillations = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = (canvas.width * 3) / 4;
    const centerY = canvas.height / 3;
    
    // Kaon oscillation visualization
    const oscillation = Math.sin(time * 2) * (1 - parityViolation);
    
    ctx.save();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY);
    ctx.bezierCurveTo(
      centerX - 25, centerY + oscillation * 30,
      centerX + 25, centerY - oscillation * 30,
      centerX + 50, centerY
    );
    ctx.stroke();
    
    // K0 and anti-K0
    ctx.fillStyle = '#84cc16';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('K⁰', centerX - 50, centerY - 10);
    ctx.fillText('K̄⁰', centerX + 50, centerY - 10);
    
    // CP violation indicator
    if (parityViolation > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${parityViolation})`;
      ctx.fillText('CP', centerX, centerY + oscillation * 30 + 20);
    }
    ctx.restore();
  };

  const drawMatterAntimatterAsymmetry = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = (canvas.width * 3) / 4;
    const centerY = (canvas.height * 2) / 3;
    
    // Matter-antimatter bar chart
    const matterRatio = 0.5 + cptViolation * 5;
    const antimatterRatio = 0.5 - cptViolation * 5;
    
    ctx.save();
    
    // Matter bar
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(centerX - 60, centerY - matterRatio * 50, 25, matterRatio * 50);
    
    // Antimatter bar  
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(centerX - 30, centerY - antimatterRatio * 50, 25, antimatterRatio * 50);
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('M', centerX - 47, centerY + 15);
    ctx.fillText('A', centerX - 17, centerY + 15);
    
    // Asymmetry value
    const asymmetry = matterRatio - antimatterRatio;
    ctx.fillStyle = asymmetry > 0.01 ? '#ef4444' : '#84cc16';
    ctx.fillText(`Δ: ${asymmetry.toFixed(3)}`, centerX - 32, centerY + 30);
    
    ctx.restore();
  };

  const drawViolationIndicators = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    
    const violations = [
      `C Violation: ${(chargeViolation * 100).toFixed(1)}%`,
      `P Violation: ${(parityViolation * 100).toFixed(1)}%`,
      `T Violation: ${(timeViolation * 100).toFixed(1)}%`,
      `CPT Violation: ${(cptViolation * 1000).toFixed(2)}‰`,
    ];
    
    violations.forEach((text, i) => {
      const color = i === 3 && cptViolation > 0 ? '#ef4444' : '#84cc16';
      ctx.fillStyle = color;
      ctx.fillText(text, 10, 20 + i * 16);
    });
    
    ctx.restore();
  };

  return (
    <div className="w-full h-full bg-black relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full border border-gray-700 rounded-lg"
      />
      <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
        Time: {time.toFixed(1)}s
      </div>
    </div>
  );
};

export default Viewer;