'use client';

import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import PlaygroundSettings from '@/components/PlaygroundSettings';



interface SettingsProps {
    epsilon: number;
    useExoticStructure: boolean;
    currentView: 'metric' | 'smooth' | 'topology';
    onEpsilonChange: (value: number) => void;
    onUseExoticStructureChange: (value: boolean) => void;
    onCurrentViewChange: (view: 'metric' | 'smooth' | 'topology') => void;
    onReset: () => void;
    onExport: () => void;
}

export default function Settings({
    epsilon,
    useExoticStructure,
    currentView,
    onEpsilonChange,
    onUseExoticStructureChange,
    onCurrentViewChange,
    onReset,
    onExport,
}: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'View Mode',
                    content: (
                        <div className="space-y-2">
                            <button
                                onClick={() => onCurrentViewChange('metric')}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    currentView === 'metric'
                                        ? 'bg-lime-50 text-black'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                Metric View
                            </button>
                            <button
                                onClick={() => onCurrentViewChange('smooth')}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    currentView === 'smooth'
                                        ? 'bg-lime-50 text-black'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                Smooth View
                            </button>
                            <button
                                onClick={() => onCurrentViewChange('topology')}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    currentView === 'topology'
                                        ? 'bg-lime-50 text-black'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                Topological View
                            </button>
                        </div>
                    ),
                },
                {
                    title: 'Topological Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Interaction Distance (ε)"
                                value={epsilon}
                                onChange={onEpsilonChange}
                                min={0}
                                max={250}
                                step={1}
                                showDecimals={false}
                            />
                            <p className="text-xs text-gray-400">
                                Controls the proximity radius for connecting points in topological view.
                            </p>
                        </div>
                    ),
                },
                {
                    title: 'Smooth Structure',
                    content: (
                        <div className="space-y-4">
                            <Toggle
                                text="Use &quot;Exotic&quot; Smooth Structure"
                                value={useExoticStructure}
                                toggle={() => onUseExoticStructureChange(!useExoticStructure)}
                            />
                            <p className="text-xs text-gray-400">
                                Toggle between standard and exotic smooth structures in smooth view.
                            </p>
                        </div>
                    ),
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label="Randomize Points"
                                onClick={() => {
                                    // This will be handled by the viewer
                                    window.dispatchEvent(new CustomEvent('randomize-points'));
                                }}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Reset All"
                                onClick={onReset}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Export Canvas"
                                onClick={onExport}
                                className="w-full"
                                size="sm"
                            />
                        </div>
                    ),
                },
            ]}
        />
    );
}
