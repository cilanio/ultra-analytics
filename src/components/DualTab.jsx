import { useRef, useState } from 'react';
import PeriodPills       from './PeriodPills';
import DualChart         from './DualChart';
import MetricsList       from './MetricsList';
import { useDualChartData } from '../hooks/useChartData';
import { getResultCounts, goalsByPeriod, goalsConcededByPeriod, avg } from '../utils/stats';
import { FT_ONLY_METRICS } from '../constants/metrics';

function CollapsibleStats({ title, color, counts, gf, gc, shots }) {
  const [open, setOpen] = useState(false);
  const total = counts.total;
  const wPct = total ? ((counts.w / total) * 100).toFixed(0) : '–';
  const dPct = total ? ((counts.d / total) * 100).toFixed(0) : '–';
  const lPct = total ? ((counts.l / total) * 100).toFixed(0) : '–';

  return (
    <div className="collapsible-panel" style={{ marginBottom: 0 }}>
      <div className="collapsible-header" onClick={() => setOpen((o) => !o)}>
        <div className="collapsible-title" style={{ color }}>
          {title}
          <span style={{ color: 'var(--good)', marginLeft: '.5rem' }}>{counts.w}V</span>
          <span style={{ color: 'var(--warn)', marginLeft: '.3rem' }}>{counts.d}E</span>
          <span style={{ color: 'var(--bad)',  marginLeft: '.3rem' }}>{counts.l}D</span>
        </div>
        <span className={`collapsible-arrow${open ? ' open' : ''}`}>▼</span>
      </div>
      <div className={`collapsible-body${open ? ' open' : ''}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.5rem' }}>
          <div className="stat-pill">
            <div className="v" style={{ color: 'var(--good)' }}>{counts.w}<span style={{ fontSize: '.7rem', color: 'var(--muted2)' }}> ({wPct}%)</span></div>
            <div className="l">Vitórias</div>
          </div>
          <div className="stat-pill">
            <div className="v" style={{ color: 'var(--warn)' }}>{counts.d}<span style={{ fontSize: '.7rem', color: 'var(--muted2)' }}> ({dPct}%)</span></div>
            <div className="l">Empates</div>
          </div>
          <div className="stat-pill">
            <div className="v" style={{ color: 'var(--bad)' }}>{counts.l}<span style={{ fontSize: '.7rem', color: 'var(--muted2)' }}> ({lPct}%)</span></div>
            <div className="l">Derrotas</div>
          </div>
          <div className="stat-pill">
            <div className="v" style={{ color: 'var(--good)' }}>{gf}</div>
            <div className="l">Gols Pró</div>
          </div>
          <div className="stat-pill">
            <div className="v" style={{ color: 'var(--bad)' }}>{gc}</div>
            <div className="l">Gols Sof</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DualTab({
  teams,
  teamHome, setTeamHome,
  teamAway, setTeamAway,
  activePeriod, setActivePeriod,
  dualMetric, setDualMetric,
  gamesH, gamesAw,
  statsH, statsAw,
  chartRef,
}) {
  const [showResult, setShowResult] = useState(false);

  const isFtOnly = FT_ONLY_METRICS.has(dualMetric);
  const chartData = useDualChartData(gamesH, gamesAw, activePeriod, dualMetric, teamHome, teamAway);

  const countsH = getResultCounts(gamesH,  'home', activePeriod);
  const countsA = getResultCounts(gamesAw, 'away', activePeriod);

  const gfH = gamesH.reduce((s, g) => s + (parseFloat(g['Home_Score']) || 0), 0);
  const gcH = gamesH.reduce((s, g) => s + (parseFloat(g['Away_Score']) || 0), 0);
  const gfA = gamesAw.reduce((s, g) => s + (parseFloat(g['Away_Score']) || 0), 0);
  const gcA = gamesAw.reduce((s, g) => s + (parseFloat(g['Home_Score']) || 0), 0);

  return (
    <div>
      {/* TEAM SELECTORS */}
      <div className="filters-dual">
        <div className="filter-col">
          <div className="filter-group accent-a">
            <label className="filter-lbl" style={{ color: 'var(--a)' }}>Mandante</label>
            <select className="main-sel" value={teamHome} onChange={(e) => setTeamHome(e.target.value)}>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <CollapsibleStats
            title={teamHome}
            color="var(--a)"
            counts={countsH}
            gf={gfH} gc={gcH}
          />
        </div>

        <div className="filter-col">
          <div className="filter-group accent-b">
            <label className="filter-lbl" style={{ color: 'rgba(255,255,255,0.7)' }}>Visitante</label>
            <select className="main-sel" value={teamAway} onChange={(e) => setTeamAway(e.target.value)}>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <CollapsibleStats
            title={teamAway}
            color="rgba(255,255,255,0.8)"
            counts={countsA}
            gf={gfA} gc={gcA}
          />
        </div>
      </div>

      {/* CHART + METRICS */}
      <div className="main-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <PeriodPills
              activePeriod={activePeriod}
              onSetPeriod={setActivePeriod}
              disableSubPeriods={isFtOnly}
            />
            {/* Result toggle inline */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer', fontSize: '11px', color: 'var(--muted2)' }}>
              <input
                type="checkbox"
                checked={showResult}
                style={{ color: '#a3e635', accentColor: '#a3e635' }}
                onChange={(e) => setShowResult(e.target.checked)}
              />
              Colorir por resultado
            </label>
          </div>

          <DualChart
            chartData={chartData}
            metricKey={dualMetric}
            teamH={teamHome}
            teamA={teamAway}
            chartRef={chartRef}
            gamesH={gamesH}
            gamesAw={gamesAw}
            period={activePeriod}
            showResult={showResult}
          />
        </div>

        <MetricsList
          statsA={statsH}
          statsB={statsAw}
          activeMetric={dualMetric}
          onSelectMetric={setDualMetric}
        />
      </div>
    </div>
  );
}