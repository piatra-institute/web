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
    refreshKey: number;
    onCanDisruptChange?: (canDisrupt: boolean) => void;
}

const Viewer = forwardRef<{ disruptCapsid: () => void; exportCanvas: () => void }, ViewerProps>(({
    currentLevel,
    simulationRunning,
    refreshKey,
    onCanDisruptChange
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const moleculesRef = useRef<Molecule[]>([]);
    const autogensRef = useRef<Autogen[]>([]);
    const effectsRef = useRef<Effect[]>([]);
    const templateRef = useRef<Template | null>(null);
    const [molecules, setMolecules] = useState<Molecule[]>([]);
    const [autogens, setAutogens] = useState<Autogen[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);
    const [template, setTemplate] = useState<Template | null>(null);
    const [statusText, setStatusText] = useState('Select a level and press "Start Simulation".');
    const [fragility, setFragility] = useState(0);
    const [autogenCount, setAutogenCount] = useState(0);

    useImperativeHandle(ref, () => ({
        disruptCapsid: () => {
            if (autogens[0] && autogens[0].isFormed) {
                disruptAutogen(autogens[0]);
                setEffects(prev => [...prev, createEffect(autogens[0].x, autogens[0].y, 'shatter')]);
                setAutogens(prev => prev.filter((_, i) => i !== 0));
                setStatusText('Capsid disrupted! Catalysts released.');
                onCanDisruptChange?.(false);
            }
        },
        exportCanvas: () => {
            if (!canvasRef.current) return;
            const link = document.createElement('a');
            link.download = 'biosemiotics-playground.png';
            link.href = canvasRef.current.toDataURL();
            link.click();
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
        setStatusText('Select a level and press "Start Simulation".');
        setFragility(0);
        setAutogenCount(0);
        onCanDisruptChange?.(false);
        
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
        
        // Spawn molecules
        const numSubstrates = 80;
        const numCatalysts = 10;
        
        for (let i = 0; i < numSubstrates; i++) {
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
        
        setMolecules(newMolecules);
        moleculesRef.current = newMolecules;
        
        if (currentLevel === 3) {
            const newTemplate = createTemplate(canvas.width, canvas.height);
            setTemplate(newTemplate);
            templateRef.current = newTemplate;
        } else {
            newAutogens.push(createAutogen(canvas.width / 2, canvas.height / 2));
            setAutogens(newAutogens);
            autogensRef.current = newAutogens;
        }
        
        setStatusText('Simulation running...');
        setAutogenCount(0);
    }, [simulationRunning, currentLevel]);

    // Animation loop
    useEffect(() => {
        if (!simulationRunning || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update molecules
            const updatedMolecules = [...moleculesRef.current];
            const updatedAutogens = [...autogensRef.current];
            const updatedEffects = effectsRef.current.filter(e => e.life > 0);
            
            // Move molecules
            updatedMolecules.forEach(m => moveMolecule(m, updatedAutogens, canvas.width, canvas.height));
            
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
                                reaction.products.forEach(p => updatedMolecules.push(p));
                                reaction.consumed.forEach(c => {
                                    const index = updatedMolecules.indexOf(c);
                                    if (index > -1) updatedMolecules.splice(index, 1);
                                });
                            }
                        }
                    }
                }
            }
            
            // Update autogens
            updatedAutogens.forEach(ag => {
                if (!ag.isFormed && !ag.isForming) {
                    const nearbyCapsidParts = updatedMolecules.filter(m => 
                        m.type === 'G' && distanceBetween(ag, m) < 100
                    );
                    if (nearbyCapsidParts.length > 20) {
                        formAutogen(ag, updatedMolecules);
                        nearbyCapsidParts.forEach(p => {
                            const index = updatedMolecules.indexOf(p);
                            if (index > -1) updatedMolecules.splice(index, 1);
                        });
                        setStatusText('Sufficient capsid molecules detected. Forming autogen...');
                    }
                }
                
                const status = updateAutogenFormation(ag);
                if (status) {
                    setStatusText(status);
                    if (currentLevel === 1 && ag.isFormed) {
                        onCanDisruptChange?.(true);
                    }
                }
                
                // Level 2: substrate binding
                if (currentLevel === 2 && ag.isFormed) {
                    updatedMolecules.filter(m => m.type === 'D' && !m.boundTo).forEach(m => {
                        if (distanceBetween(ag, m) < ag.radius + 20) {
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
                if (freeCapsidParts.length > 25) {
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
                ctx.strokeStyle = '#84cc16';
                ctx.lineWidth = 5;
                ctx.stroke();
                
                // Draw bound substrates for level 2
                if (currentLevel === 2 && ag.isFormed) {
                    updatedMolecules.filter(m => m.type === 'D' && m.boundTo === ag).forEach((m, i) => {
                        const angle = (i / ag.fragility) * 2 * Math.PI;
                        m.x = ag.x + ag.radius * Math.cos(angle);
                        m.y = ag.y + ag.radius * Math.sin(angle);
                    });
                }
            });
            
            // Draw effects
            updatedEffects.forEach(e => {
                e.life--;
                if (e.type === 'flash') {
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(190, 242, 100, ${e.life / 10})`; // lime-300 with opacity
                    ctx.fill();
                    e.radius += 2;
                } else if (e.type === 'shatter') {
                    ctx.beginPath();
                    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(132, 204, 22, ${e.life / 10})`; // lime-400 with opacity
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    e.radius += 4;
                }
            });
            
            // Update refs and state
            moleculesRef.current = updatedMolecules;
            autogensRef.current = updatedAutogens;
            effectsRef.current = updatedEffects;
            
            setMolecules(updatedMolecules);
            setAutogens(updatedAutogens);
            setEffects(updatedEffects);
            
            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        animationFrameId.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [simulationRunning, currentLevel, onCanDisruptChange]);

    return (
        <div className="w-full h-screen relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full bg-black"
            />
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