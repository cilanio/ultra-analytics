import { useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { useEffect } from 'react';
import TeamSelector       from './TeamSelector';
import PeriodPills        from './PeriodPills';
import ComparePanel       from './ComparePanel';
import TrendChart         from './TrendChart';
import SidePanel          from './SidePanel';
import MetricsList        from './MetricsList';
import EfficiencyContext  from './EfficiencyContext';
import MultiMetricContext from './MultiMetricContext';
import { METRICS, METRIC_COLORS } from '../constants/metrics';
import { useSingleChartData, useMultiChartData } from '../hooks/useChartData';
import { getVal } from '../utils/stats';

function MultiCanvas({ chartData, chartRef }) {
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

  return <canvas ref={canvasRef} />;
}

export default function SingleTab({
  teams, teamA, setTeamA, modeA, setModeA,
  activePeriod, setActivePeriod,
  activeMetric, setActiveMetric,
  multiMode, multiKeys, onMultiChange,
  games, stats, chartRef,
}) {
  const [lineVisibility, setLineVisibility] = useState([true, true, true, true, true, true]);
  const [showResult,     setShowResult]     = useState(false);

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
        teams={teams} team={teamA} mode={modeA}
        games={games} period={activePeriod}
        onTeamChange={setTeamA} onModeChange={setModeA}
      />

      <ComparePanel multiKeys={multiKeys} onMultiChange={onMultiChange} multiMode={multiMode} />

      <div className="main-grid">
        <div>
          <div style={{ marginBottom: '.75rem' }}>
            <PeriodPills activePeriod={activePeriod} onSetPeriod={setActivePeriod} />
          </div>

          {!multiMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
              <TrendChart
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
              <SidePanel onToggleLine={handleToggleLine} onToggleResult={setShowResult} />
            </div>
          )}

          {multiMode && multiData && (
            <div className="chart-panel">
              <div className="chart-header">
                <div className="chart-header-left">
                  <div className="chart-sup">Tendência por Partida</div>
                  <div className="chart-metric-name">Multi-Métrica</div>
                </div>
              </div>
              <div className="chart-wrap">
                <MultiCanvas chartData={multiData} chartRef={chartRef} />
              </div>
              <div className="chart-legend">
                {multiKeys.filter(Boolean).map((k, i) => (
                  <div key={k} className="leg-item">
                    <div className="leg-line" style={{ background: METRIC_COLORS[i] }} />
                    <span style={{ color: '#fff' }}>{METRICS[k]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {multiMode
            ? <MultiMetricContext metricKeys={multiKeys} games={games} mode={modeA} period={activePeriod} />
            : <EfficiencyContext  gamesA={games} modeA={modeA} period={activePeriod} teamA={teamA} />
          }
        </div>

        <MetricsList
          statsA={stats} statsB={null}
          activeMetric={activeMetric}
          onSelectMetric={handleSelectMetric}
        />
      </div>
    </div>
  );
}