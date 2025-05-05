const Legend: React.FC = () => {
    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <h4 className="text-white/80 font-medium mb-2">Legend</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle groupA inline-block w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: '#3498db' }}></span>
                    Group A
                </div>
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle groupB inline-block w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: '#e67e22' }}></span>
                    Group B
                </div>
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle solid inline-block w-4 h-4 mr-2 rounded-full border border-[#333]" style={{ backgroundColor: '#ccc' }}></span>
                    System II
                </div>
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle dashed inline-block w-4 h-4 mr-2 rounded-full border border-dashed border-[#333]" style={{ backgroundColor: '#ccc' }}></span>
                    System I
                </div>
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle inline-block w-4 h-4 mr-2 rounded-full relative" style={{ backgroundColor: '#ccc' }}>
                        <span className="inner-dot absolute w-1.5 h-1.5 bg-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </span>
                    High Self-Eval
                </div>
                <div className="legend-item text-white/80 flex items-center">
                    <span className="legend-symbol circle awareness-glow inline-block w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: '#ccc', boxShadow: '0 0 6px 2px gold' }}></span>
                    Awareness Act
                </div>
            </div>
        </div>
    );
};

export default Legend;
