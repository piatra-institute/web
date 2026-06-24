'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
  calculatePhaseCoordinates,
  CaseStudy,
  caseStudies,
  TimelineEvent,
  FormulaCoefficients,
  defaultCoefficients,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

interface PlaygroundProps {
  sourceContext?: PlaygroundSourceContext;
}

export default function Playground({ sourceContext }: PlaygroundProps) {
  const calibration = useMemo(() => buildCalibration(), []);
  const [activeVersion, setActiveVersion] = useState(versions[0].id);
  const viewerRef = useRef<{ exportCanvas: () => void }>(null);

  // Core state
  const [maturity, setMaturity] = useState(50);
  const [community, setCommunity] = useState(50);
  const [donations, setDonations] = useState(50);
  const [cloud, setCloud] = useState(50);
  const [showStalks, setShowStalks] = useState(true);
  const [coefficients, setCoefficients] = useState<FormulaCoefficients>(defaultCoefficients);

  // Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [caseStudyTimelineIndex, setCaseStudyTimelineIndex] = useState(0);
  const [trajectory, setTrajectory] = useState<Array<{x: number, y: number}>>([]);
  const [currentEvent, setCurrentEvent] = useState<TimelineEvent | null>(null);
  const [sandboxTime, setSandboxTime] = useState(0);

  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coefficientsRef = useRef(coefficients);
  
  // Keep ref in sync with state
  useEffect(() => {
    coefficientsRef.current = coefficients;
  }, [coefficients]);

  // Calculate current coordinates
  const coordinates = calculatePhaseCoordinates(community, donations, cloud, maturity, coefficients);

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

    // Don't set trajectory here, let the main effect handle it
  }, [activeCaseStudy, maturity]);

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

            setTrajectory(prev => [...prev, calculatePhaseCoordinates(event.community, event.funding, event.pressure, event.maturity, coefficientsRef.current)]);

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
            const newPoint = calculatePhaseCoordinates(community, donations, cloud, maturity, coefficientsRef.current);
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

  // Update trajectory on shock
  useEffect(() => {
    if (currentEvent && !activeCaseStudy && !isPlaying) {
      setTrajectory([coordinates]);
    }
  }, [currentEvent, activeCaseStudy, isPlaying, coordinates]);

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
        <div className="space-y-8 text-gray-300">
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
              Pressure isn&apos;t just cloud competition; it is modulated by the multiplicative resistance of all three positive forces.
              Small changes can trigger cascading effects.
            </p>
          </div>

          <div>
            <strong className="text-yellow-400">The Phase Boundary:</strong>
            <p className="text-xs mt-1">
              The dashed line isn&apos;t fixed; it shifts based on your resource configuration. High community, funding, and maturity
              push it right (more pressure tolerated). Low resources pull it left (earlier crisis). This captures how
              well-resourced projects like PostgreSQL remain permissive despite pressure.
            </p>
          </div>

          <div>
            <strong className="text-cyan-400">Local Rules (Stalks):</strong>
            <p className="text-xs mt-1">
              Enable stalks to see how strategies vary across the space. In high-support zones: expand, invest, optimize.
              Near boundaries: stabilize, adapt. Under pressure: monetize, pivot, survive. The same position yields different
              strategies based on your underlying resources, a genuine contextualization.
            </p>
          </div>

          <div>
            <strong className="text-orange-400">Real-World Validation:</strong>
            <p className="text-xs mt-1">
              The case studies replay the documented trajectories of Redis, Elastic, MongoDB, MinIO, Sentry, and
              PostgreSQL. The model separates the resource extremes cleanly, but it does not reproduce the mid-range
              commercial relicensings of Redis, Elastic, and MongoDB: at their actual endpoints they are well-resourced
              enough to score permissive. Those moves were driven by ownership and revenue capture, which this
              four-variable state cannot represent. The calibration panel below is explicit about this.
            </p>
          </div>

            <p className="text-xs text-gray-400 italic">
              Framing note: the playground borrows sheaf language loosely, the idea that local data (the four variables
              at each point) coheres into global behavior (license decisions). The phase space is a 2D projection of the
              four-variable state. This is an evocative analogy, not a formal sheaf construction.
            </p>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-3">Implementation</h3>
            <VersionSelector versions={versions} active={activeVersion} onSelect={setActiveVersion} />
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
            <p className="leading-relaxed text-sm mb-4">
              The stochastic sandbox is not calibratable, so only the deterministic core is verified: the closed-form
              support and pressure scores and the license verdict. The boolean cases pass for the resource extremes; the
              float cases pin exact outputs. The model does not reproduce the mid-range commercial relicensings, and the
              calibration does not pretend otherwise.
            </p>
            <CalibrationPanel results={calibration} outputLabel="score / verdict" />
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
            <AssumptionPanel assumptions={assumptions} />
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
            <ModelChangelog entries={changelog} />
          </div>

          {sourceContext && (
            <div className="border-t border-lime-500/20 pt-8">
              <ResearchPromptButton context={sourceContext} />
            </div>
          )}
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
          coefficients={coefficients}
          onCoefficientsChange={setCoefficients}
        />
      }
      researchUrl="/playgrounds/open-source-sustainability/research"
    />
  );
}