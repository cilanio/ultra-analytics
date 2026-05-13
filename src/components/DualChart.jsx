import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { METRICS } from '../constants/metrics';

export default function DualChart({ chartData, metricKey, teamH, teamA, chartRef: externalRef }) {
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
              title: (items) => `Partida #${items[0].dataIndex + 1}`,
              label: (item) => item.datasetIndex < 2 ? `  ${item.dataset.label}: ${item.raw ?? '–'}` : null,
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
  }, [chartData]);

  if (!chartData) return null;
  const { sH, sA } = chartData;
  const label = METRICS[metricKey] || '';

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <div className="chart-header-left">
          <div className="chart-sup">Comparativo · Tendência por Partida</div>
          <div className="chart-metric-name">{label}</div>
        </div>
        <div className="chart-header-right">
          <div className="chart-stats">
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: 'var(--a)' }}>{sH.avg}</div>
              <div className="l">{teamH}</div>
            </div>
            <div className="cdiv" />
            <div className="cstat">
              <div className="v" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 700, color: 'var(--b)' }}>{sA.avg}</div>
              <div className="l">{teamA}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-wrap"><canvas ref={canvasRef} /></div>
      <div className="chart-legend">
        <div className="leg-item"><div className="leg-line" style={{ background: '#63b3ed' }} /><span style={{ color: '#fff' }}>{teamH}</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: '#fff' }} /><span style={{ color: '#fff' }}>{teamA}</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: 'repeating-linear-gradient(90deg,rgba(99,179,237,.3) 0,rgba(99,179,237,.3) 3px,transparent 3px,transparent 7px)' }} /><span>Média {teamH}</span></div>
        <div className="leg-item"><div className="leg-line" style={{ background: 'repeating-linear-gradient(90deg,rgba(255,255,255,.25) 0,rgba(255,255,255,.25) 3px,transparent 3px,transparent 7px)' }} /><span>Média {teamA}</span></div>
      </div>
    </div>
  );
}