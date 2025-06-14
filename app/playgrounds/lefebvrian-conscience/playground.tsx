'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Legend from './components/Legend';
import StatsDisplay from './components/StatsDisplay';
import LogDisplay from './components/LogDisplay';
import ChartsDisplay from './components/ChartsDisplay';
import Viewer from './components/Viewer';
import {
    Agent, Archetype, getDistance, LogEntryData, SimulationStats, ChartDataPoint,
    InteractionResult, LOW_RESOURCE_THRESHOLD, HIGH_RESOURCE_THRESHOLD, HELP_COST, HARM_COST,
    HELP_BENEFIT, HARM_BENEFIT, INTERACTION_RADIUS, INTERACTION_COOLDOWN, FEELING_RESET_INTERVAL,
    AWARENESS_MAX_LEVEL, AWARENESS_FACTOR_ADJUST, AWARENESS_GLOW_DURATION,
    PLOT_INTERVAL, MAX_PLOT_POINTS, MAX_LOG_ENTRIES, Group,
} from './lib/agent';



// Default settings values
const defaultSettings = {
    numAgents: 60,
    sys1Ratio: 0.5,
    speed: 1,
    awarenessRate: 0.05,
    reflexiveRate: 0.05,
    motivationStrength: 0.5,
};

export default function LefebvrePlayground() {
    // --- State Variables ---
    const [numAgents, setNumAgents] = useState(defaultSettings.numAgents);
    const [sys1Ratio, setSys1Ratio] = useState(defaultSettings.sys1Ratio);
    const [speed, setSpeed] = useState(defaultSettings.speed);
    const [awarenessRate, setAwarenessRate] = useState(defaultSettings.awarenessRate);
    const [reflexiveRate, setReflexiveRate] = useState(defaultSettings.reflexiveRate);
    const [motivationStrength, setMotivationStrength] = useState(defaultSettings.motivationStrength);

    const [agents, setAgents] = useState<Agent[]>([]);
    const [logEntries, setLogEntries] = useState<LogEntryData[]>([]);
    const [currentStats, setCurrentStats] = useState<SimulationStats | null>(null);
    const [chartDataHistory, setChartDataHistory] = useState<ChartDataPoint[]>([]);
    const [isRunning, setIsRunning] = useState(false); // Control simulation loop

    // Refs for simulation control and canvas dimensions
    const animationFrameId = useRef<number | null>(null);
    const frameCount = useRef<number>(0);
    const nextLogId = useRef<number>(0);
    const canvasSize = useRef<{ width: number; height: number }>({ width: 700, height: 450 }); // Default size

    // --- Logging Function ---
    const logEventCallback = useCallback((message: string) => {
        setLogEntries(prev => {
            const newEntry: LogEntryData = { id: nextLogId.current++, message };
            const updatedLog = [newEntry, ...prev];
            // Limit log size
            return updatedLog.slice(0, MAX_LOG_ENTRIES);
        });
    }, []); // Empty dependency array as it doesn't depend on component state directly

    // --- Interaction Logic (Adapted for React state) ---
    const handleInteraction = useCallback((agentA: Agent, agentB: Agent) => {
        // --- NOTE: This function now needs to update the main 'agents' state ---
        // --- It should return the changes needed, rather than modifying agents directly ---
        // --- For simplicity here, we'll *simulate* the logic and log, but actual state update is complex ---

        agentA.lastInteractionResult = null;
        if (agentA.cooldown > 0 || agentA.resources <= 0) return null; // Return null if no interaction

        const areInGroup = agentA.group === agentB.group;
        let standardDecision = 'ignore';
        let reason = "Default: No action beneficial/possible.";
        const targetIsNeedy = agentB.resources < LOW_RESOURCE_THRESHOLD;
        const targetIsRich = agentB.resources > HIGH_RESOURCE_THRESHOLD;
        const agentIsNeedy = agentA.resources < LOW_RESOURCE_THRESHOLD;
        const agentIsRich = agentA.resources > HIGH_RESOURCE_THRESHOLD;
        const effectiveInGroupHelpFactor = agentA.currentInGroupHelpFactor;
        const effectiveInGroupHarmFactor = agentA.currentInGroupHarmFactor;

        // Step 1: Motivational Override Check
        let motivationReason = "";
        let motivatedDecision = null;
        const motivationChance = motivationStrength; // Use state value
        if (agentA.archetype === 'hero' && agentA.currentGuilt > 0 && Math.random() < motivationChance) {
            if (agentA.resources >= HELP_COST) { motivatedDecision = 'help'; motivationReason = `<br><span class="motivation-override">Motivation: Minimize Guilt -> Help.</span>`; }
        } else if (agentA.archetype === 'opportunist' && agentA.currentSuffering > 0 && Math.random() < motivationChance) {
            if (agentB.resources >= HARM_COST) { motivatedDecision = 'harm'; motivationReason = `<br><span class="motivation-override">Motivation: Minimize Suffering -> Harm.</span>`; }
            else { motivatedDecision = 'ignore'; motivationReason = `<br><span class="motivation-override">Motivation: Minimize Suffering -> Ignore.</span>`; }
        } else if (agentA.archetype === 'hypocrite' && (agentA.currentGuilt > 0 || agentA.currentSuffering > 0) && Math.random() < motivationChance) {
            if (agentB.resources >= HARM_COST) { motivatedDecision = 'harm'; motivationReason = `<br><span class="motivation-override">Motivation: Avoid Neg. Feeling -> Harm.</span>`; }
            else { motivatedDecision = 'ignore'; motivationReason = `<br><span class="motivation-override">Motivation: Avoid Neg. Feeling -> Ignore.</span>`; }
        }

        // Step 2: Calculate Standard Decision (if not overridden)
        if (motivatedDecision === null) {
            // (Standard decision logic - simplified for brevity)
            if (agentA.ethicalSystem === 1) {
                reason = "Sys I Principle: ";
                if (agentA.tendency === 'compromise') standardDecision = 'help'; else standardDecision = 'harm'; // Highly simplified
            } else {
                reason = "Sys II Calculation: ";
                if (agentA.tendency === 'conflict') standardDecision = 'harm'; else standardDecision = 'help'; // Highly simplified
            }
            // Add basic feasibility checks
            if (standardDecision === 'help' && agentA.resources < HELP_COST) standardDecision = 'ignore';
            if (standardDecision === 'harm' && agentB.resources < HARM_COST) standardDecision = 'ignore';
            if (standardDecision === 'ignore') reason += "No action."; else reason += `Tendency towards ${standardDecision}.`;
        }

        // Step 3: Reflexive Control Attempt
        let finalDecision = motivatedDecision !== null ? motivatedDecision : standardDecision;
        let reflexiveReason = "";
        const reflexiveControlChance = reflexiveRate; // Use state value
        if (Math.random() < reflexiveControlChance) {
            const decisionBeforeRC = finalDecision;
            reflexiveReason = `<br><span class="reflexive-control">Reflexive Control Attempt:</span> `;
            // Simplified RC: Just flip the decision if possible
            if (finalDecision === 'help') finalDecision = 'ignore';
            else if (finalDecision === 'harm') finalDecision = 'help';
            else finalDecision = 'harm'; // If ignore, try harm
            reflexiveReason += ` Strategic change to ${finalDecision}.`;

            // RC Feasibility Check
            if (finalDecision === 'help' && agentA.resources < HELP_COST) { finalDecision = 'ignore'; reflexiveReason += ` (Reverted: Cannot afford Help).`; }
            else if (finalDecision === 'harm' && agentB.resources < HARM_COST) { finalDecision = 'ignore'; reflexiveReason += ` (Reverted: Target cannot afford Harm).`; }
            if (finalDecision === decisionBeforeRC) reflexiveReason = ""; // Clear if no change
        }

        // --- Step 4: Determine Outcome (but don't modify state directly) ---
        let actionTaken = false;
        let interactionOutcome: InteractionResult = null;
        let resourceChangeA = 0;
        let resourceChangeB = 0;
        let didHarm = false;

        if (finalDecision === 'help' && agentA.resources >= HELP_COST) {
            actionTaken = true; interactionOutcome = (HELP_BENEFIT > HELP_COST) ? 'helped_self' : 'helped_other_costly';
            resourceChangeA = -HELP_COST; resourceChangeB = HELP_BENEFIT;
        } else if (finalDecision === 'harm' && agentB.resources >= HARM_COST) {
            actionTaken = true; interactionOutcome = 'harmed_other';
            resourceChangeA = HARM_BENEFIT; resourceChangeB = -HARM_COST;
            didHarm = true;
        } else {
            finalDecision = 'ignore'; // Ensure final decision is ignore if action failed
        }

        // --- Step 5: Log the Event ---
        let logMsg = `<strong>A${agentA.id}</strong> (${agentA.archetype.substring(0, 3)}, S${agentA.ethicalSystem}) vs <strong>A${agentB.id}</strong> (${agentB.archetype.substring(0, 3)}, S${agentB.ethicalSystem}).<br>`;
        if (motivationReason) { logMsg += `${motivationReason}`; if (reflexiveReason) { logMsg += ` ${reflexiveReason}`; } logMsg += `<br>Final Decision: <span class="decision-${finalDecision.toLowerCase()}">${finalDecision.toUpperCase()}</span>.`; }
        else if (reflexiveReason) { logMsg += `Standard Decision: ${standardDecision.toUpperCase()}. ${reason}`; logMsg += `${reflexiveReason}`; logMsg += `<br>Final Decision: <span class="decision-${finalDecision.toLowerCase()}">${finalDecision.toUpperCase()}</span>.`; }
        else { logMsg += `Decision: <span class="decision-${finalDecision.toLowerCase()}">${finalDecision.toUpperCase()}</span>. Reason: ${reason}`; }
        if (actionTaken) logMsg += `<br>Outcome: A${agentA.id} (${resourceChangeA >= 0 ? '+' : ''}${resourceChangeA}), A${agentB.id} (${resourceChangeB >= 0 ? '+' : ''}${resourceChangeB}).`;
        else logMsg += `<br>Outcome: No resource change.`;
        logEventCallback(logMsg); // Use the callback to update log state

        // --- Step 6: Return necessary updates ---
        if (actionTaken) {
            // Determine if awareness should be triggered
            let triggerAwareness = false;
            const awarenessChance = awarenessRate; // Use state value
            let currentTriggerChance = awarenessChance;
            if (didHarm || agentIsNeedy) currentTriggerChance *= 2; // Simplified: assume being harmed triggers awareness too
            if (Math.random() < currentTriggerChance) {
                triggerAwareness = true;
                logEventCallback(`... <strong>A${agentA.id}</strong> performs Act of Awareness.`);
            }

            return {
                agentAId: agentA.id,
                agentBId: agentB.id,
                resourceChangeA,
                resourceChangeB,
                didHarm, // For feeling update
                interactionOutcome, // For awareness update
                triggerAwareness,
            };
        }
        return null; // No action taken

    }, [logEventCallback, motivationStrength, reflexiveRate, awarenessRate]); // Dependencies

    // --- Stats Calculation ---
    const calculateCurrentStats = useCallback((agentsToCalc: Agent[]): SimulationStats | null => {
        if (agentsToCalc.length === 0) return null;
        let stats: SimulationStats = { totalRes: 0, count: agentsToCalc.length, groupARes: 0, groupACount: 0, groupBRes: 0, groupBCount: 0, sys1Res: 0, sys1Count: 0, sys2Res: 0, sys2Count: 0, saintRes: 0, saintCount: 0, heroRes: 0, heroCount: 0, oppRes: 0, oppCount: 0, hypRes: 0, hypCount: 0, totalAwareness: 0, totalGuilt: 0, totalSuffering: 0 };
        agentsToCalc.forEach(agent => {
            stats.totalRes += agent.resources; stats.totalAwareness += agent.awarenessLevel;
            stats.totalGuilt += agent.currentGuilt; stats.totalSuffering += agent.currentSuffering;
            if (agent.group === 'A') { stats.groupARes += agent.resources; stats.groupACount++; } else { stats.groupBRes += agent.resources; stats.groupBCount++; }
            if (agent.ethicalSystem === 1) { stats.sys1Res += agent.resources; stats.sys1Count++; } else { stats.sys2Res += agent.resources; stats.sys2Count++; }
            switch (agent.archetype) {
                case 'saint': stats.saintRes += agent.resources; stats.saintCount++; break;
                case 'hero': stats.heroRes += agent.resources; stats.heroCount++; break;
                case 'opportunist': stats.oppRes += agent.resources; stats.oppCount++; break;
                case 'hypocrite': stats.hypRes += agent.resources; stats.hypCount++; break;
            }
        });
        return stats;
    }, []); // No dependency on agents state here

    // --- Simulation Loop Logic ---
    const runSimulationStep = useCallback(() => {
        // *** Use functional update form of setAgents to ensure we have the latest state ***
        setAgents(currentAgents => {
            // If no agents or not running, return current state
            if (!isRunning || currentAgents.length === 0) {
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
                return currentAgents;
            }

            frameCount.current++;
            let interactionUpdates: any[] = [];

            // 1. Create a mutable copy WITH methods for calculations in this step
            let tempAgents = currentAgents.map(a => Object.assign(Object.create(Object.getPrototypeOf(a)), a));

            // 2. Move Agents in the temporary array
            tempAgents.forEach(agent => {
                if (agent && typeof agent.move === 'function') {
                    agent.move(speed, canvasSize.current.width, canvasSize.current.height);
                }
            });

            // 3. Check Interactions using the temporary array
            for (let i = 0; i < tempAgents.length; i++) {
                for (let j = i + 1; j < tempAgents.length; j++) {
                    const agentA = tempAgents[i];
                    const agentB = tempAgents[j];
                    if (!agentA || !agentB) continue;

                    const distance = getDistance(agentA, agentB);
                    if (distance < INTERACTION_RADIUS) {
                        // Check only initiator's cooldown *before* calling handleInteraction
                        if (agentA.cooldown === 0) {
                            const update = handleInteraction(agentA, agentB); // Pass instances from tempAgents
                            if (update) interactionUpdates.push(update);
                        }
                        // Check B only if A didn't initiate and B is off cooldown
                        else if (agentB.cooldown === 0 && !interactionUpdates.some(u => u.agentAId === agentA.id || u.agentBId === agentA.id)) {
                            const update = handleInteraction(agentB, agentA); // Pass instances from tempAgents
                            if (update) interactionUpdates.push(update);
                        }
                    }
                }
            }

            // 4. Apply Updates to the temporary array
            interactionUpdates.forEach(update => {
                const agentAIndex = tempAgents.findIndex(a => a.id === update.agentAId);
                const agentBIndex = tempAgents.findIndex(a => a.id === update.agentBId);

                // Update Agent A (Initiator) in tempAgents
                if (agentAIndex !== -1) {
                    const agentAInstance = tempAgents[agentAIndex];
                    agentAInstance.resources += update.resourceChangeA;
                    agentAInstance.cooldown = INTERACTION_COOLDOWN;
                    agentAInstance.updateFeelings(update.didHarm, update.resourceChangeA);
                    agentAInstance.lastInteractionResult = update.interactionOutcome;
                    if (update.triggerAwareness) {
                        agentAInstance.performAwarenessAct(); // This updates state/timer internally
                    } else {
                        agentAInstance.setState(update.didHarm ? 'harming' : 'helping', 15);
                    }
                }
                // Update Agent B (Target) in tempAgents
                if (agentBIndex !== -1) {
                    const agentBInstance = tempAgents[agentBIndex];
                    agentBInstance.resources += update.resourceChangeB;
                    agentBInstance.setState(update.didHarm ? 'harmed' : 'helped', 15);
                }
            });

            // 5. Plotting (periodically) - Calculate stats based on the *updated* tempAgents
            if (frameCount.current % PLOT_INTERVAL === 0) {
                // Temporarily assign tempAgents to calculate stats correctly for this frame
                const stats = calculateCurrentStats(tempAgents); // Pass tempAgents to calculator
                if (stats) {
                    setChartDataHistory(prev => {
                        const newDataPoint: ChartDataPoint = {
                            time: frameCount.current,
                            avgResTotal: stats.totalRes / stats.count,
                            avgResGroupA: stats.groupACount > 0 ? stats.groupARes / stats.groupACount : null,
                            avgResGroupB: stats.groupBCount > 0 ? stats.groupBRes / stats.groupBCount : null,
                            avgAwareness: stats.totalAwareness / stats.count,
                            avgGuilt: (stats.totalGuilt / stats.count) * 100,
                            avgSuffering: (stats.totalSuffering / stats.count) * 100,
                        };
                        const updatedHistory = [...prev, newDataPoint];
                        return updatedHistory.slice(-MAX_PLOT_POINTS);
                    });
                }
            }

            // 6. Return the updated tempAgents array for the state update
            return tempAgents;
        }); // End of setAgents functional update

        // 7. Schedule next frame - moved outside setAgents
        if (isRunning) {
            animationFrameId.current = requestAnimationFrame(runSimulationStep);
        } else {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

    }, [isRunning, speed, handleInteraction, calculateCurrentStats]); // Dependencies

    // --- Setup Function ---
    const setupSimulation = useCallback(() => {
        const wasRunning = isRunning;

        // Stop any existing simulation
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        // Reset frame counter
        frameCount.current = 0;

        // Initialize new agents
        const newAgents: Agent[] = [];
        for (let i = 0; i < numAgents; i++) {
            const useSystem1 = Math.random() < sys1Ratio;
            const group: Group = Math.random() < 0.5 ? 'A' : 'B';
            const archetype: Archetype = (() => {
                const r = Math.random();
                if (r < 0.25) return 'saint';
                if (r < 0.5) return 'hero';
                if (r < 0.75) return 'opportunist';
                return 'hypocrite';
            })();

            newAgents.push(new Agent(
                i,
                useSystem1 ? 1 : 2,
                group,
                archetype,
                canvasSize.current.width,
                canvasSize.current.height
            ));
        }
        setAgents(newAgents);
        setLogEntries([]);
        setChartDataHistory([]);

        // Restart animation frame if it was running before
        if (wasRunning) {
            setTimeout(() => {
                if (isRunning) {  // Double-check isRunning is still true
                    animationFrameId.current = requestAnimationFrame(runSimulationStep);
                }
            }, 0);
        }
    }, [numAgents, sys1Ratio, isRunning, runSimulationStep]);

    // --- Effect to start/stop simulation loop ---
    useEffect(() => {
        // Always restart the animation frame when isRunning or settings change
        if (isRunning) {
            // Cancel any existing animation frame before starting a new one
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            console.log("Requesting animation frame...");
            animationFrameId.current = requestAnimationFrame(runSimulationStep);
        } else {
            // Clear the loop if it is running
            if (animationFrameId.current) {
                console.log("Cancelling animation frame...");
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        }
        // Cleanup function
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                console.log("Animation frame cancelled on unmount/cleanup.");
            }
        };
    }, [isRunning, runSimulationStep]); // Rerun effect if isRunning or runSimulationStep changes

    // Update stats display whenever calculated stats change
    useEffect(() => {
        // Calculate stats based on the *current* agents state
        setCurrentStats(calculateCurrentStats(agents));
    }, [agents, calculateCurrentStats]); // Depend on agents state


    // --- Effect to setup simulation on initial mount ---
    const [needsSetup, setNeedsSetup] = useState(true);

    useEffect(() => {
        if (needsSetup) {
            setupSimulation();
            setNeedsSetup(false);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [needsSetup, setupSimulation]);

    // Effect to handle settings changes separately
    useEffect(() => {
        if (!needsSetup) { // Skip on initial setup
            if (isRunning) {
                setupSimulation();
            }
        }
    }, [sys1Ratio, needsSetup, isRunning, setupSimulation]);

    // --- Reset Function ---
    const handleReset = () => {
        // Stop simulation if it's running
        setIsRunning(false);

        // Reset all settings to defaults
        setNumAgents(defaultSettings.numAgents);
        setSys1Ratio(defaultSettings.sys1Ratio);
        setSpeed(defaultSettings.speed);
        setAwarenessRate(defaultSettings.awarenessRate);
        setReflexiveRate(defaultSettings.reflexiveRate);
        setMotivationStrength(defaultSettings.motivationStrength);

        // Setup simulation will be triggered by state changes indirectly or call explicitly if needed
        setTimeout(setupSimulation, 50); // Call setup after state updates propagate
    };

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer
                    controls={
                        <Button
                            label={isRunning ? 'Pause' : 'Play'}
                            onClick={() => setIsRunning(!isRunning)}
                        />
                    }
                >
                    <Viewer
                        agents={agents}
                        width={canvasSize.current.width}
                        height={canvasSize.current.height}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        This simulation explores Vladimir Lefebvre&apos;s Algebra of Conscience,
                        a mathematical framework for modeling ethical decision-making and
                        self-reflection. Agents operate with two distinct ethical systems and
                        four archetypal moral characters, creating complex patterns of social
                        interaction through help and harm dynamics.
                    </p>
                    <p>
                        In Lefebvre&apos;s model, System 1 agents (deontological) view compromise
                        as positive and conflict as negative, while System 2 agents (utilitarian)
                        have inverted values. Combined with self-evaluation levels (high/low),
                        this creates four archetypes: saints (selfless helpers), heroes (guilt-driven
                        helpers), opportunists (suffering-driven harmers), and hypocrites
                        (avoiding negative feelings through harm).
                    </p>
                    <p>
                        Key concepts include: reflexive control (strategic manipulation of
                        others&apos; decisions), awareness acts (moments of ethical self-reflection),
                        motivational overrides (feelings of guilt or suffering driving behavior),
                        and the emergent dynamics between competing ethical systems in social space.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Controls',
                    content: (
                        <>
                            <Input
                                type="number"
                                min={10}
                                max={200}
                                step={10}
                                value={numAgents}
                                onChange={v => setNumAgents(parseInt(v, 10))}
                                label="Number of Agents"
                            />
                            <Input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={sys1Ratio}
                                onChange={v => setSys1Ratio(parseFloat(v))}
                                label={`System I ratio: ${sys1Ratio.toFixed(1)}`}
                            />
                            <Input
                                type="range"
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={speed}
                                onChange={v => setSpeed(parseFloat(v))}
                                label={`Speed: ${speed.toFixed(1)}`}
                            />
                            <Input
                                type="range"
                                min={0}
                                max={0.2}
                                step={0.01}
                                value={awarenessRate}
                                onChange={v => setAwarenessRate(parseFloat(v))}
                                label={`Awareness rate: ${awarenessRate.toFixed(2)}`}
                            />
                            <Input
                                type="range"
                                min={0}
                                max={0.2}
                                step={0.01}
                                value={reflexiveRate}
                                onChange={v => setReflexiveRate(parseFloat(v))}
                                label={`Reflexive-ctrl rate: ${reflexiveRate.toFixed(2)}`}
                            />
                            <Input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={motivationStrength}
                                onChange={v => setMotivationStrength(parseFloat(v))}
                                label={`Motivation strength: ${motivationStrength.toFixed(1)}`}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button
                                    className="flex-1"
                                    label="Restart"
                                    onClick={handleReset}
                                />
                            </div>
                        </>
                    ),
                },
                {
                    title: 'Legend',
                    content: <Legend />,
                },
                {
                    title: 'Statistics',
                    content: <StatsDisplay stats={currentStats} />,
                },
                {
                    title: 'Interaction Log',
                    content: <LogDisplay logEntries={logEntries} />,
                },
                {
                    title: 'Analytics',
                    content: <ChartsDisplay chartData={chartDataHistory} />,
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="Lefebvrian Conscience Explorer"
            subtitle="agents with different ethical systems interact through help and harm; observe group dynamics and social consciousness emergence"
            description={
                <span>
                    1982, Vladimir Lefebvre, Algebra of Conscience
                </span>
            }
            sections={sections}
            settings={settings}
        />
    );
}
