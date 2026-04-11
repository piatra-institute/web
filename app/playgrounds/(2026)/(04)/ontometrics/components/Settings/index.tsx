'use client';

import { useState } from 'react';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';

import {
    OntologyState, Category, Relation, Axiom, OntologyCase,
    PresetKey, PRESET_DESCRIPTIONS, AXIOM_TYPES, Metrics,
    uid,
} from '../../logic';


interface SettingsProps {
    state: OntologyState;
    onStateChange: (s: OntologyState) => void;
    metrics: Metrics;
    narrative: string;
    onLoadPreset: (key: PresetKey) => void;
}


export default function Settings({ state, onStateChange, metrics, narrative, onLoadPreset }: SettingsProps) {
    const [draftCatName, setDraftCatName] = useState('');
    const [draftCatDesc, setDraftCatDesc] = useState('');
    const [draftRelName, setDraftRelName] = useState('');
    const [draftAxType, setDraftAxType] = useState<string>('disjoint');
    const [draftAxLeft, setDraftAxLeft] = useState('');
    const [draftAxRight, setDraftAxRight] = useState('');
    const [draftCaseName, setDraftCaseName] = useState('');
    const [draftCaseNote, setDraftCaseNote] = useState('');

    const presetKeys: PresetKey[] = ['metaphysics', 'mind', 'rights', 'particles'];

    const addCategory = () => {
        if (!draftCatName.trim()) return;
        if (state.categories.some(c => c.name === draftCatName.trim())) return;
        onStateChange({
            ...state,
            categories: [...state.categories, { id: uid('c'), name: draftCatName.trim(), description: draftCatDesc.trim() }],
        });
        setDraftCatName('');
        setDraftCatDesc('');
    };

    const removeCategory = (id: string) => {
        const cat = state.categories.find(c => c.id === id);
        onStateChange({
            ...state,
            categories: state.categories.filter(c => c.id !== id),
            cases: state.cases.map(c => ({ ...c, categoryIds: c.categoryIds.filter(cid => cid !== id) })),
            axioms: cat ? state.axioms.filter(a => a.left !== cat.name && a.right !== cat.name) : state.axioms,
        });
    };

    const addRelation = () => {
        if (!draftRelName.trim()) return;
        onStateChange({
            ...state,
            relations: [...state.relations, { id: uid('r'), name: draftRelName.trim(), description: '' }],
        });
        setDraftRelName('');
    };

    const removeRelation = (id: string) => {
        onStateChange({ ...state, relations: state.relations.filter(r => r.id !== id) });
    };

    const addAxiom = () => {
        if (!draftAxLeft || !draftAxRight) return;
        onStateChange({
            ...state,
            axioms: [...state.axioms, { id: uid('a'), type: draftAxType as Axiom['type'], left: draftAxLeft, right: draftAxRight }],
        });
        setDraftAxLeft('');
        setDraftAxRight('');
    };

    const removeAxiom = (id: string) => {
        onStateChange({ ...state, axioms: state.axioms.filter(a => a.id !== id) });
    };

    const addCase = () => {
        if (!draftCaseName.trim()) return;
        onStateChange({
            ...state,
            cases: [...state.cases, { id: uid('x'), name: draftCaseName.trim(), note: draftCaseNote.trim(), categoryIds: [] }],
        });
        setDraftCaseName('');
        setDraftCaseNote('');
    };

    const removeCase = (id: string) => {
        onStateChange({ ...state, cases: state.cases.filter(c => c.id !== id) });
    };

    const toggleCaseCategory = (caseId: string, catId: string) => {
        onStateChange({
            ...state,
            cases: state.cases.map(c => {
                if (c.id !== caseId) return c;
                const has = c.categoryIds.includes(catId);
                return { ...c, categoryIds: has ? c.categoryIds.filter(id => id !== catId) : [...c.categoryIds, catId] };
            }),
        });
    };

    const setWeight = (key: keyof typeof state.weights, v: number) => {
        onStateChange({ ...state, weights: { ...state.weights, [key]: v } });
    };

    const phaseTone = metrics.phase === 'Calibrated' ? 'border-lime-500/30 bg-lime-500/5 text-lime-400'
        : metrics.phase === 'Underdeveloped' ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
        : metrics.phase === 'Overdetermined' ? 'border-red-500/30 bg-red-500/5 text-red-400'
        : metrics.phase === 'Heavy but workable' ? 'border-purple-500/30 bg-purple-500/5 text-purple-400'
        : 'border-pink-500/30 bg-pink-500/5 text-pink-400';

    const sections = [
        {
            title: 'Domain',
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {presetKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => onLoadPreset(key)}
                            className={`border px-2 py-2 text-left text-xs transition-colors ${
                                state.preset === key
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {PRESET_DESCRIPTIONS[key].label}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: `Categories (${state.categories.length})`,
            content: (
                <div className="space-y-2">
                    <div className="flex gap-1">
                        <input value={draftCatName} onChange={e => setDraftCatName(e.target.value)} placeholder="Name"
                            className="flex-1 border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                            style={{ backgroundColor: '#000' }} />
                        <Button label="+" onClick={addCategory} size="xs" />
                    </div>
                    <input value={draftCatDesc} onChange={e => setDraftCatDesc(e.target.value)} placeholder="Description (optional)"
                        className="w-full border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                        style={{ backgroundColor: '#000' }} />
                    {state.categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between border border-lime-500/10 p-1.5 text-xs">
                            <div>
                                <span className="text-lime-200">{cat.name}</span>
                                {cat.description && <span className="text-lime-200/40 ml-1">\u2014 {cat.description}</span>}
                            </div>
                            <button onClick={() => removeCategory(cat.id)} className="text-lime-200/30 hover:text-red-400 text-[10px]">{'\u00D7'}</button>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: `Relations (${state.relations.length})`,
            content: (
                <div className="space-y-2">
                    <div className="flex gap-1">
                        <input value={draftRelName} onChange={e => setDraftRelName(e.target.value)} placeholder="Relation name"
                            className="flex-1 border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                            style={{ backgroundColor: '#000' }} />
                        <Button label="+" onClick={addRelation} size="xs" />
                    </div>
                    {state.relations.map(rel => (
                        <div key={rel.id} className="flex items-center justify-between border border-lime-500/10 p-1.5 text-xs">
                            <span className="text-lime-200">{rel.name}</span>
                            <button onClick={() => removeRelation(rel.id)} className="text-lime-200/30 hover:text-red-400 text-[10px]">{'\u00D7'}</button>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: `Axioms (${state.axioms.length})`,
            content: (
                <div className="space-y-2">
                    <Dropdown name="type" selected={draftAxType} selectables={AXIOM_TYPES.map(t => t.value)} atSelect={v => setDraftAxType(v)} />
                    <div className="flex gap-1">
                        <Dropdown name="left" selected={draftAxLeft} selectables={state.categories.map(c => c.name)} atSelect={v => setDraftAxLeft(v)} />
                        <Dropdown name="right" selected={draftAxRight} selectables={state.categories.map(c => c.name)} atSelect={v => setDraftAxRight(v)} />
                    </div>
                    <Button label="add axiom" onClick={addAxiom} size="xs" />
                    {state.axioms.map(ax => (
                        <div key={ax.id} className="flex items-center justify-between border border-lime-500/10 p-1.5 text-xs">
                            <span className="text-lime-200">{ax.type}: {ax.left} {'\u2192'} {ax.right}</span>
                            <button onClick={() => removeAxiom(ax.id)} className="text-lime-200/30 hover:text-red-400 text-[10px]">{'\u00D7'}</button>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: `Cases (${state.cases.length})`,
            content: (
                <div className="space-y-2">
                    <div className="flex gap-1">
                        <input value={draftCaseName} onChange={e => setDraftCaseName(e.target.value)} placeholder="Case name"
                            className="flex-1 border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                            style={{ backgroundColor: '#000' }} />
                        <Button label="+" onClick={addCase} size="xs" />
                    </div>
                    <input value={draftCaseNote} onChange={e => setDraftCaseNote(e.target.value)} placeholder="Note (optional)"
                        className="w-full border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                        style={{ backgroundColor: '#000' }} />
                    {state.cases.map(c => (
                        <div key={c.id} className="border border-lime-500/10 p-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-lime-200 font-medium">{c.name}</span>
                                <button onClick={() => removeCase(c.id)} className="text-lime-200/30 hover:text-red-400 text-[10px]">{'\u00D7'}</button>
                            </div>
                            {c.note && <div className="text-[10px] text-lime-200/40">{c.note}</div>}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {state.categories.map(cat => {
                                    const active = c.categoryIds.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCaseCategory(c.id, cat.id)}
                                            className={`px-1.5 py-0.5 text-[10px] border transition-colors ${
                                                active
                                                    ? 'border-lime-500/40 bg-lime-500/15 text-lime-400'
                                                    : 'border-lime-500/10 text-lime-200/30 hover:text-lime-200/60'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Penalty Weights',
            content: (
                <div className="space-y-3">
                    <SliderInput label={'\u03BB complexity'} value={state.weights.complexity} onChange={v => setWeight('complexity', v)} min={0} max={1} step={0.05} showDecimals />
                    <SliderInput label={'\u03BC redundancy'} value={state.weights.redundancy} onChange={v => setWeight('redundancy', v)} min={0} max={1} step={0.05} showDecimals />
                    <SliderInput label={'\u03BD inconsistency'} value={state.weights.inconsistency} onChange={v => setWeight('inconsistency', v)} min={0} max={1} step={0.05} showDecimals />
                    <SliderInput label={'\u03C1 brittleness'} value={state.weights.brittleness} onChange={v => setWeight('brittleness', v)} min={0} max={1} step={0.05} showDecimals />
                </div>
            ),
        },
        {
            title: 'Phase',
            content: (
                <div className={`border p-3 text-xs ${phaseTone}`}>
                    <div className="font-medium">{metrics.phase}</div>
                    <div className="text-lime-200/50 mt-1">Q = {(metrics.quality * 100).toFixed(0)}% {'\u00B7'} Fit = {(metrics.fit * 100).toFixed(0)}% {'\u00B7'} Load = {(metrics.structureLoad * 100).toFixed(0)}%</div>
                </div>
            ),
        },
        {
            title: 'Narrative',
            content: (
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
            ),
        },
    ];

    return <PlaygroundSettings title="Settings" sections={sections} />;
}
