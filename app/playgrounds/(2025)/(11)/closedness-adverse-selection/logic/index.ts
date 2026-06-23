// The model lives in constants.ts (it predates the standard layout). This module
// re-exports the model functions so the calibration and any consumer have a clean
// logic surface to import from. The economic model: closedness k raises private
// rents B(k) = beta0 + gamma*k and a moral-cost amplifier g(k) = k^alpha, so the
// entry cutoff m* = (B - h) / g sets how morally averse an entrant can be and
// still find entry worthwhile. As k rises, m* falls and only corruption-tolerant
// types enter, the adverse selection.

export {
    B_of_k,
    g_of_k,
    h_of_k,
    cutoffMStar,
    cutoffWithSignal,
    getEffectiveCutoff,
    summarizeEntrants,
    betaPdf,
    generatePlotData,
    type EntrantStats,
    type PlotPoint,
} from '../constants';
