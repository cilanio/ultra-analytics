import { useMemo } from 'react';
import { METRICS, METRIC_COLORS } from '../constants/metrics';
import { getVal, avg, buildStats, eMode } from '../utils/stats';

const hexToRgba = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export function useSingleChartData(games, mode, period, metricKey) {
  return useMemo(() => {
    if (!games.length) return null;
    const stats = buildStats(games, mode, period);
    const stat  = stats.find((s) => s.key === metricKey);
    if (!stat) return null;

    const isAway = mode === 'away';
    const tc = isAway
      ? { line: 'rgba(255,255,255,.85)', f0: 'rgba(255,255,255,.09)', f1: 'rgba(255,255,255,0)', pt: '#ffffff', avgL: 'rgba(255,255,255,.2)' }
      : { line: 'rgba(99,179,237,.9)',   f0: 'rgba(99,179,237,.14)',  f1: 'rgba(99,179,237,0)',  pt: '#63b3ed', avgL: 'rgba(99,179,237,.25)' };

    const raw = games.map((g) => {
      const m      = eMode(g, mode);
      const isH    = m === 'home';
      const val    = getVal(g, metricKey, mode, period);
      const oppVal = getVal(g, metricKey, isH ? 'away' : 'home', period);
      return {
        val,
        vs:    mode === 'all' ? `${isH ? '⌂' : '✈'} ${isH ? g.Away : g.Home}` : (isH ? g.Away : g.Home),
        total: val + oppVal,
      };
    });

    const vals   = raw.map((d) => d.val);
    const totals = raw.map((d) => d.total);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const mav    = vals.map((_, i) =>
      parseFloat((avg(vals.slice(Math.max(0, i - 2), i + 1))).toFixed(2))
    );

    const makeGradient = (ctx2) => {
      const { ctx: cv, chartArea: ca } = ctx2.chart;
      if (!ca) return 'transparent';
      const grad = cv.createLinearGradient(0, ca.top, 0, ca.bottom);
      grad.addColorStop(0, tc.f0);
      grad.addColorStop(1, tc.f1);
      return grad;
    };

    const datasets = [
      { label: METRICS[metricKey], data: vals, borderColor: tc.line, backgroundColor: makeGradient,
        borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: tc.pt, pointBorderColor: '#060a10', pointBorderWidth: 2,
        fill: true, tension: 0.35, order: 1 },
      { label: 'Média móvel (3j)', data: mav, borderColor: '#f6ad55', borderDash: [6, 4],
        borderWidth: 2, pointRadius: 0, fill: false, tension: 0.35, order: 2 },
      { label: 'Média geral', data: new Array(vals.length).fill(stat.avg),
        borderColor: tc.avgL, borderDash: [3, 6], borderWidth: 1.2, pointRadius: 0, fill: false, order: 3 },
      { label: 'Máximo', data: new Array(vals.length).fill(maxVal),
        borderColor: '#FF3877', borderDash: [], borderWidth: 1.2, pointRadius: 0, fill: false, order: 4 },
      { label: 'Mínimo', data: new Array(vals.length).fill(minVal),
        borderColor: '#ffff00', borderDash: [], borderWidth: 1.2, pointRadius: 0, fill: false, order: 5 },
      { label: 'Total Jogo', data: totals, borderColor: 'rgba(163,230,53,.7)', borderDash: [4, 4],
        borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3, order: 6 },
    ];

    return { datasets, raw, stat, tc };
  }, [games, mode, period, metricKey]);
}

export function useMultiChartData(games, mode, period, metricKeys) {
  return useMemo(() => {
    if (!games.length || !metricKeys.some(Boolean)) return null;
    const raw = games.map((g) => ({ vs: mode === 'home' ? g.Away : g.Home }));
    const datasets = metricKeys.filter(Boolean).map((key, i) => {
      const vals  = games.map((g) => getVal(g, key, mode, period));
      const color = METRIC_COLORS[i] || '#fff';
      return {
        label: METRICS[key], data: vals, borderColor: color,
        backgroundColor: (ctx2) => {
          const { ctx: cv, chartArea: ca } = ctx2.chart;
          if (!ca) return 'transparent';
          const grad = cv.createLinearGradient(0, ca.top, 0, ca.bottom);
          grad.addColorStop(0, hexToRgba(color, 0.12));
          grad.addColorStop(1, hexToRgba(color, 0));
          return grad;
        },
        borderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
        pointBackgroundColor: color, pointBorderColor: '#060a10', pointBorderWidth: 2,
        fill: true, tension: 0.35, order: i + 1,
      };
    });
    return { datasets, raw };
  }, [games, mode, period, metricKeys]);
}

export function useDualChartData(gamesH, gamesAw, period, metricKey, teamH, teamA) {
  return useMemo(() => {
    if (!gamesH.length && !gamesAw.length) return null;
    const statsH  = buildStats(gamesH,  'home', period);
    const statsAw = buildStats(gamesAw, 'away', period);
    const sH      = statsH.find((s) => s.key === metricKey);
    const sA      = statsAw.find((s) => s.key === metricKey);
    if (!sH || !sA) return null;

    const rawH = gamesH.map((g)  => ({ val: getVal(g, metricKey, 'home', period), vs: g.Away }));
    const rawA = gamesAw.map((g) => ({ val: getVal(g, metricKey, 'away', period), vs: g.Home }));
    const vH   = rawH.map((d) => d.val);
    const vA   = rawA.map((d) => d.val);
    const len  = Math.max(vH.length, vA.length);
    const labels = Array.from({ length: len }, (_, i) => rawH[i]?.vs || rawA[i]?.vs || `#${i + 1}`);
    const pH = [...vH, ...new Array(len - vH.length).fill(null)];
    const pA = [...vA, ...new Array(len - vA.length).fill(null)];

    const makeGrad = (r, g, b) => (ctx2) => {
      const { ctx: cv, chartArea: ca } = ctx2.chart;
      if (!ca) return 'transparent';
      const grad = cv.createLinearGradient(0, ca.top, 0, ca.bottom);
      grad.addColorStop(0, `rgba(${r},${g},${b},.13)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      return grad;
    };

    const datasets = [
      { label: teamH, data: pH, borderColor: 'rgba(99,179,237,.9)', backgroundColor: makeGrad(99,179,237),
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7,
        pointBackgroundColor: '#63b3ed', pointBorderColor: '#060a10', pointBorderWidth: 2,
        fill: true, tension: 0.35, spanGaps: false, order: 1 },
      { label: teamA, data: pA, borderColor: 'rgba(255,255,255,.8)', backgroundColor: makeGrad(255,255,255),
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 7,
        pointBackgroundColor: '#ffffff', pointBorderColor: '#060a10', pointBorderWidth: 2,
        fill: true, tension: 0.35, spanGaps: false, order: 2 },
      { label: `Média ${teamH}`, data: new Array(len).fill(sH.avg),
        borderColor: 'rgba(99,179,237,.3)', borderDash: [3,6], borderWidth: 1, pointRadius: 0, fill: false, order: 3 },
      { label: `Média ${teamA}`, data: new Array(len).fill(sA.avg),
        borderColor: 'rgba(255,255,255,.25)', borderDash: [3,6], borderWidth: 1, pointRadius: 0, fill: false, order: 4 },
    ];

    return { datasets, labels, sH, sA };
  }, [gamesH, gamesAw, period, metricKey, teamH, teamA]);
}