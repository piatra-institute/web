import React from 'react';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
  // Community parameters
  communitySize: number;
  setCommunitySize: (value: number) => void;
  proposalComplexity: number;
  setProposalComplexity: (value: number) => void;
  participationRate: number;
  setParticipationRate: (value: number) => void;
  informationAccess: number;
  setInformationAccess: (value: number) => void;
  
  // Proposal dynamics
  proposalFrequency: number;
  setProposalFrequency: (value: number) => void;
  proposalTypes: string;
  setProposalTypes: (value: string) => void;
  consensusThreshold: number;
  setConsensusThreshold: (value: number) => void;
  emergencyOverride: boolean;
  setEmergencyOverride: (value: boolean) => void;
  
  // Social dynamics
  trustLevel: number;
  setTrustLevel: (value: number) => void;
  socialCohesion: number;
  setSocialCohesion: (value: number) => void;
  leadershipInfluence: number;
  setLeadershipInfluence: (value: number) => void;
  groupthinkTendency: number;
  setGroupthinkTendency: (value: number) => void;
  
  // Rejection mechanisms
  rejectionSensitivity: number;
  setRejectionSensitivity: (value: number) => void;
  vetoThreshold: number;
  setVetoThreshold: (value: number) => void;
  coolingOffPeriod: number;
  setCoolingOffPeriod: (value: number) => void;
  amendmentAllowed: boolean;
  setAmendmentAllowed: (value: boolean) => void;
  
  // Visualization
  showNetwork: boolean;
  setShowNetwork: (value: boolean) => void;
  showProposals: boolean;
  setShowProposals: (value: boolean) => void;
  showConsensus: boolean;
  setShowConsensus: (value: boolean) => void;
  colorMode: string;
  setColorMode: (value: string) => void;
  
  speedMs: number;
  setSpeedMs: (value: number) => void;
  
  // Actions
  onReset: () => void;
  onExport: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  communitySize,
  setCommunitySize,
  proposalComplexity,
  setProposalComplexity,
  participationRate,
  setParticipationRate,
  informationAccess,
  setInformationAccess,
  proposalFrequency,
  setProposalFrequency,
  proposalTypes,
  setProposalTypes,
  consensusThreshold,
  setConsensusThreshold,
  emergencyOverride,
  setEmergencyOverride,
  trustLevel,
  setTrustLevel,
  socialCohesion,
  setSocialCohesion,
  leadershipInfluence,
  setLeadershipInfluence,
  groupthinkTendency,
  setGroupthinkTendency,
  rejectionSensitivity,
  setRejectionSensitivity,
  vetoThreshold,
  setVetoThreshold,
  coolingOffPeriod,
  setCoolingOffPeriod,
  amendmentAllowed,
  setAmendmentAllowed,
  showNetwork,
  setShowNetwork,
  showProposals,
  setShowProposals,
  showConsensus,
  setShowConsensus,
  colorMode,
  setColorMode,
  speedMs,
  setSpeedMs,
  onReset,
  onExport,
}) => {
  return (
    <PlaygroundSettings
      sections={[
        {
          title: 'Community',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Community Size"
                value={communitySize}
                onChange={setCommunitySize}
                min={10}
                max={500}
                step={10}
                colorClass="text-lime-400"
              />
              <SliderInput
                label="Proposal Complexity"
                value={proposalComplexity}
                onChange={setProposalComplexity}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Participation Rate"
                value={participationRate}
                onChange={setParticipationRate}
                min={0.1}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Information Access"
                value={informationAccess}
                onChange={setInformationAccess}
                min={0.1}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Proposals',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Proposal Frequency"
                value={proposalFrequency}
                onChange={setProposalFrequency}
                min={0.1}
                max={5}
                step={0.1}
                colorClass="text-blue-400"
                showDecimals={true}
              />
              <Dropdown
                name="Proposal Types"
                selected={proposalTypes}
                selectables={['conservative', 'progressive', 'mixed', 'radical']}
                atSelect={setProposalTypes}
                tooltip="Distribution of proposal types"
              />
              <SliderInput
                label="Consensus Threshold"
                value={consensusThreshold}
                onChange={setConsensusThreshold}
                min={0.5}
                max={1}
                step={0.01}
                colorClass="text-blue-400"
                showDecimals={true}
              />
              <Toggle
                text="Emergency Override"
                value={emergencyOverride}
                toggle={() => setEmergencyOverride(!emergencyOverride)}
                tooltip="Allow emergency proposals to bypass normal processes"
              />
            </div>
          ),
        },
        {
          title: 'Social Dynamics',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Trust Level"
                value={trustLevel}
                onChange={setTrustLevel}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-purple-400"
                showDecimals={true}
              />
              <SliderInput
                label="Social Cohesion"
                value={socialCohesion}
                onChange={setSocialCohesion}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-purple-400"
                showDecimals={true}
              />
              <SliderInput
                label="Leadership Influence"
                value={leadershipInfluence}
                onChange={setLeadershipInfluence}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-purple-400"
                showDecimals={true}
              />
              <SliderInput
                label="Groupthink Tendency"
                value={groupthinkTendency}
                onChange={setGroupthinkTendency}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-red-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Rejection Mechanisms',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Rejection Sensitivity"
                value={rejectionSensitivity}
                onChange={setRejectionSensitivity}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-orange-400"
                showDecimals={true}
              />
              <SliderInput
                label="Veto Threshold"
                value={vetoThreshold}
                onChange={setVetoThreshold}
                min={0.1}
                max={0.5}
                step={0.01}
                colorClass="text-orange-400"
                showDecimals={true}
              />
              <SliderInput
                label="Cooling Off Period (days)"
                value={coolingOffPeriod}
                onChange={setCoolingOffPeriod}
                min={1}
                max={30}
                step={1}
                colorClass="text-orange-400"
              />
              <Toggle
                text="Amendment Allowed"
                value={amendmentAllowed}
                toggle={() => setAmendmentAllowed(!amendmentAllowed)}
                tooltip="Allow rejected proposals to be amended and resubmitted"
              />
            </div>
          ),
        },
        {
          title: 'Visualization',
          content: (
            <div className="space-y-2">
              <Toggle
                text="Social Network"
                value={showNetwork}
                toggle={() => setShowNetwork(!showNetwork)}
                tooltip="Show community member connections"
              />
              <Toggle
                text="Proposals"
                value={showProposals}
                toggle={() => setShowProposals(!showProposals)}
                tooltip="Show active proposals and their status"
              />
              <Toggle
                text="Consensus Evolution"
                value={showConsensus}
                toggle={() => setShowConsensus(!showConsensus)}
                tooltip="Show how consensus forms over time"
              />
              <Dropdown
                name="Color Mode"
                selected={colorMode}
                selectables={['sentiment', 'influence', 'trust', 'participation']}
                atSelect={setColorMode}
                tooltip="Node coloring scheme"
              />
            </div>
          ),
        },
        {
          title: 'Animation',
          content: (
            <SliderInput
              label="Speed"
              value={speedMs}
              onChange={setSpeedMs}
              min={10}
              max={100}
              step={5}
              colorClass="text-gray-300"
            />
          ),
        },
        {
          title: 'Actions',
          content: (
            <div className="flex gap-4">
              <Button onClick={onReset} label="Reset" />
              <Button onClick={onExport} label="Export" />
            </div>
          ),
        },
      ]}
    />
  );
};

export default Settings;