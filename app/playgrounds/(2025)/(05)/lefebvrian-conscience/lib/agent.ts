export type EthicalSystem = 1 | 2;
export type Group = 'A' | 'B';
export type Archetype = 'saint' | 'hero' | 'opportunist' | 'hypocrite';
export type SelfEvaluation = 'high' | 'low';
export type Tendency = 'compromise' | 'conflict';
export type AgentState = 'idle' | 'helping' | 'harming' | 'helped' | 'harmed' | 'aware';
export type InteractionResult = 'helped_self' | 'helped_other_costly' | 'harmed_other' | 'harmed_self' | null;

// Simulation Parameters (can be moved to a constants file)
export const AGENT_RADIUS = 6;
export const INTERACTION_RADIUS = AGENT_RADIUS * 3.5;
export const INTERACTION_COOLDOWN = 30; // Frames
export const RESOURCE_START = 100;
export const HELP_COST = 5;
export const HELP_BENEFIT = 8;
export const HARM_BENEFIT = 5;
export const HARM_COST = 8;
export const BASE_IN_GROUP_HARM_FACTOR = 2.0;
export const BASE_IN_GROUP_HELP_FACTOR = 1.5;
export const LOW_RESOURCE_THRESHOLD = RESOURCE_START * 0.5;
export const HIGH_RESOURCE_THRESHOLD = RESOURCE_START * 1.5;
export const AWARENESS_GLOW_DURATION = 20;
export const AWARENESS_MAX_LEVEL = 5;
export const AWARENESS_FACTOR_ADJUST = 0.1;
export const FEELING_RESET_INTERVAL = 120; // Frames
export const PLOT_INTERVAL = 60; // Frames
export const MAX_PLOT_POINTS = 200;
export const MAX_LOG_ENTRIES = 100;

export class Agent {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    ethicalSystem: EthicalSystem;
    group: Group;
    archetype: Archetype;
    selfEvaluation: SelfEvaluation;
    tendency: Tendency;
    resources: number;
    cooldown: number;
    state: AgentState;
    stateTimer: number;
    color: string;
    awarenessLevel: number;
    lastInteractionResult: InteractionResult;
    currentInGroupHarmFactor: number;
    currentInGroupHelpFactor: number;
    currentHarmThresholdModifier: number;
    currentHelpThresholdModifier: number;
    currentGuilt: 0 | 1;
    currentSuffering: 0 | 1;
    feelingResetTimer: number;

    constructor(id: number, ethicalSystem: EthicalSystem, group: Group, archetype: Archetype, canvasWidth: number, canvasHeight: number) {
        this.id = id;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = AGENT_RADIUS;

        // Initialize velocity with a proper scale
        const angle = Math.random() * Math.PI * 2;
        const baseSpeed = 2.0; // Base speed for movement
        this.vx = Math.cos(angle) * baseSpeed;
        this.vy = Math.sin(angle) * baseSpeed;

        this.ethicalSystem = ethicalSystem;
        this.group = group;
        this.archetype = archetype;
        this.selfEvaluation = (archetype === 'hero' || archetype === 'hypocrite') ? 'high' : 'low';

        if (ethicalSystem === 1) {
            this.tendency = (archetype === 'saint' || archetype === 'hero') ? 'compromise' : 'conflict';
        } else {
            this.tendency = (archetype === 'saint' || archetype === 'hero') ? 'conflict' : 'compromise';
        }

        this.resources = RESOURCE_START;
        this.cooldown = 0;
        this.state = 'idle';
        this.stateTimer = 0;
        this.color = this.group === 'A' ? '#3498db' : '#e67e22'; // Blue for A, Orange for B

        this.awarenessLevel = 0;
        this.lastInteractionResult = null;
        this.currentInGroupHarmFactor = BASE_IN_GROUP_HARM_FACTOR;
        this.currentInGroupHelpFactor = BASE_IN_GROUP_HELP_FACTOR;
        this.currentHarmThresholdModifier = 0;
        this.currentHelpThresholdModifier = 0;
        this.currentGuilt = 0;
        this.currentSuffering = 0;
        this.feelingResetTimer = FEELING_RESET_INTERVAL;
    }

    // --- Agent Methods ---
    public move(speed: number, canvasWidth: number, canvasHeight: number) {
        // Randomly change direction occasionally
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            const baseSpeed = 2.0;
            this.vx = Math.cos(angle) * baseSpeed;
            this.vy = Math.sin(angle) * baseSpeed;
        }

