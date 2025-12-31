import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface ViewerProps {
  // Community parameters
  communitySize: number;
  proposalComplexity: number;
  participationRate: number;
  informationAccess: number;
  
  // Proposal dynamics
  proposalFrequency: number;
  proposalTypes: string;
  consensusThreshold: number;
  emergencyOverride: boolean;
  
  // Social dynamics
  trustLevel: number;
  socialCohesion: number;
  leadershipInfluence: number;
  groupthinkTendency: number;
  
  // Rejection mechanisms
  rejectionSensitivity: number;
  vetoThreshold: number;
  coolingOffPeriod: number;
  amendmentAllowed: boolean;
  
  // Visualization
  showNetwork: boolean;
  showProposals: boolean;
  showConsensus: boolean;
  colorMode: string;
  
  speedMs: number;
}

interface CommunityMember {
  id: number;
  x: number;
  y: number;
  trust: number;
  influence: number;
  participation: number;
  sentiment: number; // -1 (reject) to +1 (support)
  connections: number[];
  voteHistory: boolean[]; // true = reject, false = abstain
}

interface Proposal {
  id: number;
  type: string;
  complexity: number;
  x: number;
  y: number;
  age: number;
  rejections: number;
  amendments: number;
  status: 'active' | 'rejected' | 'cooling-off' | 'passed' | 'amended';
  color: string;
}

