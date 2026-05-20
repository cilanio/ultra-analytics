import { useRef, useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import TeamSelector       from './TeamSelector';
import PeriodPills        from './PeriodPills';
import ComparePanel       from './ComparePanel';
import TrendChart         from './TrendChart';
import SidePanel          from './SidePanel';
import MetricsList        from './MetricsList';
import MultiMetricContext from './MultiMetricContext';
import { METRICS, METRIC_COLORS, FT_ONLY_METRICS } from '../constants/metrics';
import { useSingleChartData, useMultiChartData } from '../hooks/useChartData';
import { getResultCounts, goalsByPeriod, goalsConcededByPeriod, resultByPeriod } from '../utils/stats';
import { avg } from '../utils/stats';

// Collapsible efficiency summary shown ABOVE the chart
function EfficiencySummary({ games, mode, period, teamName }) {
  if (!games.length) return null;

  const counts    = getResultCounts(games, mode, period);
  const total     = counts.total;
  const wPct      = total ? (counts.w / total) * 100 : 0;
  const dPct      = total ? (counts.d / total) * 100 : 0;
  const lPct      = total ? (counts.l / total) * 100 : 0;
  const avgGf     = parseFloat(avg(games.map((g) => goalsByPeriod(g, mode, period))).toFixed(2));
  const avgGc     = parseFloat(avg(games.map((g) => goalsConcededByPeriod(g, mode, period))).toFixed(2));
  const modeLabel = mode === 'home' ? 'Mandante' : mode === 'away' ? 'Visitante' : 'Todos';

  const Bar = ({ pct, color }) => (
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', marginTop: '.35rem', overflow: 'hidden' }}>
      <div style={{ width: `${pct.toFixed(1)}%`, height: '100%', background: color, borderRadius: '99px' }} />
    </div>
  );

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '9px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: '.875rem' }}>
        Eficiência de Resultado · {teamName} ({modeLabel})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        {/* Left: V/E/D */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '.75rem', padding: '.75rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Vitórias</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 700, color: 'var(--good)' }}>
              {counts.w} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({wPct.toFixed(0)}%)</span>
            </span>
          </div>
          <Bar pct={wPct} color="var(--good)" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem', marginTop: '.35rem' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Empates</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 700, color: 'var(--warn)' }}>
              {counts.d} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({dPct.toFixed(0)}%)</span>
            </span>
          </div>
          <Bar pct={dPct} color="var(--warn)" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.25rem', marginTop: '.35rem' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Derrotas</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 700, color: 'var(--bad)' }}>
              {counts.l} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({lPct.toFixed(0)}%)</span>
            </span>
          </div>
          <Bar pct={lPct} color="var(--bad)" />
        </div>

        {/* Right: goals */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '.75rem', padding: '.75rem 1rem' }}>
          <div style={{ height: '1px', background: 'var(--border)', margin: '.55rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Média Gols Pró</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 700, color: 'var(--good)' }}>{avgGf}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.25rem' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>Média Gols Sof</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 700, color: 'var(--bad)' }}>{avgGc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// Multi-metric chart canvas with result coloring support
function MultiCanvas({ chartData, chartRef, games, mode, period, showResult }) {
  const canvasRef   = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (chartRef) chartRef.current = canvasRef.current;
  });

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();
    instanceRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: chartData.raw.map((d) => d.vs || '?'),
        datasets: chartData.datasets,
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d1420', titleColor: '#e2e8f0', bodyColor: '#cbd5e0',
            borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 12,
            titleFont: { family: 'Syne', size: 11, weight: '700' },
            bodyFont:  { family: 'DM Sans', size: 12 },
            callbacks: {
              title: (items) => `vs ${chartData.raw[items[0].dataIndex]?.vs ?? ''}`,
              label: (item) => `  ${item.dataset.label}: ${item.raw}`,
            },
          },
        },
        scales: {
          y: { min: 0, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 10 }, padding: 6 }, border: { dash: [4,6], color: 'transparent' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 9 }, maxRotation: 40, maxTicksLimit: 14 }, border: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });
    return () => { instanceRef.current?.destroy(); instanceRef.current = null; };
  }, [chartData]);

  // Apply result coloring to ALL datasets in multi mode
  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart || !games?.length) return;
    chart.data.datasets.forEach((ds) => {
      if (showResult) {
        ds.pointBackgroundColor = games.map((g) => {
          const r = resultByPeriod(g, mode, period);
          return r === 'W' ? '#00e676' : r === 'D' ? '#cfd8dc' : '#fc8181';
        });
        ds.pointBorderColor = games.map((g) => {
          const r = resultByPeriod(g, mode, period);
          return r === 'W' ? '#00c853' : r === 'D' ? '#78909c' : '#c62828';
        });
        ds.pointRadius      = 6;
        ds.pointHoverRadius = 8;
      } else {
        ds.pointBackgroundColor = ds.borderColor;
        ds.pointBorderColor     = '#060a10';
        ds.pointRadius          = 4;
        ds.pointHoverRadius     = 6;
      }
    });
    chart.update('none');
  }, [showResult, games, mode, period]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div className="chart-header-left">
          <div className="chart-sup">Tendência por Partida</div>
          <div className="chart-metric-name">Multi-Métrica</div>
        </div>
      </div>
      <div className="chart-wrap"><canvas ref={canvasRef} /></div>
      <div className="chart-legend">
        {chartData.datasets.map((ds, i) => (
          <div key={i} className="leg-item">
            <div className="leg-line" style={{ background: METRIC_COLORS[i] }} />
            <span style={{ color: '#fff' }}>{ds.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SingleTab({
  teams, teamA, setTeamA, modeA, setModeA,
  activePeriod, setActivePeriod,
  activeMetric, setActiveMetric,
  multiMode, multiKeys, onMultiChange,
  games, stats,
  chartRef,
}) {
  const [lineVisibility, setLineVisibility] = useState([true, true, true, true, true, true]);
  const [showResult,     setShowResult]     = useState(false);

  // Check if active metric is FT-only
  const isFtOnly = FT_ONLY_METRICS.has(activeMetric) ||
    (multiMode && multiKeys.filter(Boolean).some((k) => FT_ONLY_METRICS.has(k)));

  const singleData = useSingleChartData(games, modeA, activePeriod, activeMetric);
  const multiData  = useMultiChartData(games, modeA, activePeriod, multiKeys);

  const handleToggleLine = (idx, visible) => {
    setLineVisibility((prev) => prev.map((v, i) => (i === idx ? visible : v)));
  };

  const handleSelectMetric = (key) => {
    setLineVisibility([true, true, true, true, true, true]);
    setShowResult(false);
    setActiveMetric(key);
  };

  return (
    <div>
      <TeamSelector
        teams={teams}
        team={teamA}
        mode={modeA}
        games={games}
        period={activePeriod}
        onTeamChange={setTeamA}
        onModeChange={setModeA}
      />

      {/* EFFICIENCY SUMMARY — collapsible, above chart */}
      <EfficiencySummary
        games={games}
        mode={modeA}
        period={activePeriod}
        teamName={teamA}
      />

      <ComparePanel
        multiKeys={multiKeys}
        onMultiChange={onMultiChange}
        multiMode={multiMode}
      />

      <div className="main-grid">
        <div>
          {/* PERIOD PILLS — with FT-only locking */}
          <div style={{ marginBottom: '.75rem' }}>
            <PeriodPills
              activePeriod={activePeriod}
              onSetPeriod={setActivePeriod}
              disableSubPeriods={isFtOnly}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
            <div>
              {multiMode && multiData
                ? <MultiCanvas
                    chartData={multiData}
                    chartRef={chartRef}
                    games={games}
                    mode={modeA}
                    period={activePeriod}
                    showResult={showResult}
                  />
                : <TrendChart
                    chartData={singleData}
                    teamName={teamA}
                    metricKey={activeMetric}
                    games={games}
                    mode={modeA}
                    period={activePeriod}
                    lineVisibility={lineVisibility}
                    showResult={showResult}
                    chartRef={chartRef}
                  />
              }
            </div>

            {/* Side panel always visible — line toggles only in single mode */}
            <SidePanel
              showLineToggles={!multiMode}
              onToggleLine={handleToggleLine}
              onToggleResult={setShowResult}
            />
          </div>

          {multiMode && (
            <MultiMetricContext
              metricKeys={multiKeys}
              games={games}
              mode={modeA}
              period={activePeriod}
            />
          )}
        </div>

        <MetricsList
          statsA={stats}
          statsB={null}
          activeMetric={activeMetric}
          onSelectMetric={handleSelectMetric}
        />
      </div>
    </div>
  );
}