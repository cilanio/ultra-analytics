import { useRef } from 'react';
import PeriodPills       from './PeriodPills';
import DualChart         from './DualChart';
import MetricsList       from './MetricsList';
import EfficiencyContext from './EfficiencyContext';
import { useDualChartData } from '../hooks/useChartData';
import { getResultCounts }  from '../utils/stats';

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
  const chartData = useDualChartData(gamesH, gamesAw, activePeriod, dualMetric, teamHome, teamAway);
  const countsH   = getResultCounts(gamesH,  'home', activePeriod);
  const countsA   = getResultCounts(gamesAw, 'away', activePeriod);

  return (
    <div>
      <div className="filters-dual">
        <div className="filter-col">
          <div className="filter-group accent-a">
            <label className="filter-lbl" style={{ color: 'var(--a)' }}>Mandante</label>
            <select className="main-sel" value={teamHome} onChange={(e) => setTeamHome(e.target.value)}>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="dual-stat-pill">
            <div><div className="v">{countsH.total}</div><div className="l">Partidas</div></div>
            <div><div className="v" style={{ color: 'var(--good)' }}>{countsH.w}</div><div className="l">Vitórias</div></div>
            <div><div className="v" style={{ color: 'var(--warn)' }}>{countsH.d}</div><div className="l">Empates</div></div>
            <div><div className="v" style={{ color: 'var(--bad)'  }}>{countsH.l}</div><div className="l">Derrotas</div></div>
          </div>
          <div className="dual-stat-pill">
            <div><div className="v" style={{ color: 'var(--good)' }}>{gamesH.reduce((s,g)=>s+(parseFloat(g['Home_Score'])||0),0)}</div><div className="l">Gols Pró</div></div>
            <div><div className="v" style={{ color: 'var(--bad)'  }}>{gamesH.reduce((s,g)=>s+(parseFloat(g['Away_Score'])||0),0)}</div><div className="l">Gols Sof</div></div>
            <div><div className="v" style={{ color: 'var(--a)'    }}>{statsH.find((s)=>s.key==='Total_Shots')?.vals.reduce((a,b)=>a+b,0)??0}</div><div className="l">Finalizações</div></div>
          </div>
        </div>

        <div className="filter-col">
          <div className="filter-group accent-b">
            <label className="filter-lbl" style={{ color: 'rgba(255,255,255,0.7)' }}>Visitante</label>
            <select className="main-sel" value={teamAway} onChange={(e) => setTeamAway(e.target.value)}>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="dual-stat-pill">
            <div><div className="v">{countsA.total}</div><div className="l">Partidas</div></div>
            <div><div className="v" style={{ color: 'var(--good)' }}>{countsA.w}</div><div className="l">Vitórias</div></div>
            <div><div className="v" style={{ color: 'var(--warn)' }}>{countsA.d}</div><div className="l">Empates</div></div>
            <div><div className="v" style={{ color: 'var(--bad)'  }}>{countsA.l}</div><div className="l">Derrotas</div></div>
          </div>
          <div className="dual-stat-pill">
            <div><div className="v" style={{ color: 'var(--good)'         }}>{gamesAw.reduce((s,g)=>s+(parseFloat(g['Away_Score'])||0),0)}</div><div className="l">Gols Pró</div></div>
            <div><div className="v" style={{ color: 'var(--bad)'          }}>{gamesAw.reduce((s,g)=>s+(parseFloat(g['Home_Score'])||0),0)}</div><div className="l">Gols Sof</div></div>
            <div><div className="v" style={{ color: 'rgba(255,255,255,.7)'}}>{statsAw.find((s)=>s.key==='Total_Shots')?.vals.reduce((a,b)=>a+b,0)??0}</div><div className="l">Finalizações</div></div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div>
          <div style={{ marginBottom: '.75rem' }}>
            <PeriodPills activePeriod={activePeriod} onSetPeriod={setActivePeriod} />
          </div>
          <DualChart chartData={chartData} metricKey={dualMetric} teamH={teamHome} teamA={teamAway} chartRef={chartRef} />
          <EfficiencyContext
            gamesA={gamesH}  modeA="home" teamA={teamHome}
            gamesB={gamesAw} modeB="away" teamB={teamAway}
            period={activePeriod}
          />
        </div>
        <MetricsList statsA={statsH} statsB={statsAw} activeMetric={dualMetric} onSelectMetric={setDualMetric} />
      </div>
    </div>
  );
}