'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';

interface SettingsProps {
    currentLevel: number;
    simulationRunning: boolean;
    simulationPaused: boolean;
    canDisrupt: boolean;
    onLevelChange: (level: number) => void;
    onStartReset: () => void;
    onPausePlay: () => void;
    onStep: () => void;
    onDisrupt: () => void;
    onExport: () => void;
    onExportData: () => void;
    onParamChange: (param: string, value: number) => void;
    simulationParams: {
        substrateCount: number;
        catalystCount: number;
        fragilityThreshold: number;
        simulationSpeed: number;
    };
}

const levelDescriptions = {
    1: {
        title: 'Level 1: Iconic Interpretation',
        content: `This level shows a basic **autogen**: a self-creating system. It has two linked processes: reciprocal catalysis and self-assembly. When enough capsid parts (gray triangles) are made, they form a shell, protecting the catalysts.

**The Sign:** Any disruption to the capsid is a sign of "non-self".

**The Interpretation:** The system's only response (the **interpretant**) is to use the released catalysts to rebuild itself. Because it responds to all disruptions in the same way, this is an **iconic** interpretation—the most basic form of meaning, based on simple resemblance (a broken thing is replaced by a fixed thing).

**What to watch for:** Once the shell forms, click 'Disrupt Capsid'. Watch as the freed catalysts (blue and green circles) consume substrates (purple squares) to create new capsid parts, which then form a new shell.`
    },
    2: {
        title: 'Level 2: Indexical Interpretation',
        content: `The autogen now "senses" its environment. The capsid surface has sites where substrate molecules (purple squares) can bind. As they bind, the capsid becomes fragile.

**The Sign:** The number of bound substrates is a sign that **indicates** the concentration of "food" in the environment.

**The Interpretation:** The autogen interprets a fragile capsid not just as damage, but as a sign that it's a good time to reproduce. It breaks apart, releasing its catalysts into a resource-rich area. This is an **indexical** relationship, where the sign (fragility) is physically correlated with its object (abundant resources).

**What to watch for:** Watch the purple squares stick to the shell and see the 'Capsid Fragility' meter fill up. When it's full, the capsid will shatter, and the repair process will begin.`
    },
    3: {
        title: 'Level 3: Symbolic Interpretation',
        content: `Here, the system's "rules" are offloaded onto a separate, stable molecule: a **template** (the light gray line). Catalysts are now ineffective unless they first bind to the template in the correct sequence.

**The Sign:** The template's sequence is a **symbol**. It's an "arbitrary" code that re-presents the constraints needed for the system to function. The information has been displaced from the dynamic system onto a heritable structure, analogous to DNA.

**The Interpretation:** The system reads the template to construct new components, which then self-assemble into a **new daughter autogen**. This is a recursive, symbolic process: information is used to create a copy of the system that carries the information.

**What to watch for:** Catalysts will snap to the template. When a pair is adjacent, a reaction will flash, producing new components. Once enough capsid parts are made, they will form a new, independent autogen.`
    }
};

