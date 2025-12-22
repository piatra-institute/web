import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
  // Core equation parameters
  couplingConstant: number;
  fieldAmplitude: number;
  spacetimeCurvature: number;
  quantumFluctuations: number;
  
  // Emergent phenomena
  showParticles: boolean;
  showForces: boolean;
  showSpacetime: boolean;
  showQuantumFoam: boolean;
  
  // Symmetries and conservation laws
  timeTranslation: boolean;
  spaceTranslation: boolean;
  rotation: boolean;
  gauge: boolean;
  
  // Observable parameters
  energyScale: number;
  lengthScale: number;
  dimensionality: number;
  temperature: number;
  
  // Visualization
  projectionType: string;
  colorScheme: string;
  showEquation: boolean;
  animateFields: boolean;
  
  speedMs: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  charge: number;
  spin: number;
  energy: number;
  type: 'fermion' | 'boson' | 'virtual';
  color: string;
  lifetime: number;
}

interface Field {
  x: number;
  y: number;
  strength: number;
  direction: number;
  type: 'electromagnetic' | 'weak' | 'strong' | 'gravitational';
}

interface SpacetimePoint {
  x: number;
  y: number;
  curvature: number;
  metric: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
  couplingConstant,
  fieldAmplitude,
  spacetimeCurvature,
  quantumFluctuations,
  showParticles,
  showForces,
  showSpacetime,
  showQuantumFoam,
  timeTranslation,
  spaceTranslation,
  rotation,
  gauge,
  energyScale,
  lengthScale,
  dimensionality,
  temperature,
  projectionType,
  colorScheme,
  showEquation,
  animateFields,
  speedMs,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [spacetime, setSpacetime] = useState<SpacetimePoint[]>([]);
  const [conservedQuantities, setConservedQuantities] = useState({
    energy: 0,
    momentum: { x: 0, y: 0, z: 0 },
    angularMomentum: 0,
    charge: 0
  });

  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = 'everything-relevant-unified.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }));

  // Initialize particles from field excitations
  useEffect(() => {
    const numParticles = Math.floor(20 + energyScale * 10);
    const newParticles: Particle[] = [];
    
    // Standard Model particles based on energy scale
    const particleTypes = energyScale > 100 ? 
      ['electron', 'muon', 'tau', 'neutrino', 'quark', 'photon', 'gluon', 'W', 'Z', 'higgs'] :
      energyScale > 1 ? 
      ['electron', 'photon', 'proton', 'neutron'] :
      ['electron', 'photon'];
    
    for (let i = 0; i < numParticles; i++) {
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const isBoson = ['photon', 'gluon', 'W', 'Z', 'higgs'].includes(type);
      
      newParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        z: dimensionality > 2 ? Math.random() * 200 : 0,
        vx: (Math.random() - 0.5) * 2 * fieldAmplitude,
        vy: (Math.random() - 0.5) * 2 * fieldAmplitude,
        vz: dimensionality > 2 ? (Math.random() - 0.5) * 2 * fieldAmplitude : 0,
        mass: isBoson && type !== 'W' && type !== 'Z' && type !== 'higgs' ? 0 : Math.random() * energyScale,
        charge: Math.floor(Math.random() * 3) - 1, // -1, 0, 1
        spin: isBoson ? Math.floor(Math.random() * 3) : 0.5, // 0, 1, 2 for bosons; 1/2 for fermions
        energy: energyScale * (0.5 + Math.random() * 0.5),
        type: isBoson ? 'boson' : 'fermion',
        color: getParticleColor(type),
        lifetime: type === 'virtual' ? 0.1 : Infinity
      });
    }
    
