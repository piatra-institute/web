import Tooltip from '@/components/Tooltip';


interface RGProps { x: number; y: number; z: number };

/* three axes at -90°, 30°, 150° */
const angles = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6];

export default function RadarGlyph({ x, y, z }: RGProps) {
    /* normalise lengths against the largest axis */
    const max = Math.max(x, y, z, 1e-6);
    const radii = [x / max, y / max, z / max];

    /* convert to svg points */
    const pts = radii.map((r, i) => {
        const a = angles[i];
        return `${50 + 40 * r * Math.cos(a)},${50 + 40 * r * Math.sin(a)}`;
    }).join(' ');

    return (
        <div className="absolute bottom-4 left-20">
            <svg
                width={100} height={100}
                className="pointer-events-none"
            >
                {/* faint grid */}
                {[0.33, 0.66, 1].map((f, i) => (
                    <polygon key={i}
                        points={angles.map(a => `${50 + 40 * f * Math.cos(a)},${50 + 40 * f * Math.sin(a)}`).join(' ')}
                        fill="none" stroke="#555" strokeWidth={i === 2 ? 1.5 : 0.5} />
                ))}
                {/* variance polygon */}
                <polygon points={pts} fill="#4ade80aa" stroke="#4ade80" strokeWidth={1.5} />
            </svg>

            <Tooltip
                content={
                    <div
                        className="w-[300px] text-center"
                    >
                        fitness and residual variance after Hsp90 buffering - X (left), Y (right), Z (top)
                    </div>
                }
            >
                <span
                    className="text-gray-400 cursor-pointer absolute top-1 left-20"
                >
                    ?
                </span>
            </Tooltip>
        </div>
    );
}
