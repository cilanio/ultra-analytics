import { useState, useCallback } from 'react';

export function useFilters() {
  const [activeTab,    setActiveTab]    = useState('single');
  const [lastN,        setLastN]        = useState(999);
  const [activePeriod, setActivePeriod] = useState('FT');

  const [teamA,        setTeamA]        = useState('');
  const [modeA,        setModeA]        = useState('home');
  const [activeMetric, setActiveMetric] = useState('Total_Shots');
  const [multiMode,    setMultiMode]    = useState(false);
  const [multiKeys,    setMultiKeys]    = useState(['', '', '', '']);

  const [teamHome,     setTeamHome]     = useState('');
  const [teamAway,     setTeamAway]     = useState('');
  const [dualMetric,   setDualMetric]   = useState('Total_Shots');

  const initTeams = useCallback((teams) => {
    if (teams.length === 0) return;
    setTeamA((prev)    => prev || teams[0]);
    setTeamHome((prev) => prev || teams[0]);
    setTeamAway((prev) => prev || (teams[1] ?? teams[0]));
  }, []);

  const selectMetric = useCallback((key) => {
    setActiveMetric(key);
    setMultiMode(false);
    setMultiKeys(['', '', '', '']);
  }, []);

  const updateMultiKeys = useCallback((newKeys) => {
    setMultiKeys(newKeys);
    setMultiMode(newKeys.some(Boolean));
  }, []);

  return {
    activeTab, setActiveTab,
    lastN,     setLastN,
    activePeriod, setActivePeriod,
    teamA, setTeamA,
    modeA, setModeA,
    activeMetric, selectMetric,
    multiMode, multiKeys, updateMultiKeys,
    teamHome, setTeamHome,
    teamAway, setTeamAway,
    dualMetric, setDualMetric,
    initTeams,
  };
}