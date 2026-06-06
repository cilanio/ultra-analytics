import { useEffect, useRef, useMemo } from 'react';
import * as Sentry from '@sentry/react';
import { useMatchData }  from './hooks/useMatchData';
import { useExport }     from './hooks/useExport';
import { useAuth }       from './hooks/useAuth';
import { useAppStore }   from './store/useAppStore';
import { filterSort, applyN, buildStats } from './utils/stats';
import { normalizeTeamName } from './services/sheetsApi';
import { COMPETITION_MAP } from './constants/competitions';

import LoginPage            from './components/LoginPage';
import Header               from './components/Header';
import LoadBar              from './components/LoadBar';
import EmptyState           from './components/EmptyState';
import FiltersBar           from './components/FiltersBar';
import SingleTab            from './components/SingleTab';
import DualTab              from './components/DualTab';
import CompetitionSelector  from './components/CompetitionSelector';
import DashboardSkeleton    from './components/Skeleton';

function Dashboard({ signOut }) {
  const {
    competitionId, setCompetitionId,
    activeTab,    setActiveTab,
    lastN,        setLastN,
    activePeriod, setActivePeriod,
    teamA,        setTeamA,
    modeA,        setModeA,
    activeMetric, selectMetric,
    multiMode,    multiKeys,    updateMultiKeys,
    teamHome,     setTeamHome,
    teamAway,     setTeamAway,
    dualMetric,   setDualMetric,
    initTeams,
  } = useAppStore();

  const { allData, loading, error } = useMatchData();

  // ── Derive fullData based on selected competition (local filter)
  const fullData = useMemo(() => {
    if (competitionId === 'all') {
      return [
        ...allData.brasileirao,
        ...allData['copa-brasil'],
        ...allData.libertadores,
      ].sort((a, b) => {
        const parseDate = (d) => {
          if (!d) return null;
          const s = String(d);
          if (s.includes('/')) {
            const [day, month, year] = s.split('/');
            return new Date(`${year}-${month}-${day}`);
          }
          return new Date(s);
        };
        const da = parseDate(a.Date);
        const db = parseDate(b.Date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
    }
    return allData[competitionId] || [];
  }, [allData, competitionId]);

  // ── Teams list — only Brazilian teams in Libertadores
  const teams = useMemo(() => {
    if (competitionId === 'all') {
      return [...new Set(allData.brasileirao.map((d) => d.Home).filter(Boolean))].sort();
    }
    if (competitionId === 'libertadores') {
      const brTeamsNorm = new Set(
        allData.brasileirao.map((d) => normalizeTeamName(d.Home)).filter(Boolean)
      );
      const libertTeams = [...new Set(allData.libertadores.map((d) => d.Home).filter(Boolean))];
      return libertTeams
        .filter((t) => brTeamsNorm.has(normalizeTeamName(t)))
        .sort();
    }
    return [...new Set(fullData.map((d) => d.Home).filter(Boolean))].sort();
  }, [allData, competitionId, fullData]);

  useEffect(() => {
    if (teams.length) initTeams(teams);
  }, [teams]);

  useEffect(() => {
    Sentry.setUser({ id: 'authenticated' });
  }, []);

  // ── Mode — force 'all' when viewing all competitions
  const effectiveModeA = competitionId === 'all' ? 'all' : modeA;

  // ── Derived game arrays
  const gamesA  = applyN(filterSort(fullData, teamA,    effectiveModeA), lastN);
  const gamesH  = applyN(filterSort(fullData, teamHome, 'home'),         lastN);
  const gamesAw = applyN(filterSort(fullData, teamAway, 'away'),         lastN);

  // ── Stats
  const statsA  = buildStats(gamesA,  effectiveModeA, activePeriod);
  const statsH  = buildStats(gamesH,  'home',         activePeriod);
  const statsAw = buildStats(gamesAw, 'away',         activePeriod);

  // ── Export
  const exportChartRef = useRef(null);
  const { exportPNG, exportCSV } = useExport(
    exportChartRef, gamesA, effectiveModeA, activePeriod, activeMetric, teamA
  );

  // ── Status
  const competition = COMPETITION_MAP[competitionId];
  const compName    = competitionId === 'all' ? 'Todos os Jogos' : competition?.name || '';
  const status      = loading ? 'loading' : error ? 'error' : 'live';
  const message     = loading
    ? 'Carregando dados…'
    : error
    ? `Erro: ${error}`
    : `${fullData.length} partidas · ${compName}`;
  const isLoaded    = !loading && !error && allData.brasileirao.length > 0;

  return (
    <>
      <LoadBar status={status} />
      <div className="ambient" />
      <div className="wrap">
        <Header status={status} message={message} onSignOut={signOut} />

        <CompetitionSelector
          competitionId={competitionId}
          onChange={setCompetitionId}
        />

        {!isLoaded ? (
          status === 'error'
            ? <EmptyState status={status} />
            : <DashboardSkeleton />
        ) : (
          <>
            <div className="tabs">
              {[
                { key: 'single', label: 'Análise Individual'   },
                { key: 'dual',   label: 'Comparativo de Times' },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`tab${activeTab === key ? ' active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </div>
              ))}
            </div>

            <FiltersBar
              lastN={lastN}
              onSetN={setLastN}
              onExportPNG={exportPNG}
              onExportCSV={exportCSV}
            />

            {activeTab === 'single' && (
              <SingleTab
                teams={teams}
                teamA={teamA}               setTeamA={setTeamA}
                modeA={effectiveModeA}      setModeA={setModeA}
                activePeriod={activePeriod} setActivePeriod={setActivePeriod}
                activeMetric={activeMetric} setActiveMetric={selectMetric}
                multiMode={multiMode}
                multiKeys={multiKeys}       onMultiChange={updateMultiKeys}
                games={gamesA}
                stats={statsA}
                chartRef={exportChartRef}
              />
            )}

            {activeTab === 'dual' && (
              <DualTab
                teams={teams}
                teamHome={teamHome}         setTeamHome={setTeamHome}
                teamAway={teamAway}         setTeamAway={setTeamAway}
                activePeriod={activePeriod} setActivePeriod={setActivePeriod}
                dualMetric={dualMetric}     setDualMetric={setDualMetric}
                gamesH={gamesH}             gamesAw={gamesAw}
                statsH={statsH}             statsAw={statsAw}
                chartRef={exportChartRef}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

function ErrorFallback() {
  return (
    <div className="empty-state">
      <div className="empty-title">Algo deu errado</div>
      <div className="empty-sub">
        O erro foi registrado automaticamente. Tente recarregar a página.
      </div>
      <button
        className="export-btn"
        style={{ marginTop: '1rem' }}
        onClick={() => window.location.reload()}
      >
        Recarregar
      </button>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) return (
    <div className="empty-state">
      <div className="empty-title">Carregando…</div>
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Dashboard signOut={signOut} />
    </Sentry.ErrorBoundary>
  );
}