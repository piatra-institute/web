'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
    currentLevel: number;
    simulationRunning: boolean;
    canDisrupt: boolean;
    onLevelChange: (level: number) => void;
    onStartReset: () => void;
    onDisrupt: () => void;
    onExport: () => void;
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
    canDisrupt,
    onLevelChange,
    onStartReset,
    onDisrupt,
    onExport
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
                            {currentLevel === 1 && simulationRunning && canDisrupt && (
                                <Button
                                    label="Disrupt Capsid"
                                    onClick={onDisrupt}
                                    className="w-full bg-black border-2 border-lime-400 hover:bg-lime-400 hover:text-black"
                                    size="sm"
                                />
                            )}
                            <Button
                                label="Export Canvas"
                                onClick={onExport}
                                className="w-full"
                                size="sm"
                            />
                        </div>
                    )
                }
            ]}
        />
    );
}