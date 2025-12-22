import { FC } from 'react';
import type { MechanismData } from '../../playground';

interface LegendProps {
    constriction: number;
    mechanisms: MechanismData[];
}

const Legend: FC<LegendProps> = ({ constriction, mechanisms }) => {
    const qualitative = (v: number) => {
        if (v > 0.5) return 'high narrowing';
        if (v > 0.1) return 'moderate narrowing';
        if (v > -0.1) return 'near baseline';
        if (v > -0.5) return 'moderate expansion';
        return 'deep expansion';
    };

    const mechSummary = () => {
        return mechanisms.map(m => {
            const lvl = m.weight > 0.66 ? 'high' : m.weight > 0.33 ? 'mid' : 'low';
            return `${m.name}:${lvl}`;
        }).join(' | ');
    };

    return (
        <div className="absolute bottom-4 right-4 bg-black/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4 max-w-md text-xs">
            <h4 className="text-[#03dac6] font-semibold mb-2 text-sm">Axis Meaning</h4>
            <p className="text-gray-300 mb-3">
                Vertical represents <strong>bandwidth change</strong>: +1 = full threat-narrowing; 
                –1 = max eustress bandwidth. Horizontal represents <strong>time</strong> from 
                Pre-event to multiple post‑trauma trajectories.
            </p>

            <h4 className="text-[#03dac6] font-semibold mb-2 text-sm">Outcome Trajectories</h4>
            <div className="space-y-1 mb-3">
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2196f3] mr-2 shrink-0" />
                    <span><strong>Resilience</strong> – minimal disturbance</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800] mr-2 shrink-0" />
                    <span><strong>Recovery</strong> – delayed rebound</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9c27b0] mr-2 shrink-0" />
                    <span><strong>Chronic</strong> – sustained narrowing</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009688] mr-2 shrink-0" />
                    <span><strong>Growth</strong> – exploratory expansion</span>
                </div>
            </div>

            <h4 className="text-[#03dac6] font-semibold mb-2 text-sm">Mechanisms (β‑scaled, 0–1)</h4>
            <p className="text-gray-300 mb-2">Spoke length & thickness scale with slider value.</p>
            <div className="space-y-1 mb-3">
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5252] mr-2 shrink-0" />
                    <span>Appraisal (threat ↔ meaning)</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb300] mr-2 shrink-0" />
                    <span>Rumination (intrusive ↔ deliberate)</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64b5f6] mr-2 shrink-0" />
                    <span>Social support</span>
                </div>
                <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4db6ac] mr-2 shrink-0" />
                    <span>Neuro‑flexibility</span>
                </div>
            </div>

            <h4 className="text-[#03dac6] font-semibold mb-2 text-sm">Current Interpretation</h4>
            <p className="text-gray-100 font-semibold mb-2">
                Currently: {qualitative(constriction)} (Δ={constriction.toFixed(2)}). 
                Mechanisms → {mechSummary()}
            </p>

            <div className="text-gray-500 text-[0.65rem] mt-3 pt-3 border-t border-gray-800">
                β‑weights from Tedeschi & Calhoun 1996; Cann 2011; Bonanno 2007; Kalisch 2015.
            </div>
        </div>
    );
};

export default Legend;