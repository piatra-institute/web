'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import { SimulationParams, Mechanics } from '../../playground';

const DEFAULT_PARAMS: SimulationParams = {
    spamAgents: 1_000_000,
    audienceSize: 100_000_000,
    baselinePostsPerAgentPerDay: 0.2,
    avgDegree: 150,
    shareProb: 0.02,
    amplification: 1.0,
    convProb: 0.005,
    attentionHalfLifeMin: 240,
    gatingConvReduction: 0.20,
    cascadeLagMin: 60,
    simMinutes: 60 * 24 * 3, // 3 days
    seed: 42,
};

const DEFAULT_MECHANICS: Mechanics = {
    cooldown10h: true,
    coolup10h: true,
    election1hWindow: false,
    forwardCaps: true,
    questionGating: true,
    identityTiers: true,
    slowMode: true,
};

interface SettingsProps {
    onParamsChange: (params: SimulationParams, mechanics: Mechanics) => void;
    onReset: () => void;
}

function formatNumber(n: number): string {
    if (n < 1_000) return n.toFixed(0);
    if (n < 1_000_000) return (n / 1_000).toFixed(1) + 'k';
    if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    return (n / 1_000_000_000).toFixed(2) + 'B';
}

export default function Settings({ onParamsChange, onReset }: SettingsProps) {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [mechanics, setMechanics] = useState<Mechanics>(DEFAULT_MECHANICS);

    const updateParam = (key: keyof SimulationParams, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        onParamsChange(newParams, mechanics);
    };

    const updateMechanic = (key: keyof Mechanics, value: boolean) => {
        const newMechanics = { ...mechanics, [key]: value };
        setMechanics(newMechanics);
        onParamsChange(params, newMechanics);
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        setMechanics(DEFAULT_MECHANICS);
        onParamsChange(DEFAULT_PARAMS, DEFAULT_MECHANICS);
        onReset();
    };

    return (
        <div className="space-y-6">
            {/* Network Parameters */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Network Parameters</h3>

                <div>
                    <SliderInput
                        label="Spam agents"
                        min={100_000}
                        max={2_000_000}
                        step={50_000}
                        value={params.spamAgents}
                        onChange={(value) => updateParam('spamAgents', value)}
                        showDecimals={false}
                    />
                    <div className="text-xs text-gray-400 mt-1">{formatNumber(params.spamAgents)} coordinated accounts</div>
                </div>

                <div>
                    <SliderInput
                        label="Audience size"
                        min={10_000_000}
                        max={500_000_000}
                        step={10_000_000}
                        value={params.audienceSize}
                        onChange={(value) => updateParam('audienceSize', value)}
                        showDecimals={false}
                    />
                    <div className="text-xs text-gray-400 mt-1">{formatNumber(params.audienceSize)} reachable users</div>
                </div>

                <div>
                    <SliderInput
                        label="Baseline posts/agent/day"
                        min={0.05}
                        max={2.5}
                        step={0.05}
                        value={params.baselinePostsPerAgentPerDay}
                        onChange={(value) => updateParam('baselinePostsPerAgentPerDay', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Posts per spammer per day (before friction)</div>
                </div>

                <div>
                    <SliderInput
                        label="Avg degree (fan-out)"
                        min={20}
                        max={500}
                        step={5}
                        value={params.avgDegree}
                        onChange={(value) => updateParam('avgDegree', value)}
                        showDecimals={false}
                    />
                    <div className="text-xs text-gray-400 mt-1">Average out-neighbors per share</div>
                </div>

                <div>
                    <SliderInput
                        label="Share probability"
                        min={0.001}
                        max={0.15}
                        step={0.001}
                        value={params.shareProb}
                        onChange={(value) => updateParam('shareProb', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Base probability a viewer reshares</div>
                </div>

                <div>
                    <SliderInput
                        label="Amplification factor"
                        min={0.5}
                        max={2.5}
                        step={0.05}
                        value={params.amplification}
                        onChange={(value) => updateParam('amplification', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Algorithmic boost (&gt;1 amplifies)</div>
                </div>
            </div>

            {/* Manipulation Model */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Manipulation Model</h3>

                <div>
                    <SliderInput
                        label="Per-exposure manipulation prob"
                        min={0.0001}
                        max={0.05}
                        step={0.0001}
                        value={params.convProb}
                        onChange={(value) => updateParam('convProb', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">Baseline conversion probability per exposure</div>
                </div>

                <div>
                    <SliderInput
                        label="Attention half-life (minutes)"
                        min={30}
                        max={1440}
                        step={30}
                        value={params.attentionHalfLifeMin}
                        onChange={(value) => updateParam('attentionHalfLifeMin', value)}
                        showDecimals={false}
                    />
                    <div className="text-xs text-gray-400 mt-1">Novelty decay half-life ({(params.attentionHalfLifeMin / 60).toFixed(1)}h)</div>
                </div>

                <div>
                    <SliderInput
                        label="Gating conversion reduction"
                        min={0}
                        max={0.5}
                        step={0.05}
                        value={params.gatingConvReduction}
                        onChange={(value) => updateParam('gatingConvReduction', value)}
                        showDecimals
                    />
                    <div className="text-xs text-gray-400 mt-1">{(params.gatingConvReduction * 100).toFixed(0)}% extra reduction if gating enabled</div>
                </div>

                <div>
                    <SliderInput
                        label="Avg cascade lag (minutes)"
                        min={10}
                        max={300}
                        step={10}
                        value={params.cascadeLagMin}
                        onChange={(value) => updateParam('cascadeLagMin', value)}
                        showDecimals={false}
                    />
                    <div className="text-xs text-gray-400 mt-1">Average time from seed to exposure</div>
                </div>
            </div>

            {/* Policy Mechanics */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold">Policy Mechanics</h3>

                <Toggle
                    text="10h cooldown (lock after post)"
                    value={mechanics.cooldown10h}
                    toggle={() => updateMechanic('cooldown10h', !mechanics.cooldown10h)}
                />

                <Toggle
                    text="10h coolup (delayed visibility)"
                    value={mechanics.coolup10h}
                    toggle={() => updateMechanic('coolup10h', !mechanics.coolup10h)}
                />

                <Toggle
                    text="1h/day posting window (pre-election)"
                    value={mechanics.election1hWindow}
                    toggle={() => updateMechanic('election1hWindow', !mechanics.election1hWindow)}
                />

                <Toggle
                    text="Forward caps (fan-out ↘)"
                    value={mechanics.forwardCaps}
                    toggle={() => updateMechanic('forwardCaps', !mechanics.forwardCaps)}
                />

                <Toggle
                    text="Question-gating / prebunks"
                    value={mechanics.questionGating}
                    toggle={() => updateMechanic('questionGating', !mechanics.questionGating)}
                />

                <Toggle
                    text="Identity tiers (visibility ↘)"
                    value={mechanics.identityTiers}
                    toggle={() => updateMechanic('identityTiers', !mechanics.identityTiers)}
                />

                <Toggle
                    text="Per-thread slow mode"
                    value={mechanics.slowMode}
                    toggle={() => updateMechanic('slowMode', !mechanics.slowMode)}
                />
            </div>

            {/* Controls */}
            <div className="space-y-4">
                <Button
                    label="Reset to defaults"
                    onClick={handleReset}
                    className="w-full"
                />
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-2">
                <p>
                    <strong>PMI (Political Manipulation Impact):</strong> Cumulative measure of expected successful
                    manipulations, accounting for exposure count, conversion probability, attention decay, and
                    gating skepticism. The % reduction metric shows policy effectiveness.
                </p>
                <p>
                    <strong>R_eff:</strong> Effective reproduction number after policy interventions. Values &gt;1
                    indicate supercritical (growing) cascades; &lt;1 indicates subcritical (dying) cascades.
                </p>
            </div>
        </div>
    );
}
