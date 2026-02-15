'use client';

import { useState, useMemo, useCallback } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    type Property,
    type Unit,
    type FamilyId,
    type XAxis,
    type ViewMode,
    DEFAULT_PROPERTY,
    DEFAULT_UNIT,
    DEFAULT_XAXIS,
    DEFAULT_AMBIENT_C,
    DEFAULT_FAMILIES,
    DEFAULT_VIEW_MODE,
    DEFAULT_PINNED,
    computeAnomalies,
} from './logic';

export default function HydrideAnomalyPlayground() {
    const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);
    const [property, setProperty] = useState<Property>(DEFAULT_PROPERTY);
    const [unit, setUnit] = useState<Unit>(DEFAULT_UNIT);
    const [xAxis, setXAxis] = useState<XAxis>(DEFAULT_XAXIS);
    const [enabledFamilies, setEnabledFamilies] = useState<Set<FamilyId>>(
        () => new Set(DEFAULT_FAMILIES),
    );
    const [ambientC, setAmbientC] = useState(DEFAULT_AMBIENT_C);
    const [showTrendLines, setShowTrendLines] = useState(true);
    const [pinnedSubstances, setPinnedSubstances] = useState<Set<string>>(
        () => new Set(DEFAULT_PINNED),
    );

    const anomalies = useMemo(
        () => computeAnomalies(property, unit, enabledFamilies),
        [property, unit, enabledFamilies],
    );

    const handleToggleFamily = useCallback((id: FamilyId) => {
        setEnabledFamilies((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleSetFamilies = useCallback((ids: FamilyId[]) => {
        setEnabledFamilies(new Set(ids));
    }, []);

    const handleTogglePin = useCallback((id: string) => {
        setPinnedSubstances((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleClearPins = useCallback(() => {
        setPinnedSubstances(new Set());
    }, []);

    const handleReset = useCallback(() => {
        setViewMode(DEFAULT_VIEW_MODE);
        setProperty(DEFAULT_PROPERTY);
        setUnit(DEFAULT_UNIT);
        setXAxis(DEFAULT_XAXIS);
        setEnabledFamilies(new Set(DEFAULT_FAMILIES));
        setAmbientC(DEFAULT_AMBIENT_C);
        setShowTrendLines(true);
        setPinnedSubstances(new Set(DEFAULT_PINNED));
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Why does water boil at 100°C when its heavier cousins barely reach 0°C?
                    </p>
                    <p className="text-gray-400">
                        Compare hydride families across the periodic table,
                        measure the anomalous gap that hydrogen bonding opens
                        in period-2 compounds, and pin substances for side-by-side comparison.
                    </p>
                </div>
            ),
        },
        {
            id: 'explorer',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        property={property}
                        unit={unit}
                        xAxis={xAxis}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        enabledFamilies={enabledFamilies}
                        anomalies={anomalies}
                        ambientC={ambientC}
                        showTrendLines={showTrendLines}
                        pinnedSubstances={pinnedSubstances}
                        onTogglePin={handleTogglePin}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        Within each hydride family the heavier members follow a predictable
                        trend: as you go down the periodic table, molar mass rises and so
                        does the boiling point, melting point, and latent heat. A least-squares
                        line through periods 3-5 extends smoothly to period 2 for most
                        properties.
                    </p>

                    <div className="border-l-2 border-lime-500/40 pl-4 my-4">
                        <p className="text-lime-200/80 mb-2">
                            The anomaly residual is computed as:
                        </p>
                        <Equation
                            mode="block"
                            math="\Delta = y_{\text{obs}} - \hat{y}_{\text{trend}}"
                        />
                        <p className="text-lime-200/60 text-sm mt-2">
                            where the trend is a linear fit through periods 3, 4, and 5.
                        </p>
                    </div>

                    <p>
                        Water, hydrogen fluoride, and ammonia all break this
                        extrapolation. Their boiling points, melting points, and enthalpies
                        of vaporization lie far above the predicted value. The common explanation
                        is hydrogen bonding: the anomalously high electronegativity of
                        O, F, and N creates strong intermolecular attractions that
                        require more energy to overcome.
                    </p>

                    <div className="border-l-2 border-lime-500/40 pl-4 my-4">
                        <p className="text-lime-200/80 mb-2">
                            London dispersion forces scale roughly with molar mass:
                        </p>
                        <Equation
                            mode="block"
                            math="F_{\text{dispersion}} \propto \alpha^2 \propto M"
                        />
                        <p className="text-lime-200/60 text-sm mt-2">
                            but hydrogen bonds add a term that dominates in small, electronegative hydrides.
                        </p>
                    </div>

                    <p>
                        The scatter view plots melting point against boiling point for all
                        enabled substances. A reference line fits boiling point against
                        ln(molar mass) on non-H-bonding substances — water and HF jump
                        well above it. Enable the alkane and diatomic families for a
                        pure-dispersion baseline.
                    </p>

                    <p>
                        The phase lens shows a complementary view: at room temperature
                        water is a liquid while every other hydride in groups 14-17 is
                        a gas. Slide the temperature to watch phase boundaries shift
                        and pin substances to keep them in a comparison table across
                        all views.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            property={property}
            onPropertyChange={setProperty}
            xAxis={xAxis}
            onXAxisChange={setXAxis}
            unit={unit}
            onUnitChange={setUnit}
            enabledFamilies={enabledFamilies}
            onToggleFamily={handleToggleFamily}
            onSetFamilies={handleSetFamilies}
            ambientC={ambientC}
            onAmbientCChange={setAmbientC}
            showTrendLines={showTrendLines}
            onShowTrendLinesChange={() => setShowTrendLines((p) => !p)}
            pinnedCount={pinnedSubstances.size}
            onClearPins={handleClearPins}
            onReset={handleReset}
        />
    );

    return (
        <PlaygroundLayout
            title="Hydride Anomaly"
            subtitle="Hydrogen bonding and the anomalous thermodynamics of water"
            sections={sections}
            settings={settings}
        />
    );
}
