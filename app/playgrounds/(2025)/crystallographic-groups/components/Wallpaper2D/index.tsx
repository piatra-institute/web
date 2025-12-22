'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { wallpaperGroups } from './wallpaperGroups';

interface Wallpaper2DProps {
    currentGroup: string;
    onGroupChange: (group: string) => void;
}

export default function Wallpaper2D({ currentGroup, onGroupChange }: Wallpaper2DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const currentIndexRef = useRef(0);

    const groups = wallpaperGroups;

    const drawMotif = useCallback((
        ctx: CanvasRenderingContext2D, 
        x: number, 
        y: number, 
        angle: number, 
        reflect: boolean
    ) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        if (reflect) ctx.scale(-1, 1);
        
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#84cc16'; // lime-500
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('R', 0, 0);
        
        ctx.restore();
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const group = currentGroup;
        const a = 80, b = 80;
        const nx = Math.ceil(canvas.width / a) + 2;
        const ny = Math.ceil(canvas.height / b) + 2;

        for (let i = -nx; i <= nx; i++) {
            for (let j = -ny; j <= ny; j++) {
                let x = i * a;
                let y = j * b;
                const motifs = [{x: 0, y: 0, angle: 0, reflect: false}];
                
                switch (group) {
                    case 'p1': break;
                    case 'p2': 
                        motifs.push({x: 0, y: 0, angle: 180, reflect: false}); 
                        break;
                    case 'pm': 
                        motifs.push({x: 0, y: 0, angle: 0, reflect: true}); 
                        break;
                    case 'pg': 
                        motifs.push({x: a/2, y: 0, angle: 0, reflect: true}); 
                        break;
                    case 'cm':
                        motifs.push({x: 0, y: 0, angle: 0, reflect: true});
                        if ((i + j) % 2 !== 0) continue;
                        break;
                    case 'pmm':
                        motifs.push(
                            {x: 0, y: 0, angle: 180, reflect: false}, 
                            {x: 0, y: 0, angle: 0, reflect: true}, 
                            {x: 0, y: 0, angle: 180, reflect: true}
                        );
                        break;
                    case 'pmg':
                        motifs.push(
                            {x: 0, y: b/2, angle: 180, reflect: false}, 
                            {x: 0, y: 0, angle: 0, reflect: true}, 
                            {x: 0, y: b/2, angle: 180, reflect: true}
                        );
                        break;
                    case 'pgg':
                        motifs.push(
                            {x: a/2, y: b/2, angle: 180, reflect: false}, 
                            {x: a/2, y: 0, angle: 0, reflect: true}, 
                            {x: 0, y: b/2, angle: 180, reflect: true}
                        );
                        break;
                    case 'cmm':
                        motifs.push(
                            {x: 0, y: 0, angle: 180, reflect: false}, 
                            {x: 0, y: 0, angle: 0, reflect: true}, 
                            {x: 0, y: 0, angle: 180, reflect: true}
                        );
                        if ((i + j) % 2 !== 0) continue;
                        break;
                    case 'p4':
                        for (let k = 1; k < 4; k++) {
                            motifs.push({x: 0, y: 0, angle: k * 90, reflect: false});
                        }
                        break;
                    case 'p4m':
                        for (let k = 0; k < 4; k++) {
                            motifs.push(
                                {x: 0, y: 0, angle: k * 90, reflect: false}, 
                                {x: 0, y: 0, angle: k * 90, reflect: true}
                            );
                        }
                        break;
                    case 'p4g':
                        for (let k = 0; k < 4; k++) {
                            motifs.push({x: 0, y: 0, angle: k * 90, reflect: false});
                        }
                        for (let k = 0; k < 4; k++) {
                            motifs.push({x: a/2, y: b/2, angle: k * 90, reflect: true});
                        }
                        break;
                    case 'p3':
                        x = i * a + j * a * 0.5;
                        y = j * b * Math.sqrt(3) / 2;
                        motifs.push(
                            {x: 0, y: 0, angle: 120, reflect: false}, 
                            {x: 0, y: 0, angle: 240, reflect: false}
                        );
                        break;
                    case 'p3m1':
                        x = i * a + j * a * 0.5;
                        y = j * b * Math.sqrt(3) / 2;
                        for (let k = 0; k < 3; k++) {
                            motifs.push(
                                {x: 0, y: 0, angle: k * 120, reflect: false}, 
                                {x: 0, y: 0, angle: k * 120, reflect: true}
                            );
                        }
                        break;
                    case 'p31m':
                        x = i * a + j * a * 0.5;
                        y = j * b * Math.sqrt(3) / 2;
                        for (let k = 0; k < 3; k++) {
                            motifs.push({x: 0, y: 0, angle: k * 120, reflect: false});
                        }
                        const p = {x: a/2, y: b * Math.sqrt(3) / 6};
                        for (let k = 0; k < 3; k++) {
                            motifs.push({x: p.x, y: p.y, angle: k * 120, reflect: true});
                        }
                        break;
                    case 'p6':
                        x = i * a + j * a * 0.5;
                        y = j * b * Math.sqrt(3) / 2;
                        for (let k = 1; k < 6; k++) {
                            motifs.push({x: 0, y: 0, angle: k * 60, reflect: false});
                        }
                        break;
                    case 'p6m':
                        x = i * a + j * a * 0.5;
                        y = j * b * Math.sqrt(3) / 2;
                        for (let k = 0; k < 6; k++) {
                            motifs.push(
                                {x: 0, y: 0, angle: k * 60, reflect: false}, 
                                {x: 0, y: 0, angle: k * 60, reflect: true}
                            );
                        }
                        break;
                }
                
                motifs.forEach(m => drawMotif(ctx, x + m.x, y + m.y, m.angle, m.reflect));
            }
        }
    }, [currentGroup, drawMotif]);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                draw();
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        const currentAnimationId = animationRef.current;
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentAnimationId) {
                cancelAnimationFrame(currentAnimationId);
            }
        };
    }, [draw]);

    useEffect(() => {
        draw();
    }, [currentGroup, draw]);

    const handlePrevious = () => {
        const currentIndex = groups.findIndex(g => g.id === currentGroup);
        const newIndex = (currentIndex - 1 + groups.length) % groups.length;
        onGroupChange(groups[newIndex].id);
    };

    const handleNext = () => {
        const currentIndex = groups.findIndex(g => g.id === currentGroup);
        const newIndex = (currentIndex + 1) % groups.length;
        onGroupChange(groups[newIndex].id);
    };

    const currentIndex = groups.findIndex(g => g.id === currentGroup);

    return (
        <div className="absolute inset-0 flex flex-col p-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-100">17 Wallpaper Groups</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handlePrevious}
                        className="p-2 bg-black border border-gray-800 hover:border-gray-600 transition-colors"
                        aria-label="Previous group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="text-center font-semibold text-lime-400 w-48">
                        Group {currentIndex + 1} / {groups.length}: {currentGroup}
                    </span>
                    <button
                        onClick={handleNext}
                        className="p-2 bg-black border border-gray-800 hover:border-gray-600 transition-colors"
                        aria-label="Next group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-black overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </div>
    );
}