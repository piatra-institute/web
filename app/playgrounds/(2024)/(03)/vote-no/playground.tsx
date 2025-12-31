'use client';

import { useState, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function VoteNoPlayground() {
    // Community parameters
    const [communitySize, setCommunitySize] = useState(100);
    const [proposalComplexity, setProposalComplexity] = useState(0.5);
    const [participationRate, setParticipationRate] = useState(0.7);
    const [informationAccess, setInformationAccess] = useState(0.8);
    
    // Proposal dynamics
    const [proposalFrequency, setProposalFrequency] = useState(1.0);
    const [proposalTypes, setProposalTypes] = useState('mixed');
    const [consensusThreshold, setConsensusThreshold] = useState(0.6);
    const [emergencyOverride, setEmergencyOverride] = useState(false);
    
    // Social dynamics
    const [trustLevel, setTrustLevel] = useState(0.5);
    const [socialCohesion, setSocialCohesion] = useState(0.6);
    const [leadershipInfluence, setLeadershipInfluence] = useState(0.3);
    const [groupthinkTendency, setGroupthinkTendency] = useState(0.2);
    
    // Rejection mechanisms
    const [rejectionSensitivity, setRejectionSensitivity] = useState(0.7);
    const [vetoThreshold, setVetoThreshold] = useState(0.3);
    const [coolingOffPeriod, setCoolingOffPeriod] = useState(7);
    const [amendmentAllowed, setAmendmentAllowed] = useState(true);
    
    // Visualization
    const [showNetwork, setShowNetwork] = useState(true);
    const [showProposals, setShowProposals] = useState(true);
    const [showConsensus, setShowConsensus] = useState(true);
    const [colorMode, setColorMode] = useState('sentiment');
    
    const [speedMs, setSpeedMs] = useState(50);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const viewerRef = useRef<{ exportCanvas: () => void }>(null);
    
    const handleReset = () => {
        setCommunitySize(100);
        setProposalComplexity(0.5);
        setParticipationRate(0.7);
        setInformationAccess(0.8);
        setProposalFrequency(1.0);
        setProposalTypes('mixed');
        setConsensusThreshold(0.6);
        setEmergencyOverride(false);
        setTrustLevel(0.5);
        setSocialCohesion(0.6);
        setLeadershipInfluence(0.3);
        setGroupthinkTendency(0.2);
        setRejectionSensitivity(0.7);
        setVetoThreshold(0.3);
        setCoolingOffPeriod(7);
        setAmendmentAllowed(true);
        setShowNetwork(true);
        setShowProposals(true);
        setShowConsensus(true);
        setColorMode('sentiment');
        setSpeedMs(50);
        setRefreshKey(prev => prev + 1);
    };
    
    const handleExport = () => {
        viewerRef.current?.exportCanvas();
    };

    return (
        <PlaygroundLayout
            title="vote no"
            subtitle="exploring democratic resistance and the power of rejection"
            sections={[
                {
                    id: 'intro',
                    type: 'intro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-4">The Democratic Power of &quot;No&quot;</h2>
                            <p>
                                In democratic systems, the ability to say <strong className="font-semibold text-lime-400">&quot;no&quot;</strong> is often 
                                more powerful than the ability to say &quot;yes.&quot; This playground explores what happens in a 
                                community where members can only vote to reject proposals—never to approve them.
                            </p>
                            <p>
                                Through collective rejection, communities can evolve toward better solutions by 
                                eliminating bad ideas rather than choosing good ones. This process mirrors natural 
                                selection: <strong className="font-semibold text-lime-400">evolution through elimination</strong> rather than 
                                selection through preference.
                            </p>
                            <div className="bg-black border border-gray-800 p-4 mt-4">
                                <h3 className="text-sm font-semibold text-lime-400 mb-2">Key Dynamics:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><strong className="text-white">Negative Consensus:</strong> Agreement emerges through shared rejection</li>
                                    <li><strong className="text-white">Proposal Evolution:</strong> Ideas improve through iterative rejection</li>
                                    <li><strong className="text-white">Veto Power:</strong> Minority protection through rejection rights</li>
                                    <li><strong className="text-white">Emergent Solutions:</strong> Better ideas arise from eliminating worse ones</li>
                                    <li><strong className="text-white">Democratic Resistance:</strong> The constructive power of saying no</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'canvas',
                    type: 'canvas',
                    content: (
                        <PlaygroundViewer>
                            <Viewer
                                ref={viewerRef}
                                key={refreshKey}
                                communitySize={communitySize}
                                proposalComplexity={proposalComplexity}
                                participationRate={participationRate}
                                informationAccess={informationAccess}
                                proposalFrequency={proposalFrequency}
                                proposalTypes={proposalTypes}
                                consensusThreshold={consensusThreshold}
                                emergencyOverride={emergencyOverride}
                                trustLevel={trustLevel}
                                socialCohesion={socialCohesion}
                                leadershipInfluence={leadershipInfluence}
                                groupthinkTendency={groupthinkTendency}
                                rejectionSensitivity={rejectionSensitivity}
                                vetoThreshold={vetoThreshold}
                                coolingOffPeriod={coolingOffPeriod}
                                amendmentAllowed={amendmentAllowed}
                                showNetwork={showNetwork}
                                showProposals={showProposals}
                                showConsensus={showConsensus}
                                colorMode={colorMode}
                                speedMs={speedMs}
                            />
                        </PlaygroundViewer>
                    )
                },
                {
                    id: 'outro',
                    type: 'outro',
                    content: (
                        <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                            <h2 className="text-2xl font-bold text-white mb-6">Democracy Through Elimination</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">The Philosophy of Rejection</h3>
                                    <p className="mb-3">
                                        Rejection-only voting systems operate on the principle that it&apos;s easier to identify 
                                        what we don&apos;t want than what we do want. Key advantages include:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Eliminates Strategic Voting:</strong> No incentive to vote for &quot;lesser evils&quot;</li>
                                        <li>• <strong>Protects Minorities:</strong> Any significant group can block harmful proposals</li>
                                        <li>• <strong>Encourages Better Proposals:</strong> Proposers must address all major concerns</li>
                                        <li>• <strong>Reduces Polarization:</strong> Focus shifts from competing to improving</li>
                                    </ul>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Consensus Through Rejection</h3>
                                    <p className="mb-3">
                                        When only rejection is possible, consensus emerges through different mechanisms:
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Proposal Refinement</h4>
                                            <p className="text-sm">Ideas evolve through iterative rejection and revision cycles</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Convergent Solutions</h4>
                                            <p className="text-sm">Multiple proposals converge toward commonly acceptable forms</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">Implicit Approval</h4>
                                            <p className="text-sm">Proposals that survive rejection attempts gain implicit legitimacy</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-black border border-gray-800 p-6">
                                    <h3 className="text-lg font-semibold text-lime-400 mb-3">Historical Examples</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• <strong>Scientific Peer Review:</strong> Theories advance by surviving attempts at falsification</li>
                                        <li>• <strong>Legal Systems:</strong> Rights emerge through resistance to their violation</li>
                                        <li>• <strong>Market Mechanisms:</strong> Bad products eliminated through consumer rejection</li>
                                        <li>• <strong>Evolutionary Biology:</strong> Species survive by avoiding extinction pressures</li>
                                    </ul>
                                </div>
                                
                                <div className="mt-8 p-6 border border-gray-800">
                                    <h3 className="text-lg font-semibold text-white mb-3">Further Reading</h3>
                                    <ul className="space-y-1 text-sm text-gray-400">
                                        <li>• James C. Scott - &quot;Seeing Like a State&quot; (high-modernist schemes)</li>
                                        <li>• Albert O. Hirschman - &quot;Exit, Voice, and Loyalty&quot;</li>
                                        <li>• Elinor Ostrom - &quot;Governing the Commons&quot;</li>
                                        <li>• Friedrich Hayek - &quot;The Use of Knowledge in Society&quot;</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
            settings={
                <Settings
                    communitySize={communitySize}
                    setCommunitySize={setCommunitySize}
                    proposalComplexity={proposalComplexity}
                    setProposalComplexity={setProposalComplexity}
                    participationRate={participationRate}
                    setParticipationRate={setParticipationRate}
                    informationAccess={informationAccess}
                    setInformationAccess={setInformationAccess}
                    proposalFrequency={proposalFrequency}
                    setProposalFrequency={setProposalFrequency}
                    proposalTypes={proposalTypes}
                    setProposalTypes={setProposalTypes}
                    consensusThreshold={consensusThreshold}
                    setConsensusThreshold={setConsensusThreshold}
                    emergencyOverride={emergencyOverride}
                    setEmergencyOverride={setEmergencyOverride}
                    trustLevel={trustLevel}
                    setTrustLevel={setTrustLevel}
                    socialCohesion={socialCohesion}
                    setSocialCohesion={setSocialCohesion}
                    leadershipInfluence={leadershipInfluence}
                    setLeadershipInfluence={setLeadershipInfluence}
                    groupthinkTendency={groupthinkTendency}
                    setGroupthinkTendency={setGroupthinkTendency}
                    rejectionSensitivity={rejectionSensitivity}
                    setRejectionSensitivity={setRejectionSensitivity}
                    vetoThreshold={vetoThreshold}
                    setVetoThreshold={setVetoThreshold}
                    coolingOffPeriod={coolingOffPeriod}
                    setCoolingOffPeriod={setCoolingOffPeriod}
                    amendmentAllowed={amendmentAllowed}
                    setAmendmentAllowed={setAmendmentAllowed}
                    showNetwork={showNetwork}
                    setShowNetwork={setShowNetwork}
                    showProposals={showProposals}
                    setShowProposals={setShowProposals}
                    showConsensus={showConsensus}
                    setShowConsensus={setShowConsensus}
                    colorMode={colorMode}
                    setColorMode={setColorMode}
                    speedMs={speedMs}
                    setSpeedMs={setSpeedMs}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
        />
    );
}