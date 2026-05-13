import { useCallback } from 'react';
import { METRICS } from '../constants/metrics';
import { getVal, goalsByPeriod, goalsConcededByPeriod, resultByPeriod } from '../utils/stats';

export function useExport(chartRef, games, mode, period, metricKey, teamName) {
  const exportPNG = useCallback(() => {
    const canvas = chartRef?.current;
    if (!canvas) return;
    const tmp = document.createElement('canvas');
    tmp.width  = canvas.width;
    tmp.height = canvas.height;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#0d1420';
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(canvas, 0, 0);
    const a = document.createElement('a');
    a.download = `ultra-${metricKey}-${Date.now()}.png`;
    a.href = tmp.toDataURL('image/png');
    a.click();
  }, [chartRef, metricKey]);

  const exportCSV = useCallback(() => {
    if (!games?.length) return;
    const label = METRICS[metricKey] || metricKey;
    const rows  = [['Data', 'Adversário', 'Resultado', 'Gols Pró', 'Gols Sof', label]];
    games.forEach((g) => {
      const opp = mode === 'home' ? g.Away : g.Home;
      const res = resultByPeriod(g, mode, period);
      const val = getVal(g, metricKey, mode, period);
      const gf  = goalsByPeriod(g, mode, period);
      const gc  = goalsConcededByPeriod(g, mode, period);
      rows.push([g.Date || '', opp || '', res, gf, gc, val]);
    });
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const a = document.createElement('a');
    a.download = `ultra-${teamName}-${metricKey}-${Date.now()}.csv`;
    a.href = URL.createObjectURL(blob);
    a.click();
  }, [games, mode, period, metricKey, teamName]);

  return { exportPNG, exportCSV };
}