export default function Settings({
    currentLevel,
    simulationRunning,
    simulationPaused,
    canDisrupt,
    onLevelChange,
    onStartReset,
    onPausePlay,
    onStep,
    onDisrupt,
    onExport,
    onExportData,
    onParamChange,
    simulationParams
}: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Select a Level',
                    content: (
                        <div className="space-y-2">
                            {[1, 2, 3].map(level => (
                                <button
                                    key={level}
                                    onClick={() => onLevelChange(level)}
                                    className={`w-full text-left p-3 font-medium transition-all ${
                                        currentLevel === level
                                            ? 'bg-lime-400 text-black'
                                            : 'bg-black border border-lime-400 hover:bg-lime-400/10 text-white'
                                    }`}
                                >
                                    Level {level}: {level === 1 ? 'Iconic' : level === 2 ? 'Indexical' : 'Symbolic'} Interpretation
                                </button>
                            ))}
                        </div>
                    )
                },
                {
                    title: currentLevel > 0 ? levelDescriptions[currentLevel as keyof typeof levelDescriptions].title : 'Welcome!',
                    content: (
                        <div className="text-sm text-gray-400 space-y-2">
                            {currentLevel === 0 ? (
                                <>
                                    <p>This playground simulates the emergence of semiotic (meaning-making) processes from simple chemistry, based on the work of biosemiotician Terrence Deacon.</p>
                                    <p>Select a level above and start the simulation to see how a simple &quot;autogen&quot; can evolve from merely self-repairing to interpreting its environment and eventually using a molecular &quot;symbol&quot; system.</p>
                                </>
                            ) : (
                                <div dangerouslySetInnerHTML={{ 
                                    __html: levelDescriptions[currentLevel as keyof typeof levelDescriptions].content
                                        .split('\n\n')
                                        .map(p => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}</p>`)
                                        .join('')
                                }} />
                            )}
                        </div>
                    )
                },
                {
                    title: 'Controls',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label={simulationRunning ? 'Reset Simulation' : 'Start Simulation'}
                                onClick={onStartReset}
                                className="w-full"
                                size="sm"
                                disabled={currentLevel === 0 && !simulationRunning}
                            />
                            {simulationRunning && (
                                <>
                                    <div className="flex gap-2">
                                        <Button
                                            label={simulationPaused ? 'Play' : 'Pause'}
                                            onClick={onPausePlay}
                                            className="flex-1"
                                            size="sm"
                                        />
                                        <Button
                                            label="Step"
                                            onClick={onStep}
                                            className="flex-1"
                                            size="sm"
                                            disabled={!simulationPaused}
                                        />
                                    </div>
                                    <SliderInput
                                        label="Simulation Speed"
                                        value={simulationParams.simulationSpeed}
                                        onChange={(value) => onParamChange('simulationSpeed', value)}
                                        min={0.1}
                                        max={3}
                                        step={0.1}
                                        colorClass="text-lime-400"
                                        showDecimals={true}
                                    />
                                </>
                            )}
                            {currentLevel === 1 && simulationRunning && canDisrupt && (
                                <Button
                                    label="Disrupt Capsid"
                                    onClick={onDisrupt}
                                    className="w-full bg-black border-2 border-lime-400 hover:bg-lime-400 hover:text-black"
                                    size="sm"
                                />
                            )}
                            <div className="flex gap-2">
                                <Button
                                    label="Export Canvas"
                                    onClick={onExport}
                                    className="flex-1"
                                    size="sm"
                                />
                                <Button
                                    label="Export Data"
                                    onClick={onExportData}
                                    className="flex-1"
                                    size="sm"
                                />
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Scientific Foundations',
                    content: (
                        <div className="space-y-4 text-sm text-gray-400">
                            <div className="space-y-2">
                                <h4 className="text-white font-medium">Reaction Schemas</h4>
                                <div className="bg-black/50 p-3 font-mono text-xs space-y-1">
                                    <p className="text-lime-400">Reciprocal Catalysis:</p>
                                    <p>A + C → 2C  (substrate A → catalyst C)</p>
                                    <p>D + F → F + G  (substrate D → capsid G)</p>
                                    <p className="text-lime-400 mt-2">Self-Assembly:</p>
                                    <p>nG → Capsid  (n ≈ 8-12 subunits)</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-white font-medium">Theoretical Basis</h4>
                                <p>Based on Terrence Deacon&apos;s autogenic model from <em>&ldquo;How Molecules Became Signs&rdquo;</em> (2021). The autogen demonstrates how semiotic processes can emerge from simple chemical dynamics.</p>
                                <p>Connects to established origin-of-life models like Gánti&apos;s chemoton: autocatalytic metabolism (C/F), self-assembled container (capsid), and hereditary molecule (template in Level 3).</p>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-white font-medium">Biological Analogies</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li><strong className="text-white">Level 1:</strong> Basic homeostasis (cell membrane repair)</li>
                                    <li><strong className="text-white">Level 2:</strong> Bacterial chemotaxis (environmental sensing)</li>
                                    <li><strong className="text-white">Level 3:</strong> Genetic code (DNA/RNA template)</li>
                                </ul>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-white font-medium">Key Concepts</h4>
                                <p><strong className="text-white">Autogen:</strong> A minimal self-maintaining system of coupled autocatalysis and self-assembly.</p>
                                <p><strong className="text-white">Semiosis:</strong> The process of sign interpretation, progressing from iconic (resemblance) to indexical (correlation) to symbolic (arbitrary code).</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'Experimental Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Initial Substrate Count"
                                value={simulationParams.substrateCount}
                                onChange={(value) => onParamChange('substrateCount', value)}
                                min={20}
                                max={200}
                                step={10}
                                disabled={simulationRunning}
                                colorClass="text-lime-400"
                            />
                            
                            <SliderInput
                                label="Initial Catalyst Count"
                                value={simulationParams.catalystCount}
                                onChange={(value) => onParamChange('catalystCount', value)}
                                min={2}
                                max={20}
                                step={1}
                                disabled={simulationRunning}
                                colorClass="text-lime-400"
                            />
                            
                            {currentLevel === 2 && (
                                <SliderInput
                                    label="Fragility Threshold"
                                    value={simulationParams.fragilityThreshold}
                                    onChange={(value) => onParamChange('fragilityThreshold', value)}
                                    min={10}
                                    max={40}
                                    step={5}
                                    disabled={simulationRunning}
                                    colorClass="text-lime-400"
                                />
                            )}
                            
                            <p className="text-gray-400 text-xs mt-3">
                                Parameters can only be adjusted before starting the simulation. 
                                Experiment with different values to see how they affect system dynamics.
                            </p>
                        </div>
                    )
                }
            ]}
        />
    );
}