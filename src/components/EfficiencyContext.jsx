import { avg, pct } from '../utils/stats';
import { goalsByPeriod, goalsConcededByPeriod, resultByPeriod } from '../utils/stats';

function EffBlock({ games, mode, period, color, teamName }) {
  if (!games.length) return null;
  const total = games.length;
  const w = games.filter((g) => resultByPeriod(g, mode, period) === 'W').length;
  const d = games.filter((g) => resultByPeriod(g, mode, period) === 'D').length;
  const l = games.filter((g) => resultByPeriod(g, mode, period) === 'L').length;
  const wP = pct(w, total), dP = pct(d, total), lP = pct(l, total);
  const modeLabel = mode === 'home' ? 'Mandante' : mode === 'away' ? 'Visitante' : 'Todos';
  const avgGf = parseFloat(avg(games.map((g) => goalsByPeriod(g, mode, period))).toFixed(2));
  const avgGc = parseFloat(avg(games.map((g) => goalsConcededByPeriod(g, mode, period))).toFixed(2));

  return (
    <div className="eff-block">
      <div className="eff-block-title" style={{ color }}>{teamName} · {modeLabel}</div>
      <div className="eff-row">
        <span className="eff-label">Vitórias</span>
        <span className="eff-val" style={{ color: 'var(--good)' }}>
          {w} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({wP.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="eff-bar-bg"><div className="eff-bar" style={{ width: `${wP.toFixed(1)}%`, background: 'var(--good)' }} /></div>
      <div className="eff-row" style={{ marginTop: '.35rem' }}>
        <span className="eff-label">Empates</span>
        <span className="eff-val" style={{ color: 'var(--warn)' }}>
          {d} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({dP.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="eff-bar-bg"><div className="eff-bar" style={{ width: `${dP.toFixed(1)}%`, background: 'var(--warn)' }} /></div>
      <div className="eff-row" style={{ marginTop: '.35rem' }}>
        <span className="eff-label">Derrotas</span>
        <span className="eff-val" style={{ color: 'var(--bad)' }}>
          {l} <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--muted2)' }}>({lP.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="eff-bar-bg"><div className="eff-bar" style={{ width: `${lP.toFixed(1)}%`, background: 'var(--bad)' }} /></div>
      <div className="eff-divider" />
      <div className="eff-row">
        <span className="eff-label">Média Gols Pró</span>
        <span className="eff-val" style={{ color: 'var(--good)' }}>{avgGf}</span>
      </div>
      <div className="eff-row" style={{ marginTop: '.25rem' }}>
        <span className="eff-label">Média Gols Sof</span>
        <span className="eff-val" style={{ color: 'var(--bad)' }}>{avgGc}</span>
      </div>
    </div>
  );
}

export default function EfficiencyContext({ gamesA, modeA, gamesB, modeB, period, teamA, teamB, title }) {
  const colorA = modeA === 'home' ? '#63b3ed' : 'rgba(255,255,255,0.7)';
  const colorB = modeB === 'home' ? '#63b3ed' : 'rgba(255,255,255,0.7)';
  return (
    <div className="context-box">
      <div className="ctx-title">{title || 'Eficiência de Resultado'}</div>
      <div className="eff-grid">
        <EffBlock games={gamesA} mode={modeA} period={period} color={colorA} teamName={teamA} />
        {gamesB?.length > 0 && (
          <EffBlock games={gamesB} mode={modeB} period={period} color={colorB} teamName={teamB} />
        )}
      </div>
    </div>
  );
}