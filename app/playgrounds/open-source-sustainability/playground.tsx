'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
  calculatePhaseCoordinates,
  CaseStudy,
  caseStudies,
  SimulationState,
  TimelineEvent,
} from './logic';

export default function Playground() {
  const viewerRef = useRef<{ exportCanvas: () => void }>(null);

  // Core state
  const [maturity, setMaturity] = useState(50);
  const [community, setCommunity] = useState(50);
  const [donations, setDonations] = useState(50);
  const [cloud, setCloud] = useState(50);
  const [showStalks, setShowStalks] = useState(true);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [caseStudyTimelineIndex, setCaseStudyTimelineIndex] = useState(0);
  const [trajectory, setTrajectory] = useState<Array<{x: number, y: number}>>([]);
  const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);
  const [sandboxTime, setSandboxTime] = useState(0);

  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate current coordinates
  const coordinates = calculatePhaseCoordinates(community, donations, cloud, maturity);

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }

    setActiveCaseStudy(null);
    setCaseStudyTimelineIndex(0);
    setTrajectory([]);
    setCurrentEvent(null);
    setSandboxTime(0);

    // Reset sliders
    setMaturity(50);
    setCommunity(50);
    setDonations(50);
    setCloud(50);
  }, []);

  // Handle case study selection
  const handleCaseStudySelect = useCallback((studyKey: string) => {
    handleReset();
    const study = caseStudies[studyKey];
    if (!study) return;

    setActiveCaseStudy(study);
    const firstEvent = study.timeline[0];

    setMaturity(firstEvent.maturity);
    setCommunity(firstEvent.community);
    setDonations(firstEvent.funding);
    setCloud(firstEvent.pressure);
    setCurrentEvent(firstEvent);
  }, [handleReset]);

  // Shock event
  const handleShock = useCallback(() => {
    if (activeCaseStudy) return;

    const maturityModifier = 1.0 - (maturity / 150);
    const events = [
      {
        name: 'Key maintainer leaves!',
        effect: () => setCommunity(prev => Math.max(0, prev - 25 * maturityModifier))
      },
      {
        name: 'Major security flaw!',
        effect: () => {
          setCommunity(prev => Math.max(0, prev - 15 * maturityModifier));
          setDonations(prev => Math.max(0, prev - 15 * maturityModifier));
        }
      },
      {
        name: 'Goes viral!',
        effect: () => setCommunity(prev => Math.min(100, prev + 30 * maturityModifier))
      },
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.effect();

    setCurrentEvent({
      year: new Date().getFullYear(),
      maturity: 0,
      community: 0,
      funding: 0,
      pressure: 0,
      event: randomEvent.name
    });

    if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
    eventTimeoutRef.current = setTimeout(() => {
      setCurrentEvent(null);
    }, 4000);

    setTrajectory([calculatePhaseCoordinates(community, donations, cloud, maturity)]);
  }, [activeCaseStudy, maturity, community, donations, cloud]);

  // Play/pause simulation
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    } else {
      setIsPlaying(true);
      if (activeCaseStudy && caseStudyTimelineIndex === 0) {
        setTrajectory([]);
      }

      simulationRef.current = setInterval(() => {
        if (activeCaseStudy) {
          // Case study mode
          setCaseStudyTimelineIndex(prevIndex => {
            const timeline = activeCaseStudy.timeline;
            if (prevIndex >= timeline.length) {
              setIsPlaying(false);
              return prevIndex;
            }

            const event = timeline[prevIndex];
            setMaturity(event.maturity);
            setCommunity(event.community);
            setDonations(event.funding);
            setCloud(event.pressure);
            setCurrentEvent(event);

            setTrajectory(prev => [...prev, calculatePhaseCoordinates(event.community, event.funding, event.pressure, event.maturity)]);

            return prevIndex + 1;
          });
        } else {
          // Sandbox mode
          setSandboxTime(prev => prev + 1);
          const maturityModifier = 1.0 - (maturity / 200);

          setCloud(prev => {
            if (prev < 100) {
              return Math.min(100, prev + (Math.random() * 0.25) * maturityModifier);
            }
            return prev;
          });

          setTrajectory(prev => {
            const newPoint = calculatePhaseCoordinates(community, donations, cloud, maturity);
            const updated = [...prev, newPoint];
            return updated.length > 200 ? updated.slice(1) : updated;
          });
        }
      }, 1000);
    }
  }, [isPlaying, activeCaseStudy, caseStudyTimelineIndex, maturity, community, donations, cloud]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
      if (eventTimeoutRef.current) {
        clearTimeout(eventTimeoutRef.current);
      }
    };
  }, []);

  // Stop playing when case study ends
  useEffect(() => {
    if (activeCaseStudy && caseStudyTimelineIndex >= activeCaseStudy.timeline.length && isPlaying) {
      setIsPlaying(false);
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    }
  }, [activeCaseStudy, caseStudyTimelineIndex, isPlaying]);

  const sections = [
    {
      id: 'intro',
      type: 'intro' as const,
      content: (
        <>
          <p>
            This simulation models how open-source software projects evolve under commercial pressure.
            Watch as projects navigate the tension between community support and the need for sustainable funding.
          </p>
          <p>
            Based on real case studies from Redis, Elastic, MongoDB, and others, this model demonstrates
            the phase transition from permissive to restrictive licensing.
          </p>
        </>
      ),
    },
    {
      id: 'canvas',
      type: 'canvas' as const,
      content: (
        <PlaygroundViewer>
          <Viewer
            ref={viewerRef}
            coordinates={coordinates}
            trajectory={trajectory}
            showStalks={showStalks}
            maturity={maturity}
            community={community}
            donations={donations}
            cloud={cloud}
          />
        </PlaygroundViewer>
      ),
    },
    {
      id: 'about',
      type: 'outro' as const,
      content: (
        <div className="space-y-3 text-sm">
          <p>
            This model reveals how open-source sustainability emerges from the complex interplay of four forces:&nbsp;
            <span className="text-purple-400">maturity</span>, <span className="text-green-400">community</span>,&nbsp;
            <span className="text-blue-400">funding</span>, and <span className="text-red-400">commercial pressure</span>.&nbsp;
            Together, they create a phase space where license decisions become inevitable rather than arbitrary.
          </p>

          <div>
            <strong className="text-lime-400">Non-Linear Dynamics:</strong>
            <p className="text-xs mt-1">
              Support isn&apos;t just community + donations. It emerges from their synergy, amplified by maturity.
              Pressure isn&apos;t just cloud competition—it&apos;s modulated by the multiplicative resistance of all three positive forces.
              Small changes can trigger cascading effects.
            </p>
          </div>

          <div>
            <strong className="text-yellow-400">The Phase Boundary:</strong>
            <p className="text-xs mt-1">
              The dashed line isn&apos;t fixed—it shifts based on your resource configuration. High community, funding, and maturity
              push it right (more pressure tolerated). Low resources pull it left (earlier crisis). This captures how
              well-resourced projects like PostgreSQL remain permissive despite pressure.
            </p>
          </div>

          <div>
            <strong className="text-cyan-400">Local Rules (Stalks):</strong>
            <p className="text-xs mt-1">
              Enable stalks to see how strategies vary across the space. In high-support zones: expand, invest, optimize.
              Near boundaries: stabilize, adapt. Under pressure: monetize, pivot, survive. The same position yields different
              strategies based on your underlying resources—true contextualization.
            </p>
          </div>

          <div>
            <strong className="text-orange-400">Real-World Validation:</strong>
            <p className="text-xs mt-1">
              Case studies show actual trajectories: Redis and Elastic crossed into restrictive licensing when pressure
              overwhelmed support. PostgreSQL&apos;s strong community keeps it permissive. MinIO found a sustainable AGPL model.
              The model predicts these outcomes from first principles.
            </p>
          </div>

          <p className="text-xs text-gray-400 italic">
            Mathematical foundation: Sheaf theory, where local data (the four variables at each point) coheres into
            global behavior (license decisions). The phase space is a projection of a 4D manifold onto 2D, preserving
            the essential dynamics of open-source sustainability.
          </p>
        </div>
      ),
    },
  ];

  return (
    <PlaygroundLayout
      title="Open Source Sustainability"
      subtitle="phase transitions in software licensing under commercial pressure"
      sections={sections}
      settings={
        <Settings
          maturity={maturity}
          community={community}
          donations={donations}
          cloud={cloud}
          isPlaying={isPlaying}
          activeCaseStudy={activeCaseStudy}
          currentEvent={currentEvent}
          coordinates={coordinates}
          onMaturityChange={setMaturity}
          onCommunityChange={setCommunity}
          onDonationsChange={setDonations}
          onCloudChange={setCloud}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onShock={handleShock}
          onCaseStudySelect={handleCaseStudySelect}
          disabled={isPlaying || activeCaseStudy !== null}
          showStalks={showStalks}
          onShowStalksChange={setShowStalks}
          sandboxTime={sandboxTime}
        />
      }
    />
  );
}