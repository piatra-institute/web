'use client';

import AssumptionPanel from '@/components/AssumptionPanel';
import VersionSelector from '@/components/VersionSelector';
import { Assumption } from '@/components/AssumptionPanel';
import { ModelVersion } from '@/components/VersionSelector';

import {
    type Product,
    type MatrixRow,
    modes,
    modeCount,
    nearbyConstructions,
} from '../../logic';


interface ViewerProps {
    filtered: Product[];
    selected: Product | null;
    matrix: MatrixRow[];
    selectedMode: string;
    assumptions: Assumption[];
    versions: ModelVersion[];
    onSelectConstruction: (id: string) => void;
    onModeSelect: (mode: string) => void;
}

export default function Viewer({
    filtered,
    selected,
    matrix,
    selectedMode,
    assumptions,
    versions,
    onSelectConstruction,
    onModeSelect,
}: ViewerProps) {
    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            <div className="max-w-[1000px] mx-auto space-y-8 py-6 px-4">

                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />

                {/* Mode overview */}
                <div>
                    <h3 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-2">Modes of combination</h3>
                    <p className="text-xs text-lime-200/50 mb-4 leading-relaxed">
                        Each mode answers a different question about how two mathematical objects should be combined. Click to filter.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {modes.map(m => {
                            const active = selectedMode === m.key;
                            const count = modeCount(m.key);
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => onModeSelect(active ? 'all' : m.key)}
                                    className={`p-3 text-left border transition-colors ${
                                        active
                                            ? 'border-lime-500 bg-lime-500/10'
                                            : 'border-lime-500/20 hover:border-lime-500/40'
                                    }`}
                                >
                                    <div className={`text-xs font-semibold ${active ? 'text-lime-400' : 'text-lime-200/70'}`}>
                                        {m.label}
                                    </div>
                                    <div className={`text-[10px] mt-1 leading-relaxed ${active ? 'text-lime-200/60' : 'text-lime-200/40'}`}>
                                        {m.summary}
                                    </div>
                                    <div className={`text-[10px] mt-2 font-mono ${active ? 'text-lime-400' : 'text-lime-200/30'}`}>
                                        {count} construction{count !== 1 ? 's' : ''}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Field x Mode matrix */}
                <div>
                    <h3 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-2">Field \u00d7 mode matrix</h3>
                    <p className="text-xs text-lime-200/50 mb-4">Where each style of combination is most visible.</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-1">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1.5 text-left text-[9px] font-medium uppercase tracking-wider text-lime-200/40">Field</th>
                                    {modes.map(m => (
                                        <th key={m.key} className="px-1 py-1.5 text-center text-[8px] font-medium uppercase tracking-wider text-lime-200/30 max-w-[60px]">
                                            {m.label.split(' ')[0]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map(row => (
                                    <tr key={row.field}>
                                        <td className="px-2 py-1.5 text-xs text-lime-200/60 whitespace-nowrap">{row.field}</td>
                                        {row.cells.map(cell => {
                                            const hot = selectedMode === cell.key;
                                            const opacity = cell.count === 0 ? '0.08' : cell.count <= 1 ? '0.2' : cell.count <= 2 ? '0.35' : '0.55';
                                            return (
                                                <td key={cell.key} className="text-center">
                                                    <button
                                                        onClick={() => onModeSelect(hot ? 'all' : cell.key)}
                                                        className={`w-full px-1 py-1.5 text-[10px] font-mono border transition-colors ${
                                                            hot
                                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                                : 'border-lime-500/10 text-lime-200/40'
                                                        }`}
                                                        style={!hot ? { backgroundColor: `rgba(132,204,22,${opacity})` } : undefined}
                                                    >
                                                        {cell.count}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                {/* Construction browser + detail */}
                <div className="grid grid-cols-1 md:grid-cols-[0.42fr_0.58fr] gap-4">
                    {/* List */}
                    <div>
                        <h3 className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-3">
                            Constructions
                            <span className="ml-2 font-mono text-lime-200/40">{filtered.length}</span>
                        </h3>
                        <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
                            {filtered.map(p => {
                                const active = selected?.id === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => onSelectConstruction(p.id)}
                                        className={`w-full p-3 text-left border transition-colors ${
                                            active
                                                ? 'border-lime-500 bg-lime-500/10'
                                                : 'border-lime-500/20 hover:border-lime-500/40'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className={`text-sm font-semibold ${active ? 'text-lime-400' : 'text-lime-100'}`}>
                                                {p.name}
                                            </div>
                                            <div className={`text-[9px] px-1.5 py-0.5 border shrink-0 ${
                                                active ? 'border-lime-500/40 text-lime-400' : 'border-lime-500/20 text-lime-200/40'
                                            }`}>
                                                {p.difficulty}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-mono mt-1 ${active ? 'text-lime-200/60' : 'text-lime-200/40'}`}>
                                            {p.notation}
                                        </div>
                                        <div className={`text-xs mt-2 ${active ? 'text-lime-200/70' : 'text-lime-200/50'}`}>
                                            {p.oneLiner}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {p.mode.map(m => (
                                                <span key={m} className={`text-[8px] px-1.5 py-0.5 border ${
                                                    active ? 'border-lime-500/30 text-lime-400/70' : 'border-lime-500/10 text-lime-200/30'
                                                }`}>
                                                    {modes.find(mm => mm.key === m)?.label ?? m}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className="border border-dashed border-lime-500/20 p-6 text-center text-xs text-lime-200/40">
                                    No constructions match the current filters.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail */}
                    <div>
                        {selected ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {selected.field.map(f => (
                                            <span key={f} className="text-[9px] px-2 py-0.5 border border-lime-500/30 text-lime-200/60">{f}</span>
                                        ))}
                                    </div>
                                    <h2 className="text-xl font-semibold text-lime-100">{selected.name}</h2>
                                    <div className="text-sm font-mono text-lime-200/50 mt-1">{selected.notation}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-lime-500/20 p-3">
                                        <div className="text-[9px] uppercase tracking-widest text-lime-200/40">One-line idea</div>
                                        <div className="mt-1 text-sm font-semibold text-lime-400">{selected.oneLiner}</div>
                                        <div className="mt-2 text-xs text-lime-200/60 leading-relaxed">{selected.summary}</div>
                                    </div>
                                    <div className="border border-lime-500/20 p-3">
                                        <div className="text-[9px] uppercase tracking-widest text-lime-200/40">Mode tags</div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {selected.mode.map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => onModeSelect(selectedMode === m ? 'all' : m)}
                                                    className={`text-[10px] px-2 py-1 border transition-colors ${
                                                        selectedMode === m
                                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                            : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                                    }`}
                                                >
                                                    {modes.find(mm => mm.key === m)?.label ?? m}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-2 text-[9px] uppercase tracking-widest text-lime-200/40">Difficulty</div>
                                        <div className="mt-1 text-xs text-lime-400">{selected.difficulty}</div>
                                    </div>
                                </div>

                                <div className="border border-lime-500/20 p-3">
                                    <div className="text-[9px] uppercase tracking-widest text-lime-200/40 mb-2">Intuition</div>
                                    <p className="text-xs text-lime-200/70 leading-relaxed">{selected.intuition}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-lime-500/20 p-3">
                                        <div className="text-[9px] uppercase tracking-widest text-lime-200/40 mb-2">Use when</div>
                                        <ul className="space-y-1.5">
                                            {selected.useWhen.map(item => (
                                                <li key={item} className="flex gap-2 text-[11px] text-lime-200/60 leading-relaxed">
                                                    <span className="mt-1.5 h-1 w-1 bg-lime-500/40 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="border border-lime-500/20 p-3">
                                            <div className="text-[9px] uppercase tracking-widest text-lime-200/40 mb-2">Compare to</div>
                                            <p className="text-xs text-lime-200/60 leading-relaxed">{selected.compareTo}</p>
                                        </div>
                                        <div className="border border-lime-500/20 p-3">
                                            <div className="text-[9px] uppercase tracking-widest text-lime-200/40 mb-2">Example</div>
                                            <p className="text-xs text-lime-200/60 leading-relaxed">{selected.example}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-lime-200/40 mb-2">Nearby constructions</div>
                                    <div className="flex flex-wrap gap-1">
                                        {nearbyConstructions(selected).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => onSelectConstruction(p.id)}
                                                className="text-[10px] px-2 py-1 border border-lime-500/20 text-lime-200/50 hover:border-lime-500/40 hover:text-lime-400 transition-colors"
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-lime-500/20 p-8 text-center text-xs text-lime-200/40">
                                Select a construction to view details.
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-lime-500/10" />

                <AssumptionPanel assumptions={assumptions} />
            </div>
        </div>
    );
}
