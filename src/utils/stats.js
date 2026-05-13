import { METRIC_KEYS, METRICS } from '../constants/metrics';

export const avg = (arr) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const pct = (n, d) => (d ? (n / d) * 100 : 0);

export const fmt = (v) =>
  v === null || isNaN(v) || !isFinite(v) ? '–' : v.toFixed(1) + '%';

export const colWin = (v) =>
  v >= 60 ? 'var(--good)' : v >= 40 ? 'var(--warn)' : 'var(--bad)';

export const perGameRatio = (numArr, denArr) => {
  const pairs = numArr
    .map((v, i) => (denArr[i] > 0 ? (v / denArr[i]) * 100 : null))
    .filter((v) => v !== null);
  return pairs.length ? avg(pairs) : null;
};

export function parseGoalMins(raw) {
  if (!raw && raw !== 0) return [];
  const str = String(raw).replace(/[\[\]\s]/g, '').trim();
  if (!str || str === '-') return [];
  return str.split(',').map((s) => parseFloat(s)).filter((n) => !isNaN(n) && n > 0);
}

export function getGoals(g) {
  return { h: parseFloat(g['Home_Score']) || 0, a: parseFloat(g['Away_Score']) || 0 };
}

export const eMode = (g, mode) => (mode === 'all' ? g._mode || 'home' : mode);

export function goalsByPeriod(g, mode, period) {
  const m = eMode(g, mode);
  const hMins = parseGoalMins(g['Min_Goals_Home']);
  const aMins = parseGoalMins(g['Min_Goals_Away']);
  if (period === 'FT') {
    const { h, a } = getGoals(g);
    return m === 'home' ? h : a;
  }
  const filter = period === 'HT' ? (mn) => mn >= 1 && mn <= 45 : (mn) => mn >= 46;
  return m === 'home' ? hMins.filter(filter).length : aMins.filter(filter).length;
}

export function goalsConcededByPeriod(g, mode, period) {
  const m = eMode(g, mode);
  return goalsByPeriod(g, m === 'home' ? 'away' : 'home', period);
}

export function resultByPeriod(g, mode, period) {
  const gf = goalsByPeriod(g, mode, period);
  const gc = goalsConcededByPeriod(g, mode, period);
  if (gf === gc) return 'D';
  return gf > gc ? 'W' : 'L';
}

export function getVal(g, key, mode, period) {
  const m = eMode(g, mode);
  if (key === 'Total_Shots_All')
    return (parseFloat(g[`Total_Shots_Home_${period}`]) || 0) + (parseFloat(g[`Total_Shots_Away_${period}`]) || 0);
  if (key === 'Shots_On_Target_All')
    return (parseFloat(g[`Shots_On_Target_Home_${period}`]) || 0) + (parseFloat(g[`Shots_On_Target_Away_${period}`]) || 0);
  if (key === 'Goals_For')     return goalsByPeriod(g, mode, period);
  if (key === 'Goals_Against') return goalsConcededByPeriod(g, mode, period);
  const side = m === 'home' ? 'Home' : 'Away';
  const raw = parseFloat(g[`${key}_${side}_${period}`]) || 0;
  if (key === 'Possession') return Math.round(raw * 100);
  return raw;
}

export function buildStats(games, mode, period) {
  return METRIC_KEYS.map((key) => {
    const vals = games.map((g) => getVal(g, key, mode, period));
    const isPercent = key === 'Possession';
    const avgVal = avg(vals);
    return {
      key,
      label: METRICS[key],
      avg:   isPercent ? Math.round(avgVal) : parseFloat(avgVal.toFixed(2)),
      max:   vals.length ? Math.max(...vals) : 0,
      min:   vals.length ? Math.min(...vals) : 0,
      vals,
    };
  });
}

export function filterSort(fullData, team, mode) {
  let rows;
  if (mode === 'all') {
    const home = fullData.filter((g) => g.Home === team).map((g) => ({ ...g, _mode: 'home' }));
    const away = fullData.filter((g) => g.Away === team).map((g) => ({ ...g, _mode: 'away' }));
    rows = [...home, ...away];
  } else {
    rows = fullData
      .filter((g) => (mode === 'home' ? g.Home === team : g.Away === team))
      .map((g) => ({ ...g, _mode: mode }));
  }
  return rows.sort((a, b) => {
    if (!a.Date && !b.Date) return 0;
    if (!a.Date) return 1;
    if (!b.Date) return -1;
    return new Date(a.Date) - new Date(b.Date);
  });
}

export const applyN = (games, n) => (n >= 999 ? games : games.slice(-n));

export function getResultCounts(games, mode, period) {
  return {
    total: games.length,
    w: games.filter((g) => resultByPeriod(g, mode, period) === 'W').length,
    d: games.filter((g) => resultByPeriod(g, mode, period) === 'D').length,
    l: games.filter((g) => resultByPeriod(g, mode, period) === 'L').length,
  };
}