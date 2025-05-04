import {
    SimulationStats,
} from '../../lib/agent';



interface StatsDisplayProps {
    stats: SimulationStats | null;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    if (!stats || stats.count === 0) {
        return <div className="stats">Loading stats...</div>;
    }

    const formatStat = (value: number, total: number) => total > 0 ? (value / total).toFixed(1) : '---';
    const formatPercent = (value: number, total: number) => total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '---%';

    return (
        <div className="stats">
            <div className="stats-row">
                <strong>Avg Resources:</strong>
                <div>Group A: {formatStat(stats.groupARes, stats.groupACount)} ({stats.groupACount})</div>
                <div>Group B: {formatStat(stats.groupBRes, stats.groupBCount)} ({stats.groupBCount})</div>
                <div>System I: {formatStat(stats.sys1Res, stats.sys1Count)} ({stats.sys1Count})</div>
                <div>System II: {formatStat(stats.sys2Res, stats.sys2Count)} ({stats.sys2Count})</div>
                <div>Total: {(stats.totalRes / stats.count).toFixed(1)}</div>
            </div>
             <div className="stats-row">
                <strong>Avg States:</strong>
                <div>Awareness: {(stats.totalAwareness / stats.count).toFixed(2)}</div>
                 <div className="stats-feelings">Guilt: {formatPercent(stats.totalGuilt, stats.count)}</div>
                 <div className="stats-feelings">Suffering: {formatPercent(stats.totalSuffering, stats.count)}</div>
             </div>
            <div className="stats-row">
                <strong>Archetypes (Avg Res):</strong>
                 <span>Saint: {formatStat(stats.saintRes, stats.saintCount)} ({stats.saintCount})</span> |
                 <span>Hero: {formatStat(stats.heroRes, stats.heroCount)} ({stats.heroCount})</span> |
                 <span>Opportunist: {formatStat(stats.oppRes, stats.oppCount)} ({stats.oppCount})</span> |
                 <span>Hypocrite: {formatStat(stats.hypRes, stats.hypCount)} ({stats.hypCount})</span>
            </div>
        </div>
    );
};

export default StatsDisplay;
