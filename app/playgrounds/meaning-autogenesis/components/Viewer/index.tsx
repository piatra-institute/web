'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
    Molecule, Autogen, Template, Effect,
    createMolecule, createAutogen, createTemplate, createEffect,
    distanceBetween, moveMolecule, checkReaction, formAutogen,
    updateAutogenFormation, disruptAutogen, checkTemplateReaction
} from '../../logic';

interface ViewerProps {
    currentLevel: number;
    simulationRunning: boolean;
    simulationPaused: boolean;
    refreshKey: number;
    onCanDisruptChange?: (canDisrupt: boolean) => void;
    simulationParams?: {
        substrateCount: number;
        catalystCount: number;
        fragilityThreshold: number;
        simulationSpeed: number;
    };
}

const Viewer = forwardRef<{ disruptCapsid: () => void; exportCanvas: () => void; stepSimulation: () => void; exportData: () => void }, ViewerProps>(({
    currentLevel,
    simulationRunning,
    simulationPaused,
    refreshKey,
    onCanDisruptChange,
    simulationParams = { substrateCount: 80, catalystCount: 10, fragilityThreshold: 20, simulationSpeed: 1 }
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const moleculesRef = useRef<Molecule[]>([]);
    const autogensRef = useRef<Autogen[]>([]);
    const effectsRef = useRef<Effect[]>([]);
    const templateRef = useRef<Template | null>(null);
    const stepOnceRef = useRef<boolean>(false);
    const dataLogRef = useRef<Array<{
        time: number;
        substrates: number;
        catalysts: number;
        capsidParts: number;
        autogens: number;
    }>>([]);
    const startTimeRef = useRef<number>(0);
    const [molecules, setMolecules] = useState<Molecule[]>([]);
    const [autogens, setAutogens] = useState<Autogen[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);
    const [template, setTemplate] = useState<Template | null>(null);
    const [statusText, setStatusText] = useState('Select a level in the Settings panel and press "Start Simulation".');
    const [fragility, setFragility] = useState(0);
    const [autogenCount, setAutogenCount] = useState(0);
    const [hoveredMolecule, setHoveredMolecule] = useState<{ x: number; y: number; type: string } | null>(null);
    const [eventAnnotation, setEventAnnotation] = useState<{ text: string; x: number; y: number; life: number } | null>(null);

    // Helper function to show event annotations
    const showEventAnnotation = (text: string, x: number, y: number) => {
        setEventAnnotation({ text, x, y, life: 180 }); // Show for ~3 seconds at 60fps
    };

    useImperativeHandle(ref, () => ({
        disruptCapsid: () => {
            if (autogens[0] && autogens[0].isFormed) {
                const ag = autogens[0];
                
                // Release the enclosed molecules and give them velocity
                ag.enclosedMolecules.forEach(m => {
                    m.boundTo = null;
                    // Scatter the molecules outward
                    const angle = Math.random() * Math.PI * 2;
                    m.vx = Math.cos(angle) * 3;
                    m.vy = Math.sin(angle) * 3;
                });
                
                disruptAutogen(ag);
                setEffects(prev => [...prev, createEffect(ag.x, ag.y, 'shatter')]);
                setAutogens(prev => prev.filter((_, i) => i !== 0));
                setStatusText('Capsid disrupted! Catalysts released.');
                onCanDisruptChange?.(false);
                showEventAnnotation('Capsid broken! The autogen responds by rebuilding.', ag.x, ag.y);
            }
        },
        exportCanvas: () => {
            if (!canvasRef.current) return;
            const link = document.createElement('a');
            link.download = 'biosemiotics-playground.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
        },
        stepSimulation: () => {
            stepOnceRef.current = true;
        },
        exportData: () => {
            if (dataLogRef.current.length === 0) {
                alert('No data to export. Run the simulation first.');
                return;
            }
            
            // Create CSV content
            const headers = ['Time (s)', 'Substrates (A+D)', 'Catalysts (C+F)', 'Capsid Parts (G)', 'Autogens'];
            const rows = dataLogRef.current.map(entry => [
                entry.time.toFixed(2),
                entry.substrates,
                entry.catalysts,
                entry.capsidParts,
                entry.autogens
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `autogenesis-data-level${currentLevel}-${new Date().toISOString().slice(0,19)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }));

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const container = canvas.parentElement;
        if (!container) return;
        
        const updateCanvasSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    // Reset simulation on level change or refresh
    useEffect(() => {
        setMolecules([]);
        setAutogens([]);
        setEffects([]);
        setTemplate(null);
        moleculesRef.current = [];
        autogensRef.current = [];
        effectsRef.current = [];
        templateRef.current = null;
        setStatusText('Select a level in the Settings panel and press "Start Simulation".');
        setFragility(0);
        setAutogenCount(0);
        onCanDisruptChange?.(false);
        dataLogRef.current = [];
        startTimeRef.current = 0;
        
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }, [currentLevel, refreshKey, onCanDisruptChange]);

    // Initialize simulation
    useEffect(() => {
        if (!simulationRunning || currentLevel === 0 || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        
        // Ensure canvas is properly sized
        const container = canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        
        const newMolecules: Molecule[] = [];
        const newAutogens: Autogen[] = [];
        
        // Spawn molecules using parameters
        const numSubstrates = simulationParams.substrateCount;
        const numCatalysts = simulationParams.catalystCount;
        
        for (let i = 0; i < numSubstrates / 2; i++) {
            newMolecules.push(createMolecule(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                'A'
            ));
            newMolecules.push(createMolecule(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                'D'
            ));
        }
        
        for (let i = 0; i < numCatalysts; i++) {
            newMolecules.push(createMolecule(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                'C'
            ));
            newMolecules.push(createMolecule(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                'F'
            ));
        }
        
        // Add initial G molecules near the center to help start capsid formation
        if (currentLevel < 3) {
            for (let i = 0; i < 8; i++) {
                newMolecules.push(createMolecule(
                    canvas.width / 2 + (Math.random() - 0.5) * 80,
                    canvas.height / 2 + (Math.random() - 0.5) * 80,
                    'G'
                ));
            }
        }
        
        setMolecules(newMolecules);
        moleculesRef.current = newMolecules;
        
        if (currentLevel === 3) {
            const newTemplate = createTemplate(canvas.width, canvas.height);
            setTemplate(newTemplate);
            templateRef.current = newTemplate;
        } else {
            const newAutogen = createAutogen(canvas.width / 2, canvas.height / 2);
            // Set fragility threshold from parameters for Level 2
            if (currentLevel === 2) {
                newAutogen.fragilityThreshold = simulationParams.fragilityThreshold;
            }
            newAutogens.push(newAutogen);
            setAutogens(newAutogens);
            autogensRef.current = newAutogens;
        }
        
        setStatusText(`Simulation running... Spawned ${newMolecules.length} molecules`);
        setAutogenCount(0);
        startTimeRef.current = Date.now();
        dataLogRef.current = [];
    }, [simulationRunning, currentLevel, simulationParams.substrateCount, simulationParams.catalystCount, simulationParams.fragilityThreshold]);

    // Animation loop
    useEffect(() => {
        if (!simulationRunning || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const animate = () => {
            // Check if paused and not stepping
            if (simulationPaused && !stepOnceRef.current) {
                animationFrameId.current = requestAnimationFrame(animate);
                return;
            }
            
            // Reset step flag if we're stepping
            if (stepOnceRef.current) {
                stepOnceRef.current = false;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update molecules
            const updatedMolecules = [...moleculesRef.current];
            const updatedAutogens = [...autogensRef.current];
            const updatedEffects = effectsRef.current.filter(e => e.life > 0);
            
            // Move molecules with speed adjustment
            const speed = simulationParams.simulationSpeed;
            updatedMolecules.forEach(m => {
                if (!m.boundTo) {
                    const isContained = updatedAutogens.some(ag => ag.isFormed && ag.enclosedMolecules.includes(m));
                    if (!isContained) {
                        m.x += m.vx * speed;
                        m.y += m.vy * speed;
                        
                        if (m.x - m.radius < 0 || m.x + m.radius > canvas.width) {
                            m.vx *= -1;
                        }
                        if (m.y - m.radius < 0 || m.y + m.radius > canvas.height) {
                            m.vy *= -1;
                        }
                    }
                }
            });
            
            // Check collisions and reactions
            if (currentLevel < 3) {
                for (let i = 0; i < updatedMolecules.length; i++) {
                    for (let j = i + 1; j < updatedMolecules.length; j++) {
                        const m1 = updatedMolecules[i];
                        const m2 = updatedMolecules[j];
                        
                        const isContained = updatedAutogens.some(ag => 
                            ag.isFormed && (ag.enclosedMolecules.includes(m1) || ag.enclosedMolecules.includes(m2))
                        );
                        if (isContained) continue;
                        
                        if (distanceBetween(m1, m2) < m1.radius + m2.radius) {
                            const reaction = checkReaction(m1, m2, currentLevel);
                            if (reaction) {
                                // Add visual effect for reaction
                                updatedEffects.push(createEffect(
                                    (m1.x + m2.x) / 2,
                                    (m1.y + m2.y) / 2,
                                    'flash'
                                ));
                                
                                reaction.products.forEach(p => updatedMolecules.push(p));
                                reaction.consumed.forEach(c => {
                                    const index = updatedMolecules.indexOf(c);
                                    if (index > -1) updatedMolecules.splice(index, 1);
                                });
                                
                                // Update status to show reactions are happening
                                const gCount = updatedMolecules.filter(m => m.type === 'G').length;
                                setStatusText(`Reaction! G molecules: ${gCount}`);
                            }
                        }
                    }
                }
            }
            
            // Update autogens
            updatedAutogens.forEach(ag => {
                if (!ag.isFormed && !ag.isForming) {
                    const nearbyCapsidParts = updatedMolecules.filter(m => 
                        m.type === 'G' && distanceBetween(ag, m) < 80
                    );
                    
                    // Always show G count for debugging
                    if (nearbyCapsidParts.length > 0) {
                        setStatusText(`Waiting for capsid formation... G molecules nearby: ${nearbyCapsidParts.length}/8`);
                    }
                    
                    if (nearbyCapsidParts.length >= 8) {
                        formAutogen(ag, updatedMolecules);
                        nearbyCapsidParts.forEach(p => {
                            const index = updatedMolecules.indexOf(p);
                            if (index > -1) updatedMolecules.splice(index, 1);
                        });
                        setStatusText('Sufficient capsid molecules detected. Forming autogen...');
                    }
                }
                
                // Update autogen formation with speed adjustment
                if (ag.isForming && !ag.isFormed) {
                    // Continuously capture catalysts during formation
                    updatedMolecules.forEach(m => {
                        if (['C', 'F'].includes(m.type) && distanceBetween(ag, m) < ag.radius && !ag.enclosedMolecules.includes(m)) {
                            ag.enclosedMolecules.push(m);
                            m.boundTo = ag;
                        }
                    });
                    
                    ag.radius += 2 * speed;
                    if (ag.radius >= ag.maxRadius) {
                        ag.radius = ag.maxRadius;
                        ag.isFormed = true;
                        ag.isForming = false;
                        setStatusText('Autogen formed! It is now inert.');
                        if (currentLevel === 1) {
                            onCanDisruptChange?.(true);
                            showEventAnnotation('Capsid formed! The autogen is now protected.', ag.x, ag.y - 60);
                        }
                    }
                }
                
                // Level 2: substrate binding
                if (currentLevel === 2 && ag.isFormed) {
                    // Speed affects how quickly substrates bind
                    const bindingChance = Math.min(0.5 * speed, 1);
                    updatedMolecules.filter(m => m.type === 'D' && !m.boundTo).forEach(m => {
                        if (distanceBetween(ag, m) < ag.radius + 20 && Math.random() < bindingChance) {
                            m.boundTo = ag;
                            ag.fragility += 1;
                        }
                    });
                    
                    setFragility((ag.fragility / ag.fragilityThreshold) * 100);
                    
                    if (ag.fragility >= ag.fragilityThreshold) {
                        disruptAutogen(ag);
                        updatedEffects.push(createEffect(ag.x, ag.y, 'shatter'));
                        const index = updatedAutogens.indexOf(ag);
                        if (index > -1) updatedAutogens.splice(index, 1);
                        setStatusText('Capsid fragility threshold reached! Autogen disrupted.');
                        setFragility(0);
                        showEventAnnotation('High substrate concentration detected! Time to reproduce.', ag.x, ag.y);
                    }
                }
            });
            
            // Level 3: template reactions
            if (currentLevel === 3 && templateRef.current) {
                const template = templateRef.current;
                // Bind molecules to template
                updatedMolecules.filter(m => ['C', 'F'].includes(m.type) && !m.boundTo).forEach(m => {
                    template.bindingSites.forEach(site => {
                        if (m.type === site.type && !site.boundMolecule) {
                            const siteX = template.x1 + template.length * site.position;
                            const siteY = template.y1;
                            if (distanceBetween({ x: siteX, y: siteY }, m) < 15) {
                                site.boundMolecule = m;
                                m.boundTo = site;
                            }
                        }
                    });
                });
                
                // Update bound molecule positions
                template.bindingSites.forEach(site => {
                    if (site.boundMolecule) {
                        site.boundMolecule.x = template.x1 + template.length * site.position;
                        site.boundMolecule.y = template.y1;
                    }
                });
                
                // Check for template reactions
                const reaction = checkTemplateReaction(template, updatedMolecules);
                if (reaction) {
                    reaction.products.forEach(p => updatedMolecules.push(p));
                    reaction.consumed.forEach(c => {
                        const index = updatedMolecules.indexOf(c);
                        if (index > -1) updatedMolecules.splice(index, 1);
                    });
                    reaction.effects.forEach(e => updatedEffects.push(e));
                    reaction.unboundSites.forEach(i => {
                        const boundMolecule = template.bindingSites[i].boundMolecule;
                        if (boundMolecule) {
                            boundMolecule.boundTo = null;
                        }
                        template.bindingSites[i].boundMolecule = null;
                    });
                }
                
                // Check for new autogen formation
                const freeCapsidParts = updatedMolecules.filter(m => m.type === 'G');
                if (freeCapsidParts.length > 15) {
                    const avgX = freeCapsidParts.reduce((sum, m) => sum + m.x, 0) / freeCapsidParts.length;
                    const avgY = freeCapsidParts.reduce((sum, m) => sum + m.y, 0) / freeCapsidParts.length;
                    
                    const newAutogen = createAutogen(avgX, avgY);
                    formAutogen(newAutogen, updatedMolecules);
                    updatedAutogens.push(newAutogen);
                    
                    freeCapsidParts.forEach(p => {
                        const index = updatedMolecules.indexOf(p);
                        if (index > -1) updatedMolecules.splice(index, 1);
                    });
                    
                    setAutogenCount(prev => prev + 1);
                    setStatusText('New autogen created via template-guided synthesis!');
                }
            }
            
            // Draw everything
            // Draw template
            if (templateRef.current) {
                const template = templateRef.current;
                ctx.beginPath();
                ctx.moveTo(template.x1, template.y1);
                ctx.lineTo(template.x2, template.y2);
                ctx.strokeStyle = '#84cc16'; // lime-400
                ctx.lineWidth = 4;
                ctx.stroke();
                
                template.bindingSites.forEach(site => {
                    const siteX = template.x1 + template.length * site.position;
                    const siteY = template.y1;
                    ctx.beginPath();
                    ctx.arc(siteX, siteY, 8, 0, Math.PI * 2);
                    ctx.strokeStyle = site.type === 'C' ? '#84cc16' : '#bef264';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            }
            
            // Draw molecules
            updatedMolecules.forEach(m => {
                ctx.beginPath();
                if (m.type === 'G') {
                    ctx.moveTo(m.x, m.y - m.radius);
                    ctx.lineTo(m.x - m.radius, m.y + m.radius);
                    ctx.lineTo(m.x + m.radius, m.y + m.radius);
                    ctx.closePath();
                } else if (['A', 'D'].includes(m.type)) {
                    ctx.rect(m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
                } else {
                    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                }
                ctx.fillStyle = m.color;
                ctx.fill();
            });
            
            
            // Draw autogens
            updatedAutogens.forEach(ag => {
                ctx.beginPath();
                ctx.arc(ag.x, ag.y, ag.radius, 0, Math.PI * 2);
                ctx.strokeStyle = ag.isFormed ? '#84cc16' : '#84cc1680'; // Solid when formed, translucent when forming
                ctx.lineWidth = ag.isFormed ? 5 : 3;
                ctx.stroke();
                
                // Draw enclosed molecules count for debugging
                if (ag.enclosedMolecules.length > 0) {
                    ctx.fillStyle = '#84cc16';
                    ctx.font = '12px monospace';
                    ctx.fillText(`C/F: ${ag.enclosedMolecules.length}`, ag.x - 20, ag.y - ag.radius - 10);
                }
                
                // Draw bound substrates for level 2
                if (currentLevel === 2 && ag.isFormed) {
                    updatedMolecules.filter(m => m.type === 'D' && m.boundTo === ag).forEach((m, i) => {
                        const angle = (i / ag.fragility) * 2 * Math.PI;
                        m.x = ag.x + ag.radius * Math.cos(angle);
                        m.y = ag.y + ag.radius * Math.sin(angle);
                    });
                }
            });
            
            // Draw effects with speed adjustment
            updatedEffects.forEach(e => {
                e.life -= speed;
                if (e.type === 'flash') {
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(190, 242, 100, ${e.life / 10})`; // lime-300 with opacity
                    ctx.fill();
                    e.radius += 2 * speed;
                } else if (e.type === 'shatter') {
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(132, 204, 22, ${e.life / 10})`; // lime-400 with opacity
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    e.radius += 4 * speed;
                }
            });
            
            // Update refs and state
            moleculesRef.current = updatedMolecules;
            autogensRef.current = updatedAutogens;
            effectsRef.current = updatedEffects;
            
            setMolecules(updatedMolecules);
            setAutogens(updatedAutogens);
            setEffects(updatedEffects);
            
            // Update event annotation with speed adjustment
            if (eventAnnotation && eventAnnotation.life > 0) {
                setEventAnnotation(prev => prev ? { ...prev, life: prev.life - speed } : null);
            } else if (eventAnnotation && eventAnnotation.life <= 0) {
                setEventAnnotation(null);
            }
            
            // Log data every 10 frames (about 6 times per second at 60fps)
            if (moleculesRef.current.length > 0 && Date.now() - startTimeRef.current > 0) {
                const frameCount = dataLogRef.current.length;
                if (frameCount === 0 || frameCount % 10 === 0) {
                    const substrates = updatedMolecules.filter(m => ['A', 'D'].includes(m.type)).length;
                    const catalysts = updatedMolecules.filter(m => ['C', 'F'].includes(m.type)).length;
                    const capsidParts = updatedMolecules.filter(m => m.type === 'G').length;
                    
                    dataLogRef.current.push({
                        time: (Date.now() - startTimeRef.current) / 1000,
                        substrates,
                        catalysts,
                        capsidParts,
                        autogens: updatedAutogens.filter(ag => ag.isFormed).length
                    });
                }
            }
            
            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        animationFrameId.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [simulationRunning, currentLevel, simulationPaused, onCanDisruptChange]);

    // Handle mouse movement for hover effects
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !simulationRunning) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if hovering over any molecule
        const hovered = molecules.find(m => {
            const dist = Math.sqrt((m.x - x) ** 2 + (m.y - y) ** 2);
            return dist < m.radius + 5;
        });
        
        if (hovered) {
            const labels: { [key: string]: string } = {
                'A': 'Substrate A',
                'D': 'Substrate D',
                'C': 'Catalyst C',
                'F': 'Catalyst F',
                'G': 'Capsid Part'
            };
            setHoveredMolecule({
                x: hovered.x,
                y: hovered.y,
                type: labels[hovered.type] || hovered.type
            });
        } else {
            setHoveredMolecule(null);
        }
    };

    return (
        <div className="w-full h-screen relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full bg-black"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredMolecule(null)}
            />
            {hoveredMolecule && (
                <div 
                    className="absolute bg-black/90 border border-lime-400 px-2 py-1 text-xs text-lime-400 pointer-events-none"
                    style={{
                        left: hoveredMolecule.x + 10,
                        top: hoveredMolecule.y - 25
                    }}
                >
                    {hoveredMolecule.type}
                </div>
            )}
            {eventAnnotation && eventAnnotation.life > 0 && (
                <div 
                    className="absolute bg-black border-2 border-lime-400 px-3 py-2 text-sm text-white pointer-events-none animate-pulse"
                    style={{
                        left: eventAnnotation.x - 100,
                        top: eventAnnotation.y - 40,
                        opacity: Math.min(1, eventAnnotation.life / 60)
                    }}
                >
                    {eventAnnotation.text}
                </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-400 bg-black/75 py-2 px-4">
                {statusText}
            </div>
            {currentLevel === 2 && simulationRunning && (
                <div className="absolute top-4 left-4 bg-black border border-lime-400 p-3">
                    <div className="text-sm font-semibold text-white mb-1">Capsid Fragility</div>
                    <div className="w-48 h-4 bg-black border border-lime-400 overflow-hidden">
                        <div
                            className="h-full bg-lime-400 transition-all duration-300"
                            style={{ width: `${fragility}%` }}
                        />
                    </div>
                </div>
            )}
            {currentLevel === 3 && simulationRunning && (
                <div className="absolute top-4 left-4 bg-black border border-lime-400 p-3">
                    <div className="text-sm font-semibold text-white">
                        Autogens Created: <span className="text-lime-400">{autogenCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;