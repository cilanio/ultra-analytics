import { getResultCounts } from '../utils/stats';

const PILL_CLASS = { home: 'pill-home', away: 'pill-away', all: 'pill-all' };
const PILL_LABEL = { home: 'Casa', away: 'Fora', all: 'Todos' };

export default function TeamSelector({ teams, team, mode, games, period, onTeamChange, onModeChange }) {
  const counts = getResultCounts(games, mode, period);
  return (
    <div className="filters-single">
      <div className="filter-group accent-a">
        <label className="filter-lbl">Time</label>
        <select className="main-sel" value={team} onChange={(e) => onTeamChange(e.target.value)}>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="filter-group" style={{ position: 'relative' }}>
        <label className="filter-lbl">Mando</label>
        <select className="main-sel" value={mode} onChange={(e) => onModeChange(e.target.value)}>
          <option value="home">Mandante</option>
          <option value="away">Visitante</option>
          <option value="all">Todos</option>
        </select>
        <span className={`mode-pill ${PILL_CLASS[mode]}`}>{PILL_LABEL[mode]}</span>
      </div>
      <div className="stat-pill">
        <div className="v">{counts.total}</div><div className="l">Partidas</div>
      </div>
      <div className="stat-pill">
        <div className="v" style={{ color: 'var(--good)' }}>{counts.w}</div><div className="l">Vitórias</div>
      </div>
      <div className="stat-pill">
        <div className="v" style={{ color: 'var(--warn)' }}>{counts.d}</div><div className="l">Empates</div>
      </div>
      <div className="stat-pill">
        <div className="v" style={{ color: 'var(--bad)' }}>{counts.l}</div><div className="l">Derrotas</div>
      </div>
    </div>
  );
}