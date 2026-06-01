import DashboardSkeleton from './components/Skeleton';
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { useMatchData } from './hooks/useMatchData';
import { useExport }    from './hooks/useExport';
import { useAuth }      from './hooks/useAuth';
import { useAppStore }  from './store/useAppStore';
import { filterSort, applyN, buildStats } from './utils/stats';

import LoginPage   from './components/LoginPage';
import Header      from './components/Header';
import LoadBar     from './components/LoadBar';
import EmptyState  from './components/EmptyState';
import FiltersBar  from './components/FiltersBar';
import SingleTab   from './components/SingleTab';
import DualTab     from './components/DualTab';

function Dashboard({ signOut }) {
  const { fullData, loading, error } = useMatchData();

  const {
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

  const teams = [...new Set(fullData.map((d) => d.Home).filter(Boolean))].sort();

  useEffect(() => {
    if (teams.length) initTeams(teams);
  }, [fullData]);

  useEffect(() => {
    Sentry.setUser(signOut ? { id: 'authenticated' } : null);
  }, []);

  const gamesA  = applyN(filterSort(fullData, teamA,    modeA),   lastN);
  const gamesH  = applyN(filterSort(fullData, teamHome, 'home'),  lastN);
  const gamesAw = applyN(filterSort(fullData, teamAway, 'away'),  lastN);
  const statsA  = buildStats(gamesA,  modeA,   activePeriod);
  const statsH  = buildStats(gamesH,  'home',  activePeriod);
  const statsAw = buildStats(gamesAw, 'away',  activePeriod);

  const exportChartRef = useRef(null);
  const { exportPNG, exportCSV } = useExport(
    exportChartRef, gamesA, modeA, activePeriod, activeMetric, teamA
  );

  const status  = loading ? 'loading' : error ? 'error' : 'live';
  const message = loading
    ? 'Carregando dados…'
    : error
    ? `Erro: ${error}`
    : `${fullData.length} partidas · Brasileirão 2026`;

  const isLoaded = !loading && !error && fullData.length > 0;

  return (
    <>
      <LoadBar status={status} />
      <div className="ambient" />
      <div className="wrap">
        <Header status={status} message={message} onSignOut={signOut} />

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
                modeA={modeA}               setModeA={setModeA}
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