import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import { CaseStudy, TimelineEvent, FormulaCoefficients, defaultCoefficients } from '../../logic';

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
  coefficients: FormulaCoefficients;
  onCoefficientsChange: (coefficients: FormulaCoefficients) => void;
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
  coefficients,
  onCoefficientsChange,
}: SettingsProps) {
  const supportScore = coordinates.y;
  const pressureScore = coordinates.x;

  const [isEditingFormulas, setIsEditingFormulas] = useState(false);
  const [editingCoefficients, setEditingCoefficients] = useState<FormulaCoefficients>(coefficients);

  useEffect(() => {
    setEditingCoefficients(coefficients);
  }, [coefficients]);

  const handleSaveFormulas = () => {
    onCoefficientsChange(editingCoefficients);
    setIsEditingFormulas(false);
  };

  const handleResetFormulas = () => {
    setEditingCoefficients(defaultCoefficients);
    onCoefficientsChange(defaultCoefficients);
  };

  const updateCoefficient = (key: keyof FormulaCoefficients, value: number) => {
    setEditingCoefficients(prev => ({ ...prev, [key]: value }));
  };

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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">The Model Explained</h3>
            <div className="flex gap-2">
              {isEditingFormulas && (
                <Button
                  label="Reset"
                  onClick={handleResetFormulas}
                  size="sm"
                  className="text-xs"
                />
              )}
              <Button
                label={isEditingFormulas ? 'Save' : 'Edit'}
                onClick={isEditingFormulas ? handleSaveFormulas : () => setIsEditingFormulas(true)}
                size="sm"
                className="text-xs"
              />
            </div>
          </div>
        <div className="p-3 bg-black/50 border border-white/20 text-gray-300 text-sm space-y-3">
          <p>Sheaf-theoretic model: all four variables interact locally to determine global behavior</p>
          <div>
            <strong className="text-lime-400">Support emerges from synergies:</strong>
            {isEditingFormulas ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">community_eff = community × (</span>
                  <Input
                    type="number"
                    value={editingCoefficients.communityBase}
                    onChange={(e) => updateCoefficient('communityBase', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">+</span>
                  <Input
                    type="number"
                    value={editingCoefficients.communityMaturityCoeff}
                    onChange={(e) => updateCoefficient('communityMaturityCoeff', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">× maturity^</span>
                  <Input
                    type="number"
                    value={editingCoefficients.communityMaturityPower}
                    onChange={(e) => updateCoefficient('communityMaturityPower', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">donation_eff = donations × (</span>
                  <Input
                    type="number"
                    value={editingCoefficients.donationBase}
                    onChange={(e) => updateCoefficient('donationBase', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">+</span>
                  <Input
                    type="number"
                    value={editingCoefficients.donationMaturityCoeff}
                    onChange={(e) => updateCoefficient('donationMaturityCoeff', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">× maturity^</span>
                  <Input
                    type="number"
                    value={editingCoefficients.donationMaturityPower}
                    onChange={(e) => updateCoefficient('donationMaturityPower', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">synergy = 1 +</span>
                  <Input
                    type="number"
                    value={editingCoefficients.synergyAmplitude}
                    onChange={(e) => updateCoefficient('synergyAmplitude', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">× sin(π × community × donations/10000)</span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  support = 100 × √((c_eff + d_eff)/200 × synergy)
                </div>
              </div>
            ) : (
              <code className="block text-xs bg-black p-2 rounded mt-1 font-mono text-white leading-relaxed">
                community_eff = community × ({coefficients.communityBase} + {coefficients.communityMaturityCoeff} × maturity^{coefficients.communityMaturityPower})<br/>
                donation_eff = donations × ({coefficients.donationBase} + {coefficients.donationMaturityCoeff} × maturity^{coefficients.donationMaturityPower})<br/>
                synergy = 1 + {coefficients.synergyAmplitude} × sin(π × community × donations/10000)<br/>
                support = 100 × √((c_eff + d_eff)/200 × synergy)
              </code>
            )}
            <p className="text-right font-mono text-lg text-lime-400 mt-1">
              {supportScore.toFixed(1)}
            </p>
          </div>
          <div>
            <strong className="text-red-400">Pressure dampened by triple resistance:</strong>
            {isEditingFormulas ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">community_resist = 1 -</span>
                  <Input
                    type="number"
                    value={editingCoefficients.communityResistCoeff}
                    onChange={(e) => updateCoefficient('communityResistCoeff', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">×(community/100)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">financial_buffer = 1 -</span>
                  <Input
                    type="number"
                    value={editingCoefficients.financialBufferCoeff}
                    onChange={(e) => updateCoefficient('financialBufferCoeff', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">×(donations/100)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono">maturity_inertia = 1 -</span>
                  <Input
                    type="number"
                    value={editingCoefficients.maturityInertiaCoeff}
                    onChange={(e) => updateCoefficient('maturityInertiaCoeff', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                  <span className="font-mono">×(maturity/100)^</span>
                  <Input
                    type="number"
                    value={editingCoefficients.maturityInertiaPower}
                    onChange={(e) => updateCoefficient('maturityInertiaPower', parseFloat(e) || 0)}
                    step={0.1}
                    compact
                    className="!w-[70px]"
                  />
                </div>
                <div className="text-xs font-mono text-gray-400">
                  pressure = (cloud × Π(resistances))² / 100
                </div>
              </div>
            ) : (
              <code className="block text-xs bg-black p-2 rounded mt-1 font-mono text-white leading-relaxed">
                community_resist = 1 - {coefficients.communityResistCoeff}×(community/100)<br/>
                financial_buffer = 1 - {coefficients.financialBufferCoeff}×(donations/100)<br/>
                maturity_inertia = 1 - {coefficients.maturityInertiaCoeff}×(maturity/100)^{coefficients.maturityInertiaPower}<br/>
                pressure = (cloud × Π(resistances))² / 100
              </code>
            )}
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