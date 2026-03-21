'use client';

import React, { useState, useCallback } from 'react';

import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';
import { RESEARCH_STEPS, buildPrompt } from './prompts';


interface ResearchPromptButtonProps {
    context: PlaygroundSourceContext;
}

export default function ResearchPromptButton({ context }: ResearchPromptButtonProps) {
    const [expanded, setExpanded] = useState(false);
    const [focus, setFocus] = useState('');
    const [copiedStep, setCopiedStep] = useState<string | null>(null);

    const handleCopy = useCallback((stepId: string) => {
        const step = RESEARCH_STEPS.find(s => s.id === stepId);
        if (!step) return;

        const prompt = buildPrompt(step, context, focus);
        navigator.clipboard.writeText(prompt).then(() => {
            setCopiedStep(stepId);
            setTimeout(() => setCopiedStep(null), 2000);
        });
    }, [context, focus]);

    return (
        <div className="border border-lime-500/20">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-lime-500/5 transition-colors"
            >
                <div>
                    <div className="text-lime-400 font-semibold text-sm">Research with AI</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        copy structured prompts for deep research
                    </div>
                </div>
                <span className="text-lime-200/40 text-sm shrink-0 ml-4">{expanded ? '−' : '+'}</span>
            </button>

            {expanded && (
                <div className="border-t border-lime-500/10 p-4 space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Open a single conversation in ChatGPT Deep Research, Gemini Deep Research,
                        or any capable AI. Copy each prompt in order, paste it, and wait for the
                        response before moving to the next step. Each prompt includes the full
                        playground source code. The AI builds on its prior answers — step 6
                        synthesizes everything into a research companion document.
                    </p>

                    <div>
                        <label className="text-[10px] text-lime-200/50 font-mono uppercase tracking-wide block mb-1.5">
                            research focus (optional)
                        </label>
                        <textarea
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            placeholder="e.g. focus on the experimental evidence for long-range electrodynamic forces in cellular environments"
                            rows={2}
                            className="w-full bg-black border border-lime-500/20 text-lime-100 text-xs p-2 resize-none appearance-none outline-none focus:border-lime-500/50 transition-colors [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/30"
                            style={{ backgroundColor: '#000' }}
                        />
                    </div>

                    <div className="space-y-2">
                        {RESEARCH_STEPS.map((step, i) => (
                            <div
                                key={step.id}
                                className="border border-lime-500/10 bg-[#0a0a0a] flex items-center justify-between gap-3 p-3"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="text-lime-500/40 text-xs font-mono shrink-0 mt-0.5">
                                        {i + 1}.
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-xs text-lime-100">{step.label}</div>
                                        <div className="text-[10px] text-lime-200/40 mt-0.5">{step.description}</div>
                                        <div className="text-[10px] text-lime-200/25 mt-0.5 italic">{step.hint}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCopy(step.id)}
                                    className={`shrink-0 py-1 px-3 text-[10px] font-mono border transition-colors cursor-pointer ${
                                        copiedStep === step.id
                                            ? 'border-lime-500/40 text-lime-200/60 bg-lime-500/10'
                                            : 'border-lime-500/30 text-lime-400 hover:border-lime-500 hover:bg-lime-500/10'
                                    }`}
                                >
                                    {copiedStep === step.id ? 'copied' : 'copy'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-[10px] text-lime-200/30 font-mono">
                        each prompt is ~{Math.round((
                            context.logicSource.length +
                            context.assumptionsSource.length +
                            context.calibrationSource.length +
                            context.playgroundSource.length +
                            1500
                        ) / 1000)}k characters including source code
                    </div>
                </div>
            )}
        </div>
    );
}