        // Apply speed to movement
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Boundary checks with proper bounce
        if (this.x < this.radius || this.x > canvasWidth - this.radius) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(this.x, canvasWidth - this.radius));
        }
        if (this.y < this.radius || this.y > canvasHeight - this.radius) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(this.y, canvasHeight - this.radius));
        }

        if (this.cooldown > 0) this.cooldown--;

        // State timer
        if (this.stateTimer > 0) {
            this.stateTimer--;
            if (this.stateTimer === 0) this.state = 'idle';
        }

        // Feeling reset timer
        if (this.feelingResetTimer > 0) {
            this.feelingResetTimer--;
        } else {
            this.currentGuilt = 0;
            this.currentSuffering = 0;
        }

        if (this.resources < 0) this.resources = 0;
    }

    setState(newState: AgentState, duration = 15) {
        if (this.state !== 'aware' || newState === 'aware') {
            this.state = newState;
            this.stateTimer = duration;
        } else if (newState !== 'idle') {
            setTimeout(() => { if (this.state === 'aware') this.state = 'idle'; }, duration * 1000 / 60);
        }
    }

    performAwarenessAct() {
        if (this.awarenessLevel < AWARENESS_MAX_LEVEL) this.awarenessLevel++;
        this.setState('aware', AWARENESS_GLOW_DURATION);
        // (Awareness factor adjustment logic)
        if (this.ethicalSystem === 1) {
            this.currentInGroupHarmFactor += AWARENESS_FACTOR_ADJUST;
            if (this.tendency === 'compromise') { this.currentInGroupHelpFactor += AWARENESS_FACTOR_ADJUST; this.currentHelpThresholdModifier -= AWARENESS_FACTOR_ADJUST * 5; }
            else { this.currentHarmThresholdModifier += AWARENESS_FACTOR_ADJUST; }
        } else {
            if (this.lastInteractionResult === 'harmed_self' || this.lastInteractionResult === 'helped_other_costly') { this.currentHarmThresholdModifier += AWARENESS_FACTOR_ADJUST; this.currentHelpThresholdModifier -= AWARENESS_FACTOR_ADJUST; }
            else if (this.lastInteractionResult === 'harmed_other' || this.lastInteractionResult === 'helped_self') { this.currentHarmThresholdModifier -= AWARENESS_FACTOR_ADJUST; this.currentHelpThresholdModifier += AWARENESS_FACTOR_ADJUST; }
            this.currentHarmThresholdModifier = Math.max(-2, Math.min(2, this.currentHarmThresholdModifier));
            this.currentHelpThresholdModifier = Math.max(-2, Math.min(2, this.currentHelpThresholdModifier));
        }
        this.lastInteractionResult = null;
    }

    updateFeelings(didHarm: boolean, resourceChange: number) {
        this.currentGuilt = didHarm ? 1 : 0;
        this.currentSuffering = (resourceChange < 0) ? 1 : 0;
        this.feelingResetTimer = FEELING_RESET_INTERVAL;
    }

    // --- Drawing Method (to be called by Viewer component) ---
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        // Draw body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        let currentFill = this.color;
        if (this.state === 'helping' || this.state === 'helped') currentFill = '#2ecc71';
        else if (this.state === 'harming' || this.state === 'harmed') currentFill = '#e74c3c';
        ctx.fillStyle = currentFill;
        ctx.fill();
        // Draw border (Ethical System)
        ctx.strokeStyle = '#333';
        if (this.ethicalSystem === 1) { ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); }
        else { ctx.lineWidth = 1; ctx.setLineDash([]); }
        ctx.stroke();
        ctx.setLineDash([]);
        // Draw inner dot (Self-Evaluation)
        if (this.selfEvaluation === 'high') {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fill();
        }
        // Draw awareness glow
        if (this.state === 'aware') {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'gold'; ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7 * (this.stateTimer / AWARENESS_GLOW_DURATION);
            ctx.stroke(); ctx.globalAlpha = 1.0;
        }
        ctx.restore();
    }
}

// Utility function for distance
export function getDistance(agentA: Agent, agentB: Agent): number {
    const dx = agentA.x - agentB.x;
    const dy = agentA.y - agentB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Type for log entries
export interface LogEntryData {
    id: number;
    message: string;
}

// Type for stats object
export interface SimulationStats {
    totalRes: number; count: number; groupARes: number; groupACount: number;
    groupBRes: number; groupBCount: number; sys1Res: number; sys1Count: number;
    sys2Res: number; sys2Count: number; saintRes: number; saintCount: number;
    heroRes: number; heroCount: number; oppRes: number; oppCount: number;
    hypRes: number; hypCount: number; totalAwareness: number;
    totalGuilt: number; totalSuffering: number;
}

// Type for chart data points
export interface ChartDataPoint {
    time: number;
    avgResTotal: number | null;
    avgResGroupA: number | null;
    avgResGroupB: number | null;
    avgAwareness: number | null;
    avgGuilt: number | null;
    avgSuffering: number | null;
}