interface ConsensusPoint {
  time: number;
  rejectionRate: number;
  consensusStrength: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(({
  communitySize,
  proposalComplexity,
  participationRate,
  informationAccess,
  proposalFrequency,
  proposalTypes,
  consensusThreshold,
  emergencyOverride,
  trustLevel,
  socialCohesion,
  leadershipInfluence,
  groupthinkTendency,
  rejectionSensitivity,
  vetoThreshold,
  coolingOffPeriod,
  amendmentAllowed,
  showNetwork,
  showProposals,
  showConsensus,
  colorMode,
  speedMs,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  const [time, setTime] = useState(0);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [consensusHistory, setConsensusHistory] = useState<ConsensusPoint[]>([]);
  const [statistics, setStatistics] = useState({
    totalProposals: 0,
    rejectedProposals: 0,
    passedProposals: 0,
    averageRejectionRate: 0,
    consensusStrength: 0
  });

  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = 'vote-no-democracy.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }));

  // Initialize community members
  useEffect(() => {
    const newMembers: CommunityMember[] = [];
    
    for (let i = 0; i < communitySize; i++) {
      const angle = (i / communitySize) * 2 * Math.PI;
      const radius = 150 + Math.random() * 100;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      
      // Create connections (small-world network)
      const connections: number[] = [];
      const numConnections = Math.floor(3 + Math.random() * 5);
      
      for (let j = 0; j < numConnections; j++) {
        let connectionId;
        do {
          connectionId = Math.floor(Math.random() * communitySize);
        } while (connectionId === i || connections.includes(connectionId));
        connections.push(connectionId);
      }
      
      newMembers.push({
        id: i,
        x,
        y,
        trust: trustLevel * (0.5 + Math.random() * 0.5),
        influence: Math.random(),
        participation: participationRate * (0.5 + Math.random() * 0.5),
        sentiment: (Math.random() - 0.5) * 2, // -1 to +1
        connections,
        voteHistory: []
      });
    }
    
    setMembers(newMembers);
  }, [communitySize, trustLevel, participationRate]);

  // Generate proposals
  useEffect(() => {
    if (members.length === 0) return;
    
    const interval = setInterval(() => {
      if (Math.random() < proposalFrequency * 0.1) {
        const proposalTypeMap = {
          'conservative': ['budget', 'maintenance', 'safety'],
          'progressive': ['reform', 'expansion', 'innovation'],
          'mixed': ['budget', 'reform', 'maintenance', 'expansion'],
          'radical': ['revolution', 'transformation', 'disruption']
        };
        
        const types = proposalTypeMap[proposalTypes as keyof typeof proposalTypeMap] || ['generic'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const newProposal: Proposal = {
          id: Date.now(),
          type,
          complexity: proposalComplexity,
          x: 200 + Math.random() * 400,
          y: 100 + Math.random() * 200,
          age: 0,
          rejections: 0,
          amendments: 0,
          status: 'active',
          color: type === 'conservative' ? '#84cc16' : 
                type === 'progressive' ? '#3b82f6' :
                type === 'radical' ? '#ef4444' : '#f59e0b'
        };
        
        setProposals(prev => [...prev, newProposal]);
        setStatistics(prev => ({ ...prev, totalProposals: prev.totalProposals + 1 }));
      }
    }, 1000 / proposalFrequency);
    
    return () => clearInterval(interval);
  }, [members.length, proposalFrequency, proposalTypes, proposalComplexity]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const dt = speedMs / 1000;
      setTime(prev => prev + dt);
      
      // Update proposals
      setProposals(prev => prev.map(proposal => {
        if (proposal.status !== 'active') return proposal;
        
        proposal.age += dt;
        
        // Calculate rejection votes
        const activeMembers = members.filter(m => 
          Math.random() < m.participation && 
          Math.random() < informationAccess
        );
        
        let rejectionVotes = 0;
        activeMembers.forEach(member => {
          // Base rejection probability
          let rejectionProb = rejectionSensitivity;
          
          // Adjust based on proposal complexity
          rejectionProb += proposal.complexity * 0.3;
          
          // Adjust based on member sentiment
          rejectionProb += (1 - member.sentiment) * 0.2;
          
          // Adjust based on trust level
          rejectionProb -= member.trust * 0.2;
          
          // Social influence (groupthink)
          const connectedMembers = member.connections
            .map(id => members[id])
            .filter(Boolean);
          
          const avgConnectedSentiment = connectedMembers.reduce((sum, m) => 
            sum + m.sentiment, 0) / connectedMembers.length;
          
          rejectionProb += groupthinkTendency * (1 - avgConnectedSentiment) * 0.1;
          
          if (Math.random() < rejectionProb) {
            rejectionVotes++;
          }
        });
        
        const rejectionRate = rejectionVotes / Math.max(activeMembers.length, 1);
        
        // Check if proposal should be rejected
        if (rejectionRate > vetoThreshold) {
          proposal.rejections++;
          proposal.status = amendmentAllowed ? 'cooling-off' : 'rejected';
          
          if (proposal.status === 'rejected') {
            setStatistics(prev => ({ 
              ...prev, 
              rejectedProposals: prev.rejectedProposals + 1 
            }));
          }
        }
        
        // Check if proposal passes (lack of sufficient rejection)
        if (proposal.age > 5 && rejectionRate < (1 - consensusThreshold)) {
          proposal.status = 'passed';
          setStatistics(prev => ({ 
            ...prev, 
            passedProposals: prev.passedProposals + 1 
          }));
        }
        
        return proposal;
      }).filter(p => {
        // Remove old rejected/passed proposals
        if (p.status === 'rejected' || p.status === 'passed') {
          return p.age < 10; // Keep for 10 seconds for visualization
        }
        return true;
      }));
      
      // Update consensus tracking
      if (Math.floor(time) !== Math.floor(time - dt)) {
        const activeProposals = proposals.filter(p => p.status === 'active');
        const rejectionRate = activeProposals.length > 0 ? 
          activeProposals.reduce((sum, p) => sum + p.rejections, 0) / activeProposals.length : 0;
        
        const consensusStrength = 1 - Math.abs(0.5 - rejectionRate) * 2;
        
        setConsensusHistory(prev => {
          const newHistory = [...prev, { time, rejectionRate, consensusStrength }];
          // Keep only last 60 seconds
          return newHistory.filter(point => time - point.time < 60);
        });
        
        setStatistics(prev => ({ 
          ...prev, 
          averageRejectionRate: rejectionRate,
          consensusStrength
        }));
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    speedMs, members, informationAccess, rejectionSensitivity, vetoThreshold,
    groupthinkTendency, consensusThreshold, amendmentAllowed, time, proposals
  ]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw social network if enabled
    if (showNetwork) {
      drawSocialNetwork(ctx);
    }
    
    // Draw proposals if enabled
    if (showProposals) {
      drawProposals(ctx);
    }
    
    // Draw consensus evolution if enabled
    if (showConsensus) {
      drawConsensusEvolution(ctx, canvas.width, canvas.height);
    }
    
    // Draw statistics
    drawStatistics(ctx, canvas.width, canvas.height);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, proposals, consensusHistory, statistics, showNetwork, showProposals, showConsensus, colorMode]);

  const drawSocialNetwork = (ctx: CanvasRenderingContext2D) => {
    // Draw connections first
    ctx.strokeStyle = 'rgba(132, 204, 22, 0.2)';
    ctx.lineWidth = 1;
    
    members.forEach(member => {
      member.connections.forEach(connectionId => {
        const connected = members[connectionId];
        if (connected) {
          ctx.beginPath();
          ctx.moveTo(member.x, member.y);
          ctx.lineTo(connected.x, connected.y);
          ctx.stroke();
        }
      });
    });
    
    // Draw members
    members.forEach(member => {
      // Color based on selected mode
      let color = '#84cc16';
      switch (colorMode) {
        case 'sentiment':
          const sentimentHue = member.sentiment > 0 ? 120 : 0; // Green for positive, red for negative
          const saturation = Math.abs(member.sentiment) * 100;
          color = `hsl(${sentimentHue}, ${saturation}%, 50%)`;
          break;
        case 'influence':
          const influenceBrightness = Math.floor(member.influence * 255);
          color = `rgb(${influenceBrightness}, 255, ${influenceBrightness})`;
          break;
        case 'trust':
          const trustBrightness = Math.floor(member.trust * 255);
          color = `rgb(0, ${trustBrightness}, 255)`;
          break;
        case 'participation':
          const participationBrightness = Math.floor(member.participation * 255);
          color = `rgb(255, ${participationBrightness}, 0)`;
          break;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(member.x, member.y, 4 + member.influence * 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw rejection indicator
      if (member.sentiment < -0.5) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(member.x - 6, member.y - 6);
        ctx.lineTo(member.x + 6, member.y + 6);
        ctx.moveTo(member.x + 6, member.y - 6);
        ctx.lineTo(member.x - 6, member.y + 6);
        ctx.stroke();
      }
    });
  };

  const drawProposals = (ctx: CanvasRenderingContext2D) => {
    proposals.forEach(proposal => {
      let alpha = 1.0;
      let size = 8;
      
      switch (proposal.status) {
        case 'active':
          alpha = 1.0;
          size = 8 + proposal.complexity * 4;
          break;
        case 'rejected':
          alpha = 0.5;
          size = 6;
          break;
        case 'passed':
          alpha = 0.8;
          size = 10;
          break;
        case 'cooling-off':
          alpha = 0.6;
          size = 6;
          break;
      }
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = proposal.color;
      ctx.beginPath();
      ctx.rect(proposal.x - size/2, proposal.y - size/2, size, size);
      ctx.fill();
      
      // Draw rejection count
      if (proposal.rejections > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`-${proposal.rejections}`, proposal.x, proposal.y - size/2 - 5);
      }
      
      // Draw status indicator
      if (proposal.status === 'rejected') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(proposal.x - size, proposal.y - size);
        ctx.lineTo(proposal.x + size, proposal.y + size);
        ctx.moveTo(proposal.x + size, proposal.y - size);
        ctx.lineTo(proposal.x - size, proposal.y + size);
        ctx.stroke();
      } else if (proposal.status === 'passed') {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(proposal.x - size, proposal.y);
        ctx.lineTo(proposal.x - 2, proposal.y + size/2);
        ctx.lineTo(proposal.x + size, proposal.y - size);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
    });
  };

  const drawConsensusEvolution = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (consensusHistory.length < 2) return;
    
    const chartX = 20;
    const chartY = height - 120;
    const chartWidth = 200;
    const chartHeight = 80;
    
    // Draw chart background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    
    // Draw rejection rate line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    consensusHistory.forEach((point, i) => {
      const x = chartX + (i / (consensusHistory.length - 1)) * chartWidth;
      const y = chartY + chartHeight - (point.rejectionRate * chartHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw consensus strength line
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    consensusHistory.forEach((point, i) => {
      const x = chartX + (i / (consensusHistory.length - 1)) * chartWidth;
      const y = chartY + chartHeight - (point.consensusStrength * chartHeight);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('Consensus Evolution', chartX, chartY - 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Rejection Rate', chartX, chartY + chartHeight + 15);
    ctx.fillStyle = '#84cc16';
    ctx.fillText('Consensus Strength', chartX, chartY + chartHeight + 25);
  };

  const drawStatistics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    
    const stats = [
      `Time: ${time.toFixed(1)}s`,
      `Total Proposals: ${statistics.totalProposals}`,
      `Rejected: ${statistics.rejectedProposals}`,
      `Passed: ${statistics.passedProposals}`,
      `Rejection Rate: ${(statistics.averageRejectionRate * 100).toFixed(1)}%`,
      `Consensus: ${(statistics.consensusStrength * 100).toFixed(1)}%`,
    ];
    
    stats.forEach((text, i) => {
      ctx.fillText(text, width - 20, 20 + i * 16);
    });
    
    // Draw legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#84cc16';
    ctx.fillText('● Community Member', 20, height - 40);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('■ Progressive Proposal', 20, height - 25);
    ctx.fillStyle = '#84cc16';
    ctx.fillText('■ Conservative Proposal', 20, height - 10);
  };

  return (
    <div className="w-full h-full bg-black relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full border border-gray-700 rounded-lg"
      />
      <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono">
        <div>Democratic Resistance Simulation</div>
        <div className="text-lime-400">
          Veto Threshold: {(vetoThreshold * 100).toFixed(0)}% rejection required
        </div>
      </div>
    </div>
  );
});

Viewer.displayName = 'VoteNoViewer';

export default Viewer;