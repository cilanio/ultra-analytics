import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { METRICS } from '../constants/metrics';
import { resultByPeriod } from '../utils/stats';

const CHART_OPTIONS = (raw, teamName) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d1420', titleColor: '#e2e8f0', bodyColor: '#cbd5e0',
      borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 12,
      titleFont: { family: 'Syne', size: 11, weight: '700' },
      bodyFont:  { family: 'DM Sans', size: 12 },
      callbacks: {
        title: (items) => `vs ${raw[items[0].dataIndex]?.vs ?? ''}`,
        label: (item) => {
          const d = raw[item.dataIndex];
          if (item.datasetIndex === 0) return `  ${teamName}: ${d.val} / Total: ${d.total}`;
          if (item.datasetIndex === 1) return `  Média móvel: ${item.raw}`;
          if (item.datasetIndex === 3) return `  Máx série: ${item.raw}`;
          if (item.datasetIndex === 4) return `  Mín série: ${item.raw}`;
          if (item.datasetIndex === 5) return `  Total jogo: ${d.total}`;
          return null;
        },
      },
      filter: (item) => item.datasetIndex !== 2,
    },
  },
  scales: {
    y: { min: 0, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 10 }, padding: 6 }, border: { dash: [4,6], color: 'transparent' } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 9 }, maxRotation: 40, maxTicksLimit: 14 }, border: { color: 'rgba(255,255,255,0.05)' } },
  },
});

export default function TrendChart({
  chartData, teamName, metricKey,
  games, mode, period,
  lineVisibility, showResult,
  chartRef: externalRef,
}) {
  const canvasRef   = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (externalRef) externalRef.current = canvasRef.current;
  });

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();
    instanceRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels: chartData.raw.map((d) => d.vs || '?'), datasets: chartData.datasets },
      options: CHART_OPTIONS(chartData.raw, teamName),
    });
    return () => { instanceRef.current?.destroy(); instanceRef.current = null; };
  }, [chartData, teamName]);

  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart || !lineVisibility) return;
    lineVisibility.forEach((visible, i) => {
      if (chart.data.datasets[i]) chart.data.datasets[i].hidden = !visible;
    });
    chart.update('none');
  }, [lineVisibility]);

  useEffect(() => {
    const chart = instanceRef.current;
    if (!chart) return;
    const ds0 = chart.data.datasets[0];
    if (!ds0) return;
    if (showResult && games?.length) {
      ds0.pointBackgroundColor = games.map((g) => {
        const r = resultByPeriod(g, mode, period);
        return r === 'W' ? '#00e676' : r === 'D' ? '#cfd8dc' : '#fc8181';
      });
      ds0.pointBorderColor = games.map((g) => {
        const r = resultByPeriod(g, mode, period);
        return r === 'W' ? '#00c853' : r === 'D' ? '#78909c' : '#c62828';
      });
      ds0.pointRadius      = 6;
      ds0.pointHoverRadius = 8;
    } else {
      ds0.pointBackgroundColor = chartData?.tc?.pt || '#63b3ed';
      ds0.pointBorderColor     = '#060a10';
      ds0.pointRadius          = 5;
      ds0.pointHoverRadius     = 7;
    }
    chart.update('none');
  }, [showResult, games, mode, period, chartData]);

  if (!chartData) return null;
  const { stat, tc } = chartData;
  const label = METRICS[metricKey] || '';

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div className="chart-header-left">
          <div className="chart-sup">Tendência por Partida</div>
          <div className="chart-metric-name">{label}</div>
        </div>
        <div className="chart-header-right">
          <div className="chart-stats">
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: 'var(--a)' }}>{stat.avg}</div>
              <div className="l">Média</div>
            </div>
            <div className="cdiv" />
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: '#FF3877' }}>{stat.max}</div>
              <div className="l">Máx</div>
            </div>
            <div className="cdiv" />
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: '#ffff00' }}>{stat.min}</div>
              <div className="l">Mín</div>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-wrap"><canvas ref={canvasRef} /></div>
      <div className="chart-legend">
        <div className="leg-item"><div className="leg-line" style={{ background: tc?.pt }} /><span>Realizado</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: '#f6ad55' }} /><span>Média móvel (3j)</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: '#FF3877' }} /><span>Máximo</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: '#ffff00' }} /><span>Mínimo</span></div>
        <div className="leg-item">
          <div className="leg-line" style={{ background: 'repeating-linear-gradient(90deg,rgba(163,230,53,.7) 0,rgba(163,230,53,.7) 4px,transparent 4px,transparent 8px)' }} />
          <span>Total jogo</span>
        </div>
      </div>
    </div>
  );
}