'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
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
    const calculateCurrentStats = useCallback((): SimulationStats | null => {
        if (agents.length === 0) return null;
        let stats: SimulationStats = {
            totalRes: 0, count: agents.length, groupARes: 0, groupACount: 0,
            groupBRes: 0, groupBCount: 0, sys1Res: 0, sys1Count: 0,
            sys2Res: 0, sys2Count: 0, saintRes: 0, saintCount: 0,
            heroRes: 0, heroCount: 0, oppRes: 0, oppCount: 0,
            hypRes: 0, hypCount: 0, totalAwareness: 0,
            totalGuilt: 0, totalSuffering: 0
        };
        agents.forEach(agent => {
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
    }, [agents]); // Recalculate when agents state changes

    // Update stats display whenever calculated stats change
    useEffect(() => {
        setCurrentStats(calculateCurrentStats());
    }, [calculateCurrentStats]);

    // --- Setup Function ---
    const setupSimulation = useCallback(() => {
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
    }, [numAgents, sys1Ratio]);

    // --- Simulation Loop Logic ---
    const runSimulationStep = useCallback(() => {
        if (!isRunning) return; // Early return if not running

        frameCount.current++;
        let interactionUpdates: any[] = [];

        // Create a mutable copy for this step's calculations
        let currentAgents = agents.map(a => Object.assign(Object.create(Object.getPrototypeOf(a)), a));

        // 1. Move Agents
        currentAgents.forEach(agent => {
            agent.move(speed, canvasSize.current.width, canvasSize.current.height);
        });

        // 2. Check Interactions
        for (let i = 0; i < currentAgents.length; i++) {
            for (let j = i + 1; j < currentAgents.length; j++) {
                const agentA = currentAgents[i];
                const agentB = currentAgents[j];
                if (!agentA || !agentB) continue;

                const distance = getDistance(agentA, agentB);
                if (distance < INTERACTION_RADIUS) {
                    // Randomly choose initiator
                    if (Math.random() < 0.5) {
                        const update = handleInteraction(agentA, agentB);
                        if (update) interactionUpdates.push(update);
                    } else {
                        const update = handleInteraction(agentB, agentA);
                        if (update) interactionUpdates.push(update);
                    }
                }
            }
        }

        // 3. Apply Interaction Updates to the state
        setAgents(prevAgents => {
            // Create a new array based on the previous state, maintaining prototype chain
            let nextAgents = prevAgents.map(agent => {
                // Create a new Agent instance with the same properties
                const newAgent = Object.create(Object.getPrototypeOf(agent));
                return Object.assign(newAgent, agent);
            });

            interactionUpdates.forEach(update => {
                const agentAIndex = nextAgents.findIndex(a => a.id === update.agentAId);
                const agentBIndex = nextAgents.findIndex(a => a.id === update.agentBId);

                if (agentAIndex !== -1) {
                    const updatedAgentA = Object.create(Object.getPrototypeOf(nextAgents[agentAIndex]));
                    Object.assign(updatedAgentA, nextAgents[agentAIndex], {
                        resources: nextAgents[agentAIndex].resources + update.resourceChangeA,
                        cooldown: INTERACTION_COOLDOWN,
                        currentGuilt: update.didHarm ? 1 : 0,
                        currentSuffering: update.resourceChangeA < 0 ? 1 : 0,
                        feelingResetTimer: FEELING_RESET_INTERVAL,
                        lastInteractionResult: update.interactionOutcome
                    });

                    if (update.triggerAwareness) {
                        if (updatedAgentA.awarenessLevel < AWARENESS_MAX_LEVEL) {
                            updatedAgentA.awarenessLevel++;
                        }
                        if (updatedAgentA.ethicalSystem === 1) {
                            updatedAgentA.currentInGroupHarmFactor += AWARENESS_FACTOR_ADJUST;
                        } else {
                            updatedAgentA.currentHarmThresholdModifier -= AWARENESS_FACTOR_ADJUST;
                        }
                        updatedAgentA.setState('aware', AWARENESS_GLOW_DURATION);
                    }

                    nextAgents[agentAIndex] = updatedAgentA;
                }

                if (agentBIndex !== -1) {
                    const updatedAgentB = Object.create(Object.getPrototypeOf(nextAgents[agentBIndex]));
                    Object.assign(updatedAgentB, nextAgents[agentBIndex], {
                        resources: nextAgents[agentBIndex].resources + update.resourceChangeB
                    });
                    nextAgents[agentBIndex] = updatedAgentB;
                }
            });

            // Apply move updates while maintaining prototype chain
            nextAgents = nextAgents.map((agent, index) => {
                const movedAgent = currentAgents[index];
                const updatedAgent = Object.create(Object.getPrototypeOf(agent));
                return Object.assign(updatedAgent, agent, {
                    x: movedAgent.x,
                    y: movedAgent.y,
                    vx: movedAgent.vx,
                    vy: movedAgent.vy,
                    cooldown: movedAgent.cooldown > agent.cooldown ? movedAgent.cooldown : agent.cooldown,
                    state: movedAgent.state !== 'idle' ? movedAgent.state : agent.state,
                    stateTimer: movedAgent.stateTimer > agent.stateTimer ? movedAgent.stateTimer : agent.stateTimer,
                    currentGuilt: movedAgent.currentGuilt,
                    currentSuffering: movedAgent.currentSuffering,
                    feelingResetTimer: movedAgent.feelingResetTimer,
                });
            });

            return nextAgents;
        });

        // 4. Plotting (periodically)
        if (frameCount.current % PLOT_INTERVAL === 0) {
            const stats = calculateCurrentStats(); // Calculate based on *current* agent state
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
                    return updatedHistory.slice(-MAX_PLOT_POINTS); // Limit history
                });
            }
        }

        // 5. Schedule next frame - only if still running
        if (isRunning) {
            animationFrameId.current = requestAnimationFrame(runSimulationStep);
        }

    }, [agents, speed, handleInteraction, calculateCurrentStats, isRunning]); // Simplified dependencies

    // --- Effect to start/stop simulation loop ---
    useEffect(() => {
        let isActive = true; // Flag to prevent updates after unmount

        if (isRunning && isActive) {
            animationFrameId.current = requestAnimationFrame(runSimulationStep);
        }

        return () => {
            isActive = false;
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [isRunning, runSimulationStep]);

    // --- Effect to setup simulation on initial mount ---
    useEffect(() => {
        setupSimulation();
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [setupSimulation]);

    // --- Reset Function ---
    const handleReset = () => {
        setNumAgents(defaultSettings.numAgents);
        setSys1Ratio(defaultSettings.sys1Ratio);
        setSpeed(defaultSettings.speed);
        setAwarenessRate(defaultSettings.awarenessRate);
        setReflexiveRate(defaultSettings.reflexiveRate);
        setMotivationStrength(defaultSettings.motivationStrength);
        // Setup simulation will be triggered by state changes indirectly or call explicitly if needed
        setTimeout(setupSimulation, 50); // Call setup after state updates propagate
    };

    // --- Render Component ---
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black">
            {/* Main simulation view centered */}
            <div className="simulation-area">
                <Viewer
                    agents={agents}
                    width={canvasSize.current.width}
                    height={canvasSize.current.height}
                />
            </div>

            {/* Header overlay */}
            <div className="absolute top-0 left-0 z-10 p-6">
                <Header />
                <Title text="Lefebvrian Conscience Explorer" />

                <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
                    explore how agents with different ethical systems interact
                    <br />
                    through help, harm, and strategic behavior
                    <br />
                    <br />
                    observe Group dynamics, Ethical Systems,
                    <br />
                    Awareness levels, and Feelings in real-time
                </div>
            </div>

            {/* Right panel overlay with glass effect */}
            <div className="absolute top-0 right-0 z-10 h-full max-w-[400px] bg-black/40 backdrop-blur-sm">
                <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
                    <Legend />
                    <Settings
                        numAgents={numAgents} setNumAgents={setNumAgents}
                        sys1Ratio={sys1Ratio} setSys1Ratio={setSys1Ratio}
                        speed={speed} setSpeed={setSpeed}
                        awarenessRate={awarenessRate} setAwarenessRate={setAwarenessRate}
                        reflexiveRate={reflexiveRate} setReflexiveRate={setReflexiveRate}
                        motivationStrength={motivationStrength} setMotivationStrength={setMotivationStrength}
                        onRestart={handleReset}
                    />
                    <StatsDisplay stats={currentStats} />
                    <LogDisplay logEntries={logEntries} />
                    <ChartsDisplay chartData={chartDataHistory} />
                </div>
            </div>
        </div>
    );
}
