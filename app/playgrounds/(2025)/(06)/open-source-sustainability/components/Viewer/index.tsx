import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { determineLicenseState } from '../../logic';

interface ViewerProps {
  coordinates: { x: number; y: number };
  trajectory: Array<{ x: number; y: number }>;
  showStalks?: boolean;
  maturity?: number;
  community?: number;
  donations?: number;
  cloud?: number;
}

const Viewer = forwardRef<{ exportCanvas: () => void }, ViewerProps>(
  ({ coordinates, trajectory, showStalks = false, maturity = 50, community = 50, donations = 50, cloud = 50 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const licenseStatusRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      exportCanvas: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'open-source-sustainability-phase-diagram.png';
        link.href = canvas.toDataURL();
        link.click();
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const padding = 40;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw axes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Roboto Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Y-axis label
      ctx.save();
      ctx.translate(padding / 2 + 5, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Support Score', 0, 0);
      ctx.restore();

      // X-axis label
      ctx.fillText('Pressure Score', width / 2, height - padding / 2);

      // Helper functions for mapping coordinates
      const mapX = (val: number) => padding + (val / 100) * (width - 2 * padding);
      const mapY = (val: number) => (height - padding) - (val / 100) * (height - 2 * padding);

      // Draw phase boundary (adjusted by all four variables)
      const communityShift = (community - 50) / 200;
      const financialShift = (donations - 50) / 200;
      const maturityShift = (maturity - 50) / 200;
      const totalShift = communityShift + financialShift + maturityShift;
      const boundaryAdjustment = 1 - totalShift;
      
      ctx.beginPath();
      // Dynamic boundary based on full state
      for (let i = 0; i <= 100; i++) {
        const x = i;
        // Non-linear boundary curve affected by resource configuration
        const baseY = x;
        const adjustedY = baseY / boundaryAdjustment;
        const px = mapX(x);
        const py = mapY(adjustedY);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      // Boundary appearance changes based on stability
      const stability = (maturity * community * donations) / 125000; // 0 to 1
      ctx.strokeStyle = stability > 0.5 ? '#fbbf24' : '#f97316';
      ctx.lineWidth = 2 + stability * 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zone labels - position based on actual boundary
      ctx.font = '14px Inter, sans-serif';
      
      // Calculate label positions based on boundary adjustment
      // For permissive zone, find a point clearly in the green area
      const permissiveX = 25;
      const permissiveY = 75 / boundaryAdjustment; // Adjust Y to stay in permissive zone
      const permissivePx = mapX(permissiveX);
      const permissivePy = mapY(Math.min(95, permissiveY));
      
      ctx.fillStyle = 'rgba(134, 204, 22, 0.6)';
      ctx.fillText('Permissive Zone', permissivePx, permissivePy);
      
      // For restrictive zone, find a point clearly in the red area
      const restrictiveX = 75;
      const restrictiveY = 25 * boundaryAdjustment; // Adjust Y to stay in restrictive zone
      const restrictivePx = mapX(restrictiveX);
      const restrictivePy = mapY(Math.max(5, restrictiveY));
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fillText('Restrictive Zone', restrictivePx, restrictivePy);

      // Draw stalks (local rules) if enabled
      if (showStalks) {
        ctx.font = '11px Inter, sans-serif';
        
        // Draw grid of stalks
        const stalkSpacing = 60;
        for (let x = padding + stalkSpacing; x < width - padding; x += stalkSpacing) {
          for (let y = padding + stalkSpacing; y < height - padding; y += stalkSpacing) {
            // Convert pixel coordinates to data coordinates
            const dataX = ((x - padding) / (width - 2 * padding)) * 100;
            const dataY = 100 - ((y - padding) / (height - 2 * padding)) * 100;
            
            // Determine local rule based on all four variables interacting
            // This is the sheaf structure: local state determines local behavior
            let rule = '';
            let color = '';
            
            // Calculate local "health" metric from all four variables
            const localMaturity = maturity / 100;
            const localCommunity = community / 100;
            const localDonations = donations / 100;
            const localPressure = cloud / 100;
            
            // Local interaction strength
            const resourceStrength = (localCommunity + localDonations) / 2;
            const stability = localMaturity * (1 - localPressure);
            const momentum = resourceStrength * stability;
            
            if (dataY >= dataX) {
              // Permissive zone - rules depend on resource configuration
              if (dataY > 70 && dataX < 30) {
                // High support, low pressure
                if (momentum > 0.6) {
                  rule = localCommunity > localDonations ? 'expand' : 'invest';
                } else if (momentum > 0.3) {
                  rule = localMaturity > 0.5 ? 'optimize' : 'innovate';
                } else {
                  rule = 'explore';
                }
                color = `rgba(134, 204, 22, ${0.4 + momentum * 0.4})`;
              } else if (dataY > 50 && dataX < 50) {
                // Moderate zone
                if (resourceStrength > 0.6) {
                  rule = stability > 0.5 ? 'scale' : 'grow';
                } else {
                  rule = localCommunity > localDonations ? 'engage' : 'fund';
                }
                color = `rgba(134, 204, 22, ${0.3 + momentum * 0.3})`;
              } else {
                // Near boundary
                rule = stability > 0.3 ? 'maintain' : 'stabilize';
                color = `rgba(134, 204, 22, ${0.2 + momentum * 0.2})`;
              }
            } else {
              // Restrictive zone - survival strategies based on resources
              if (dataX > 70 && dataY < 30) {
                // High pressure, low support
                if (localDonations > 0.5) {
                  rule = 'monetize';
                } else if (localCommunity > 0.5) {
                  rule = 'rally';
                } else {
                  rule = 'survive';
                }
                color = `rgba(239, 68, 68, ${0.4 + (1-momentum) * 0.4})`;
              } else if (dataX > 50 && dataY < 50) {
                // Moderate restrictive
                rule = resourceStrength > 0.5 ? 'sustain' : 'pivot';
                color = `rgba(239, 68, 68, ${0.3 + (1-momentum) * 0.3})`;
              } else {
                // Transition zone
                rule = momentum > 0.3 ? 'adapt' : 'transform';
                color = `rgba(251, 191, 36, ${0.4 + Math.abs(momentum - 0.5) * 0.4})`;
              }
            }
            
            // Draw stalk
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(rule, x, y);
          }
        }
      }

      // Draw trajectory
      if (trajectory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(mapX(trajectory[0].x), mapY(trajectory[0].y));
        for (let i = 1; i < trajectory.length; i++) {
          ctx.lineTo(mapX(trajectory[i].x), mapY(trajectory[i].y));
        }
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw current position
      const mappedX = mapX(coordinates.x);
      const mappedY = mapY(coordinates.y);

      ctx.beginPath();
      ctx.arc(mappedX, mappedY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Update license status
      const licenseState = determineLicenseState(coordinates.y, coordinates.x, maturity, community, donations);
      if (licenseStatusRef.current) {
        const licenseBox = licenseStatusRef.current;
        licenseBox.className = `max-w-[500px] mx-auto flex flex-col items-center mt-4 p-3 text-center transition-all ${licenseState.className}`;

        const statusEl = licenseBox.querySelector('#licenseStatus');
        const examplesEl = licenseBox.querySelector('#licenseExamples');

        if (statusEl) statusEl.textContent = licenseState.status;
        if (examplesEl) examplesEl.textContent = licenseState.examples;
      }
    }, [coordinates, trajectory, showStalks, maturity, community, donations, cloud]);

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ minHeight: '500px' }}
          />
        </div>
        <div
          ref={licenseStatusRef}
          className="max-w-[500px] mx-auto mt-4 p-3 text-center transition-all"
        >
          <p id="licenseStatus" className="text-xl font-bold mb-1"></p>
          <p id="licenseExamples" className="text-sm mb-0 font-mono text-gray-300"></p>
        </div>
      </div>
    );
  }
);

Viewer.displayName = 'Viewer';

export default Viewer;