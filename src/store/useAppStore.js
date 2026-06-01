import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // ── Shared
  activeTab:    'single',
  lastN:        999,
  activePeriod: 'FT',

  // ── Single tab
  teamA:        '',
  modeA:        'home',
  activeMetric: 'Total_Shots',
  multiMode:    false,
  multiKeys:    ['', '', '', ''],

  // ── Dual tab
  teamHome:   '',
  teamAway:   '',
  dualMetric: 'Total_Shots',

  // ── Actions
  setActiveTab:    (v) => set({ activeTab: v }),
  setLastN:        (v) => set({ lastN: v }),
  setActivePeriod: (v) => set({ activePeriod: v }),
  setTeamA:        (v) => set({ teamA: v }),
  setModeA:        (v) => set({ modeA: v }),
  setTeamHome:     (v) => set({ teamHome: v }),
  setTeamAway:     (v) => set({ teamAway: v }),
  setDualMetric:   (v) => set({ dualMetric: v }),

  selectMetric: (key) => set({
    activeMetric: key,
    multiMode:    false,
    multiKeys:    ['', '', '', ''],
  }),

  updateMultiKeys: (keys) => set({
    multiKeys: keys,
    multiMode: keys.some(Boolean),
  }),

  initTeams: (teams) => {
    const { teamA, teamHome, teamAway } = get();
    if (!teamA    && teams[0]) set({ teamA:    teams[0] });
    if (!teamHome && teams[0]) set({ teamHome: teams[0] });
    if (!teamAway && teams[1]) set({ teamAway: teams[1] });
  },
}));