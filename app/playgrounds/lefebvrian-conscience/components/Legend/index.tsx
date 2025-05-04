const Legend: React.FC = () => {
    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <strong className="text-white/90">Legend:</strong>
            <div className="mt-2 space-y-2">
                <div className="legend-item text-white/80"><span className="legend-symbol circle groupA"></span> Group A</div>
                <div className="legend-item text-white/80"><span className="legend-symbol circle groupB"></span> Group B</div>
                <div className="legend-item text-white/80"><span className="legend-symbol circle solid" style={{ backgroundColor: '#ccc' }}></span> Sys II</div>
                <div className="legend-item text-white/80"><span className="legend-symbol circle dashed" style={{ backgroundColor: '#ccc' }}></span> Sys I</div>
                <div className="legend-item text-white/80"><span className="legend-symbol circle" style={{ backgroundColor: '#ccc' }}><span className="inner-dot"></span></span> High SE</div>
                <div className="legend-item text-white/80"><span className="legend-symbol circle awareness-glow" style={{ backgroundColor: '#ccc' }}></span> Aware Act</div>
            </div>
        </div>
    );
};

export default Legend;