    setParticles(newParticles);
  }, [energyScale, fieldAmplitude, dimensionality]);

  // Initialize field configuration
  useEffect(() => {
    const gridSize = 20;
    const newFields: Field[] = [];
    
    for (let x = 0; x < 800; x += gridSize) {
      for (let y = 0; y < 600; y += gridSize) {
        newFields.push({
          x, y,
          strength: fieldAmplitude * (0.5 + Math.random() * 0.5),
          direction: Math.random() * 2 * Math.PI,
          type: ['electromagnetic', 'weak', 'strong', 'gravitational'][Math.floor(Math.random() * 4)] as Field['type']
        });
      }
    }
    
    setFields(newFields);
  }, [fieldAmplitude]);

  // Initialize spacetime geometry
  useEffect(() => {
    const gridSize = 40;
    const newSpacetime: SpacetimePoint[] = [];
    
    for (let x = 0; x < 800; x += gridSize) {
      for (let y = 0; y < 600; y += gridSize) {
        const distanceFromCenter = Math.sqrt((x - 400)**2 + (y - 300)**2);
        const curvature = spacetimeCurvature * Math.exp(-distanceFromCenter / 200);
        
        newSpacetime.push({
          x, y,
          curvature,
          metric: 1 + curvature * 0.1 // Simplified metric tensor component
        });
      }
    }
    
    setSpacetime(newSpacetime);
  }, [spacetimeCurvature]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const dt = speedMs / 1000;
      setTime(prev => prev + dt);
      
      // Update particles based on unified field equation
      setParticles(prev => prev.map(particle => {
        let { x, y, z, vx, vy, vz, energy } = particle;
        
        // Apply fundamental forces
        
        // Electromagnetic force (if charged)
        if (particle.charge !== 0) {
          const nearbyFields = fields.filter(f => 
            f.type === 'electromagnetic' && 
            Math.sqrt((f.x - x)**2 + (f.y - y)**2) < 50
          );
          
          nearbyFields.forEach(field => {
            const force = couplingConstant * particle.charge * field.strength;
            vx += Math.cos(field.direction) * force * dt;
            vy += Math.sin(field.direction) * force * dt;
          });
        }
        
        // Gravitational effects from spacetime curvature
        const nearbySpacetime = spacetime.filter(st => 
          Math.sqrt((st.x - x)**2 + (st.y - y)**2) < 80
        );
        
        if (nearbySpacetime.length > 0) {
          const avgCurvature = nearbySpacetime.reduce((sum, st) => sum + st.curvature, 0) / nearbySpacetime.length;
          const gravitationalAccel = avgCurvature * 50 * dt;
          
          // Geodesic deviation - particles follow curved spacetime
          const centerX = 400, centerY = 300;
          const directionToCenterX = (centerX - x) / Math.sqrt((centerX - x)**2 + (centerY - y)**2);
          const directionToCenterY = (centerY - y) / Math.sqrt((centerX - x)**2 + (centerY - y)**2);
          
          vx += directionToCenterX * gravitationalAccel;
          vy += directionToCenterY * gravitationalAccel;
        }
        
        // Quantum fluctuations
        if (quantumFluctuations > 0) {
          const fluctuation = quantumFluctuations * 0.1;
          vx += (Math.random() - 0.5) * fluctuation;
          vy += (Math.random() - 0.5) * fluctuation;
          if (dimensionality > 2) vz += (Math.random() - 0.5) * fluctuation;
        }
        
        // Apply symmetry constraints
        if (!timeTranslation) {
          // Energy not conserved - add time-dependent terms
          energy += Math.sin(time) * 0.1;
        }
        
        if (!spaceTranslation) {
          // Momentum not conserved - add position-dependent forces
          vx += -x * 0.0001;
          vy += -y * 0.0001;
        }
        
        if (!rotation) {
          // Angular momentum not conserved - add torque
          const angularVel = Math.atan2(vy, vx);
          vx += Math.cos(angularVel + Math.PI/2) * 0.01;
          vy += Math.sin(angularVel + Math.PI/2) * 0.01;
        }
        
        // Update position
        x += vx * dt;
        y += vy * dt;
        if (dimensionality > 2) z += vz * dt;
        
        // Boundary conditions based on projection type
        if (projectionType === 'compactified') {
          // Periodic boundary conditions
          x = ((x % 800) + 800) % 800;
          y = ((y % 600) + 600) % 600;
        } else {
          // Reflective boundaries
          if (x < 0 || x > 800) vx *= -0.9;
          if (y < 0 || y > 600) vy *= -0.9;
          x = Math.max(0, Math.min(800, x));
          y = Math.max(0, Math.min(600, y));
        }
        
        // Update energy based on kinetic + potential
        const kineticEnergy = 0.5 * particle.mass * (vx*vx + vy*vy + vz*vz);
        energy = kineticEnergy + particle.mass * 299792458**2; // E = mc²
        
        return { ...particle, x, y, z, vx, vy, vz, energy };
      }));
      
      // Update fields if animating
      if (animateFields) {
        setFields(prev => prev.map(field => ({
          ...field,
          strength: field.strength * (1 + 0.1 * Math.sin(time + field.x * 0.01)),
          direction: field.direction + 0.1 * dt
        })));
      }
      
      // Calculate conserved quantities
      if (timeTranslation || spaceTranslation || rotation || gauge) {
        const totalEnergy = particles.reduce((sum, p) => sum + p.energy, 0);
        const totalMomentum = particles.reduce((acc, p) => ({
          x: acc.x + p.mass * p.vx,
          y: acc.y + p.mass * p.vy,
          z: acc.z + p.mass * p.vz
        }), { x: 0, y: 0, z: 0 });
        const totalCharge = particles.reduce((sum, p) => sum + p.charge, 0);
        const totalAngularMomentum = particles.reduce((sum, p) => 
          sum + p.mass * (p.x * p.vy - p.y * p.vx), 0);
        
        setConservedQuantities({
          energy: totalEnergy,
          momentum: totalMomentum,
          angularMomentum: totalAngularMomentum,
          charge: totalCharge
        });
      }
      
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
    speedMs, couplingConstant, quantumFluctuations, spacetimeCurvature,
    timeTranslation, spaceTranslation, rotation, gauge,
    projectionType, animateFields, fields, spacetime, particles, time, dimensionality
  ]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with cosmic background
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 600);
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw spacetime curvature if enabled
    if (showSpacetime) {
      drawSpacetime(ctx);
    }
    
    // Draw quantum foam if enabled
    if (showQuantumFoam && quantumFluctuations > 0) {
      drawQuantumFoam(ctx);
    }
    
    // Draw force fields if enabled
    if (showForces) {
      drawFields(ctx);
    }
    
    // Draw particles if enabled
    if (showParticles) {
      drawParticles(ctx);
    }
    
    // Draw unified equation if enabled
    if (showEquation) {
      drawUnifiedEquation(ctx, canvas.width, canvas.height);
    }
    
    // Draw conserved quantities
    drawConservedQuantities(ctx, canvas.width, canvas.height);
    
    // Draw info overlay
    drawInfoOverlay(ctx, canvas.width, canvas.height);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particles, fields, spacetime, conservedQuantities,
    showParticles, showForces, showSpacetime, showQuantumFoam, showEquation,
    colorScheme, quantumFluctuations, time
  ]);

  const getParticleColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'electron': '#00f0ff',
      'muon': '#0080ff',
      'tau': '#004080',
      'neutrino': '#404040',
      'quark': '#ff4040',
      'photon': '#ffff00',
      'gluon': '#ff8000',
      'W': '#8000ff',
      'Z': '#4000ff',
      'higgs': '#ff00ff',
      'proton': '#ff4040',
      'neutron': '#808080'
    };
    return colors[type] || '#84cc16';
  };

  const drawSpacetime = (ctx: CanvasRenderingContext2D) => {
    spacetime.forEach(point => {
      const curvatureIntensity = Math.abs(point.curvature) * 100;
      if (curvatureIntensity > 1) {
        ctx.fillStyle = `rgba(100, 50, 200, ${Math.min(curvatureIntensity / 100, 0.5)})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, curvatureIntensity * 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw grid distortion
        ctx.strokeStyle = `rgba(100, 50, 200, ${Math.min(curvatureIntensity / 200, 0.3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const distortion = point.curvature * 10;
        ctx.ellipse(point.x, point.y, 20 + distortion, 20 - distortion, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  const drawQuantumFoam = (ctx: CanvasRenderingContext2D) => {
    const foamDensity = quantumFluctuations * 1000;
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < foamDensity; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const size = Math.random() * 2;
      const flicker = Math.sin(time * 10 + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
  };

  const drawFields = (ctx: CanvasRenderingContext2D) => {
    fields.forEach(field => {
      const length = field.strength * 20;
      const endX = field.x + Math.cos(field.direction) * length;
      const endY = field.y + Math.sin(field.direction) * length;
      
      // Color based on field type
      let color = '#84cc16';
      switch (field.type) {
        case 'electromagnetic':
          color = '#ffff00';
          break;
        case 'weak':
          color = '#8000ff';
          break;
        case 'strong':
          color = '#ff4040';
          break;
        case 'gravitational':
          color = '#4080ff';
          break;
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, field.strength * 2);
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      ctx.moveTo(field.x, field.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Arrow head
      const arrowLength = 5;
      const arrowAngle = 0.3;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(field.direction - arrowAngle),
        endY - arrowLength * Math.sin(field.direction - arrowAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(field.direction + arrowAngle),
        endY - arrowLength * Math.sin(field.direction + arrowAngle)
      );
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1.0;
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      // Color based on color scheme
      let color = particle.color;
      switch (colorScheme) {
        case 'energy':
          const energyHue = Math.min(360, (particle.energy / energyScale) * 120);
          color = `hsl(${energyHue}, 80%, 60%)`;
          break;
        case 'field-strength':
          const nearbyField = fields.find(f => 
            Math.sqrt((f.x - particle.x)**2 + (f.y - particle.y)**2) < 50
          );
          const fieldStrength = nearbyField ? nearbyField.strength : 0;
          color = `rgba(255, ${255 - fieldStrength * 255}, 0, 1)`;
          break;
        case 'curvature':
          const nearbySpacetime = spacetime.find(st => 
            Math.sqrt((st.x - particle.x)**2 + (st.y - particle.y)**2) < 50
          );
          const curvature = nearbySpacetime ? Math.abs(nearbySpacetime.curvature) : 0;
          color = `rgba(${curvature * 255}, 0, ${255 - curvature * 255}, 1)`;
          break;
      }
      
      ctx.fillStyle = color;
      
      // Size based on mass/energy
      const size = Math.max(2, Math.min(8, particle.mass * 2 + 2));
      
      // Draw particle
      if (particle.type === 'boson') {
        // Draw as star for bosons
        drawStar(ctx, particle.x, particle.y, size, 6);
      } else {
        // Draw as circle for fermions
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw charge indicator
      if (particle.charge !== 0) {
        ctx.fillStyle = particle.charge > 0 ? '#ffffff' : '#000000';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(particle.charge > 0 ? '+' : '-', particle.x, particle.y + 2);
      }
      
      // Draw velocity vector
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x + particle.vx * 10, particle.y + particle.vy * 10);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, points: number) => {
    const step = Math.PI / points;
    const innerRadius = size * 0.5;
    const outerRadius = size;
    
    ctx.beginPath();
    for (let i = 0; i <= 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawUnifiedEquation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    
    // Simplified unified field equation representation
    const equation = 'Ψ = ∑ᵢ φᵢ(x,t) e^(iSᵢ/ℏ) | Rμν - ½gμνR + Λgμν = 8πGTμν';
    ctx.fillText(equation, width / 2, 30);
    
    // Parameter values
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(132, 204, 22, 0.8)';
    
    const params = [
      `g = ${couplingConstant.toFixed(3)}`,
      `φ = ${fieldAmplitude.toFixed(2)}`,
      `R = ${spacetimeCurvature.toFixed(3)}`,
      `ℏ = ${quantumFluctuations.toFixed(3)}`,
    ];
    
    params.forEach((param, i) => {
      ctx.fillText(param, 10, 50 + i * 12);
    });
  };

  const drawConservedQuantities = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!timeTranslation && !spaceTranslation && !rotation && !gauge) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    
    const quantities = [];
    if (timeTranslation) quantities.push(`E: ${conservedQuantities.energy.toFixed(1)} GeV`);
    if (spaceTranslation) quantities.push(`p: (${conservedQuantities.momentum.x.toFixed(1)}, ${conservedQuantities.momentum.y.toFixed(1)}, ${conservedQuantities.momentum.z.toFixed(1)})`);
    if (rotation) quantities.push(`L: ${conservedQuantities.angularMomentum.toFixed(1)}`);
    if (gauge) quantities.push(`Q: ${conservedQuantities.charge.toFixed(0)}`);
    
    quantities.forEach((text, i) => {
      ctx.fillText(text, 10, height - 60 + i * 12);
    });
  };

  const drawInfoOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    
    const info = [
      `Time: ${time.toFixed(2)}s`,
      `Particles: ${particles.length}`,
      `Dimensions: ${dimensionality}D`,
      `Energy Scale: ${energyScale.toFixed(1)} GeV`,
      `Temperature: ${temperature.toExponential(1)} K`,
    ];
    
    info.forEach((text, i) => {
      ctx.fillText(text, width - 10, 20 + i * 12);
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
      {showEquation && (
        <div className="absolute top-4 left-4 text-xs text-lime-400 font-mono">
          <div>Unified Field Theory Simulation</div>
          <div>Everything emerges from fundamental equation</div>
        </div>
      )}
    </div>
  );
});

Viewer.displayName = 'EverythingRelevantViewer';

export default Viewer;