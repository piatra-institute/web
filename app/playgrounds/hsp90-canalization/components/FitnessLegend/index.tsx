const PAD = 6;
const BAR_H = 150;
const SVG_H = BAR_H + PAD * 2;

export default function FitnessLegend() {
    const ticks = [1, 0.75, 0.5, 0.25, 0];

    return (
        <div className="flex flex-col items-center text-white pointer-events-none select-none overflow-visible">
            <svg width={70} height={SVG_H}>
                <defs>
                    <linearGradient id="fitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#52ce0f" />   {/* fitness 1 (top) */}
                        <stop offset="100%" stopColor="#15310b" />   {/* fitness 0 (bottom) */}
                    </linearGradient>
                </defs>

                {/* gradient bar */}
                <rect
                    x={10}
                    y={PAD}
                    width={22}
                    height={BAR_H}
                    fill="url(#fitGrad)"
                    stroke="#888"
                    strokeWidth={0.4}
                />

                {/* ticks and labels */}
                {ticks.map((t, i) => {
                    const y = PAD + BAR_H * (1 - t);
                    return (
                        <g key={i}>
                            <line x1={32} x2={36} y1={y} y2={y} stroke="#ddd" strokeWidth={0.5} />
                            <text x={38} y={y + 3} fill="#ddd" fontSize="10px">
                                {t}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
