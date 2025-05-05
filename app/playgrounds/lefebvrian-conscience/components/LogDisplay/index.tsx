import {
    LogEntryData,
} from '../../lib/agent';



interface LogDisplayProps {
    logEntries: LogEntryData[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ logEntries }) => {
    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <h4 className="text-white/80 font-medium mb-2">Interaction Log</h4>
            <div className="h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {logEntries.length === 0 ? (
                    <div className="text-white/60 text-sm italic">No interactions yet. Start the simulation to see agent behavior.</div>
                ) : (
                    logEntries.map(entry => (
                        <div
                            key={entry.id}
                            className="log-entry text-sm text-white/70 border-b border-white/10 py-2 last:border-b-0"
                            dangerouslySetInnerHTML={{ __html: entry.message }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default LogDisplay;
