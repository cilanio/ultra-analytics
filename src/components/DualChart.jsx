import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { METRICS } from '../constants/metrics';
import { resultByPeriod } from '../utils/stats';
import { totalLabel } from '../hooks/useChartData';

export default function DualChart({
  chartData, metricKey, teamH, teamA,
  chartRef: externalRef,
  gamesH, gamesAw, period, showResult,
}) {
  const canvasRef   = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (externalRef) externalRef.current = canvasRef.current;
  });

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();

    const { rawH, rawA, isAllMetric } = chartData;

    instanceRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels: chartData.labels, datasets: chartData.datasets },
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
              title: (items) => {
                const i = items[0].dataIndex;
                const r = rawH[i]?.round || rawA[i]?.round;
                return r ? `Rodada ${r}` : `Partida #${i + 1}`;
              },
              label: (item) => {
                if (item.datasetIndex >= 2) return null;
                const i = item.dataIndex;
                const val = item.raw ?? '–';
                if (isAllMetric) {
                  // Show "Total Jogo/HT/2T: X" for both lines
                  return `  ${totalLabel(period)}: ${val}`;
                }
                const name = item.datasetIndex === 0 ? teamH : teamA;
                return `  ${name}: ${val}`;
              },
            },
            filter: (item) => item.datasetIndex < 2,
          },
        },
        scales: {
          y: { min: 0, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 10 }, padding: 6 }, border: { dash: [4,6], color: 'transparent' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 9 }, maxRotation: 40, maxTicksLimit: 14 }, border: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });
    return () => { instanceRef.current?.destroy(); instanceRef.current = null; };
  }, [chartData, teamH, teamA, period]);

  // Apply result coloring to both lines
  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart) return;

    const applyColor = (ds, games, mode) => {
      if (showResult && games?.length) {
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
        ds.pointBackgroundColor = ds._origColor || ds.borderColor;
        ds.pointBorderColor     = '#060a10';
        ds.pointRadius          = 4;
        ds.pointHoverRadius     = 7;
      }
    };

    const ds0 = chart.data.datasets[0];
    const ds1 = chart.data.datasets[1];
    if (ds0 && !ds0._origColor) ds0._origColor = '#63b3ed';
    if (ds1 && !ds1._origColor) ds1._origColor = '#ffffff';
    if (ds0) applyColor(ds0, gamesH,  'home');
    if (ds1) applyColor(ds1, gamesAw, 'away');
    chart.update('none');
  }, [showResult, gamesH, gamesAw, period]);

  if (!chartData) return null;

  const { sH, sA, isAllMetric } = chartData;
  const metricLabel = METRICS[metricKey] || '';
  // For _All metrics omit team names from chart title
  const chartTitle = isAllMetric
    ? metricLabel
    : `${metricLabel} · ${teamH} vs ${teamA}`;

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div className="chart-header-left">
          <div className="chart-sup">Comparativo · Tendência por Partida</div>
          <div className="chart-metric-name">{chartTitle}</div>
        </div>
        <div className="chart-header-right">
          <div className="chart-stats">
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: 'var(--a)' }}>{sH.avg}</div>
              <div className="l">{isAllMetric ? 'Méd. Mand.' : teamH}</div>
            </div>
            <div className="cdiv" />
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: '#fff' }}>{sA.avg}</div>
              <div className="l">{isAllMetric ? 'Méd. Visit.' : teamA}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-wrap"><canvas ref={canvasRef} /></div>

      <div className="chart-legend">
        <div className="leg-item">
          <div className="leg-line" style={{ background: '#63b3ed' }} />
          <span style={{ color: '#fff' }}>{isAllMetric ? `${totalLabel(period)} (Mand.)` : teamH}</span>
        </div>
        <div className="leg-item">
          <div className="leg-line" style={{ background: '#fff' }} />
          <span style={{ color: '#fff' }}>{isAllMetric ? `${totalLabel(period)} (Visit.)` : teamA}</span>
        </div>
        <div className="leg-item">
          <div className="leg-line" style={{ background: 'repeating-linear-gradient(90deg,rgba(99,179,237,.4) 0,rgba(99,179,237,.4) 3px,transparent 3px,transparent 7px)' }} />
          <span>Média {teamH}</span>
        </div>
        <div className="leg-item">
          <div className="leg-line" style={{ background: 'repeating-linear-gradient(90deg,#ffffff 0,#ffffff 3px,transparent 3px,transparent 7px)' }} />
          <span>Média {teamA}</span>
        </div>
      </div>
    </div>
  );
}