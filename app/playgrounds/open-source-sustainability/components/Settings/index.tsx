import Button from '@/components/Button';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import { CaseStudy, TimelineEvent } from '../../logic';

interface SettingsProps {
  maturity: number;
  community: number;
  donations: number;
  cloud: number;
  isPlaying: boolean;
  activeCaseStudy: CaseStudy | null;
  currentEvent: TimelineEvent | null;
  coordinates: { x: number; y: number };
  onMaturityChange: (value: number) => void;
  onCommunityChange: (value: number) => void;
  onDonationsChange: (value: number) => void;
  onCloudChange: (value: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onShock: () => void;
  onCaseStudySelect: (study: string) => void;
  disabled: boolean;
  showStalks: boolean;
  onShowStalksChange: (value: boolean) => void;
  sandboxTime: number;
}

export default function Settings({
  maturity,
  community,
  donations,
  cloud,
  isPlaying,
  activeCaseStudy,
  currentEvent,
  coordinates,
  onMaturityChange,
  onCommunityChange,
  onDonationsChange,
  onCloudChange,
  onPlayPause,
  onReset,
  onShock,
  onCaseStudySelect,
  disabled,
  showStalks,
  onShowStalksChange,
  sandboxTime,
}: SettingsProps) {
  const supportScore = coordinates.y;
  const pressureScore = coordinates.x;

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Case Studies</h3>
        <div className="grid grid-cols-2 gap-2 items-center justify-items-center">
          <Button label="Redis" onClick={() => onCaseStudySelect('redis')} size="sm" />
          <Button label="Elastic" onClick={() => onCaseStudySelect('elastic')} size="sm" />
          <Button label="MongoDB" onClick={() => onCaseStudySelect('mongodb')} size="sm" />
          <Button label="MinIO" onClick={() => onCaseStudySelect('minio')} size="sm" />
          <Button label="Sentry" onClick={() => onCaseStudySelect('sentry')} size="sm" />
          <Button label="PostgreSQL" onClick={() => onCaseStudySelect('postgresql')} size="sm" />
        </div>
        </div>

        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Simulation Control</h3>
        <div className="flex gap-2 items-center justify-center">
          <Button label={isPlaying ? 'Pause' : 'Play'} onClick={onPlayPause} size="sm" className="w-20" />
          <Button label="Reset" onClick={onReset} size="sm" />
          <Button label="⚡ Shock" onClick={onShock} disabled={activeCaseStudy !== null} size="sm" />
        </div>
        {currentEvent && (
          <div className="mt-3 text-center">
            <div className="text-yellow-400 font-mono text-sm">
              {currentEvent.year}
            </div>
            <div className="text-xs text-gray-400">
              {currentEvent.event}
            </div>
          </div>
        )}
        {!activeCaseStudy && sandboxTime > 0 && (
          <div className="mt-3 text-center">
            <div className="text-lime-400 font-mono text-sm">
              Time: {sandboxTime} {sandboxTime === 1 ? 'year' : 'years'}
            </div>
          </div>
        )}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Toggle
            text="Show Stalks (Local Rules)"
            value={showStalks}
            toggle={() => onShowStalksChange(!showStalks)}
          />
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-3">
            System Variables
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({activeCaseStudy ? `${activeCaseStudy.name} Timeline` : 'Sandbox Mode'})
          </span>
        </h3>
        <div className="space-y-4">
          <SliderInput
            label="Project Maturity"
            value={maturity}
            onChange={onMaturityChange}
            min={1}
            max={100}
            disabled={disabled}
            colorClass="text-purple-400"
          />
          <SliderInput
            label="Community Strength"
            value={community}
            onChange={onCommunityChange}
            min={0}
            max={100}
            disabled={disabled}
            colorClass="text-green-400"
          />
          <SliderInput
            label="Financial Health"
            value={donations}
            onChange={onDonationsChange}
            min={0}
            max={100}
            disabled={disabled}
            colorClass="text-blue-400"
          />
          <SliderInput
            label="Commercial Pressure"
            value={cloud}
            onChange={onCloudChange}
            min={0}
            max={100}
            disabled={disabled}
            colorClass="text-red-400"
          />
        </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-3">The Model Explained</h3>
        <div className="p-3 bg-black/50 border border-white/20 text-gray-300 text-sm space-y-3">
          <p>Sheaf-theoretic model: all four variables interact locally to determine global behavior</p>
          <div>
            <strong className="text-lime-400">Support emerges from synergies:</strong>
            <code className="block text-xs bg-black p-2 rounded mt-1 font-mono text-white leading-relaxed">
              community_eff = community × (0.7 + 0.3 × maturity^0.8)<br/>
              donation_eff = donations × (0.6 + 0.4 × maturity^0.6)<br/>
              synergy = 1 + 0.5 × sin(π × community × donations/10000)<br/>
              support = 100 × √((c_eff + d_eff)/200 × synergy)
            </code>
            <p className="text-right font-mono text-lg text-lime-400 mt-1">
              {supportScore.toFixed(1)}
            </p>
          </div>
          <div>
            <strong className="text-red-400">Pressure dampened by triple resistance:</strong>
            <code className="block text-xs bg-black p-2 rounded mt-1 font-mono text-white leading-relaxed">
              community_resist = 1 - 0.3×(community/100)<br/>
              financial_buffer = 1 - 0.2×(donations/100)<br/>
              maturity_inertia = 1 - 0.4×(maturity/100)^1.2<br/>
              pressure = (cloud × Π(resistances))² / 100
            </code>
            <p className="text-right font-mono text-lg text-orange-400 mt-1">
              {pressureScore.toFixed(1)}
            </p>
          </div>
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
            <strong>Interactions:</strong> Community × Maturity amplifies effectiveness.
            Donations × Maturity improves efficiency. Community × Donations creates synergy.
            All three resist pressure multiplicatively.
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}