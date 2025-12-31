import {
    SimulationStats,
} from '../../lib/agent';



interface StatsDisplayProps {
    stats: SimulationStats | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    if (!stats || stats.count === 0) {
        return <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white/80">Loading stats...</div>;
    }

    const formatStat = (value: number, total: number) => total > 0 ? (value / total).toFixed(1) : '---';
    const formatPercent = (value: number, total: number) => total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '---%';

    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <h4 className="text-white/80 font-medium mb-2">Statistics</h4>
            
            <div className="space-y-3 text-sm">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-white/60">Avg Resources</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-white/80">
                        <div>Group A: <span className="text-lime-200">{formatStat(stats.groupARes, stats.groupACount)}</span> ({stats.groupACount})</div>
                        <div>Group B: <span className="text-lime-200">{formatStat(stats.groupBRes, stats.groupBCount)}</span> ({stats.groupBCount})</div>
                        <div>System I: <span className="text-lime-200">{formatStat(stats.sys1Res, stats.sys1Count)}</span> ({stats.sys1Count})</div>
                        <div>System II: <span className="text-lime-200">{formatStat(stats.sys2Res, stats.sys2Count)}</span> ({stats.sys2Count})</div>
                        <div className="col-span-2">Total: <span className="text-lime-200">{(stats.totalRes / stats.count).toFixed(1)}</span></div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-white/60">Avg States</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-white/80">
                        <div>Awareness: <span className="text-lime-200">{(stats.totalAwareness / stats.count).toFixed(2)}</span></div>
                        <div>Guilt: <span className="text-lime-200">{formatPercent(stats.totalGuilt, stats.count)}</span></div>
                        <div>Suffering: <span className="text-lime-200">{formatPercent(stats.totalSuffering, stats.count)}</span></div>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-white/60">Archetypes (Avg Res)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-white/80">
                        <div>Saint: <span className="text-lime-200">{formatStat(stats.saintRes, stats.saintCount)}</span> ({stats.saintCount})</div>
                        <div>Hero: <span className="text-lime-200">{formatStat(stats.heroRes, stats.heroCount)}</span> ({stats.heroCount})</div>
                        <div>Opportunist: <span className="text-lime-200">{formatStat(stats.oppRes, stats.oppCount)}</span> ({stats.oppCount})</div>
                        <div>Hypocrite: <span className="text-lime-200">{formatStat(stats.hypRes, stats.hypCount)}</span> ({stats.hypCount})</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;
