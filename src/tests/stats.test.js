import { describe, it, expect } from 'vitest';
import {
  parseGoalMins,
  goalsByPeriod,
  goalsConcededByPeriod,
  resultByPeriod,
  getVal,
  buildStats,
  filterSort,
  applyN,
  avg,
  pct,
} from '../utils/stats';

// ── Fixtures baseados nos exemplos reais do Athletico-PR
const GAMES = [
  { Home: 'Athletico-PR', Away: 'Corinthians', Home_Score: 0, Away_Score: 1, Min_Goals_Home: '',    Min_Goals_Away: '20',       Round: 1, Total_Shots_Home_FT: 12, Total_Shots_Away_FT: 8  },
  { Home: 'Athletico-PR', Away: 'Santos',      Home_Score: 2, Away_Score: 1, Min_Goals_Home: '6,90', Min_Goals_Away: '17',      Round: 2, Total_Shots_Home_FT: 15, Total_Shots_Away_FT: 10 },
  { Home: 'Athletico-PR', Away: 'Cruzeiro',    Home_Score: 2, Away_Score: 1, Min_Goals_Home: '1,10', Min_Goals_Away: '58',      Round: 3, Total_Shots_Home_FT: 14, Total_Shots_Away_FT: 9  },
  { Home: 'Athletico-PR', Away: 'Coritiba',    Home_Score: 2, Away_Score: 0, Min_Goals_Home: '22,56', Min_Goals_Away: '',       Round: 4, Total_Shots_Home_FT: 18, Total_Shots_Away_FT: 6  },
  { Home: 'Athletico-PR', Away: 'Botafogo RJ', Home_Score: 4, Away_Score: 1, Min_Goals_Home: '4,45,49,81', Min_Goals_Away: '43', Round: 5, Total_Shots_Home_FT: 20, Total_Shots_Away_FT: 11 },
  { Home: 'Athletico-PR', Away: 'Chapecoense', Home_Score: 2, Away_Score: 0, Min_Goals_Home: '57,81', Min_Goals_Away: '',       Round: 6, Total_Shots_Home_FT: 16, Total_Shots_Away_FT: 7  },
  { Home: 'Athletico-PR', Away: 'Vitoria',     Home_Score: 3, Away_Score: 1, Min_Goals_Home: '34,90,90', Min_Goals_Away: '22', Round: 7, Total_Shots_Home_FT: 17, Total_Shots_Away_FT: 9  },
].map(g => ({ ...g, _mode: 'home' }));

// ══════════════════════════════════════
// parseGoalMins
// ══════════════════════════════════════
describe('parseGoalMins', () => {
  it('retorna array vazio para campo vazio', () => {
    expect(parseGoalMins('')).toEqual([]);
    expect(parseGoalMins(null)).toEqual([]);
    expect(parseGoalMins(undefined)).toEqual([]);
  });

  it('parseia minutos simples', () => {
    expect(parseGoalMins('20')).toEqual([20]);
    expect(parseGoalMins('6,90')).toEqual([6, 90]);
    expect(parseGoalMins('4,45,49,81')).toEqual([4, 45, 49, 81]);
  });

  it('ignora colchetes e espaços', () => {
    expect(parseGoalMins('[6, 90]')).toEqual([6, 90]);
  });
});

// ══════════════════════════════════════
// goalsByPeriod — baseado na tabela do Athletico
// ══════════════════════════════════════
describe('goalsByPeriod', () => {
  it('FT retorna placar final', () => {
    expect(goalsByPeriod(GAMES[0], 'home', 'FT')).toBe(0); // 0x1
    expect(goalsByPeriod(GAMES[1], 'home', 'FT')).toBe(2); // 2x1
  });

  it('HT — Corinthians: home=0, away=1 → DERROTA', () => {
    expect(goalsByPeriod(GAMES[0], 'home', 'HT')).toBe(0);
    expect(goalsByPeriod(GAMES[0], 'away', 'HT')).toBe(1);
  });

  it('HT — Santos: home=1(min6), away=1(min17) → EMPATE', () => {
    expect(goalsByPeriod(GAMES[1], 'home', 'HT')).toBe(1);
    expect(goalsByPeriod(GAMES[1], 'away', 'HT')).toBe(1);
  });

  it('2T — Santos: home=1(min90), away=0 → VITÓRIA', () => {
    expect(goalsByPeriod(GAMES[1], 'home', '2T')).toBe(1);
    expect(goalsByPeriod(GAMES[1], 'away', '2T')).toBe(0);
  });

  it('2T — Cruzeiro: home=0, away=1(min58) → DERROTA', () => {
    expect(goalsByPeriod(GAMES[2], 'home', '2T')).toBe(0);
    expect(goalsByPeriod(GAMES[2], 'away', '2T')).toBe(1);
  });

  it('HT — Botafogo: home=2(min4,45), away=1(min43) → VITÓRIA', () => {
    expect(goalsByPeriod(GAMES[4], 'home', 'HT')).toBe(2);
    expect(goalsByPeriod(GAMES[4], 'away', 'HT')).toBe(1);
  });

  it('2T — Chapecoense: home=2(min57,81), away=0 → VITÓRIA', () => {
    expect(goalsByPeriod(GAMES[5], 'home', '2T')).toBe(2);
    expect(goalsByPeriod(GAMES[5], 'away', '2T')).toBe(0);
  });

  it('gols no minuto 90 contam como 2T', () => {
    // Vitória: min 90,90 são 2T
    expect(goalsByPeriod(GAMES[6], 'home', '2T')).toBe(2);
  });

  it('gols no minuto 45 contam como HT', () => {
    // Botafogo: min 45 é HT
    expect(goalsByPeriod(GAMES[4], 'home', 'HT')).toBe(2);
  });
});

// ══════════════════════════════════════
// resultByPeriod
// ══════════════════════════════════════
describe('resultByPeriod', () => {
  it('Corinthians HT → DERROTA', () => {
    expect(resultByPeriod(GAMES[0], 'home', 'HT')).toBe('L');
  });
  it('Corinthians 2T → EMPATE', () => {
    expect(resultByPeriod(GAMES[0], 'home', '2T')).toBe('D');
  });
  it('Santos HT → EMPATE', () => {
    expect(resultByPeriod(GAMES[1], 'home', 'HT')).toBe('D');
  });
  it('Santos 2T → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[1], 'home', '2T')).toBe('W');
  });
  it('Cruzeiro HT → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[2], 'home', 'HT')).toBe('W');
  });
  it('Cruzeiro 2T → DERROTA', () => {
    expect(resultByPeriod(GAMES[2], 'home', '2T')).toBe('L');
  });
  it('Coritiba HT → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[3], 'home', 'HT')).toBe('W');
  });
  it('Coritiba 2T → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[3], 'home', '2T')).toBe('W');
  });
  it('Chapecoense HT → EMPATE', () => {
    expect(resultByPeriod(GAMES[5], 'home', 'HT')).toBe('D');
  });
  it('Chapecoense 2T → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[5], 'home', '2T')).toBe('W');
  });
  it('Vitória HT → EMPATE', () => {
    expect(resultByPeriod(GAMES[6], 'home', 'HT')).toBe('D');
  });
  it('Vitória 2T → VITÓRIA', () => {
    expect(resultByPeriod(GAMES[6], 'home', '2T')).toBe('W');
  });
});

// ══════════════════════════════════════
// getVal
// ══════════════════════════════════════
describe('getVal', () => {
  it('Total_Shots FT mandante', () => {
    expect(getVal(GAMES[0], 'Total_Shots', 'home', 'FT')).toBe(12);
  });

  it('Total_Shots_All soma os dois times', () => {
    expect(getVal(GAMES[0], 'Total_Shots_All', 'home', 'FT')).toBe(20); // 12+8
    expect(getVal(GAMES[1], 'Total_Shots_All', 'home', 'FT')).toBe(25); // 15+10
  });

  it('Goals_For FT', () => {
    expect(getVal(GAMES[1], 'Goals_For', 'home', 'FT')).toBe(2);
    expect(getVal(GAMES[0], 'Goals_For', 'home', 'FT')).toBe(0);
  });

  it('Goals_Against FT', () => {
    expect(getVal(GAMES[0], 'Goals_Against', 'home', 'FT')).toBe(1);
    expect(getVal(GAMES[3], 'Goals_Against', 'home', 'FT')).toBe(0);
  });
});

// ══════════════════════════════════════
// avg e pct
// ══════════════════════════════════════
describe('avg', () => {
  it('calcula média corretamente', () => {
    expect(avg([1, 2, 3])).toBe(2);
    expect(avg([10, 20])).toBe(15);
    expect(avg([])).toBe(0);
  });
});

describe('pct', () => {
  it('calcula percentual corretamente', () => {
    expect(pct(1, 4)).toBe(25);
    expect(pct(3, 3)).toBe(100);
    expect(pct(0, 5)).toBe(0);
    expect(pct(1, 0)).toBe(0);
  });
});

// ══════════════════════════════════════
// filterSort e applyN
// ══════════════════════════════════════
describe('filterSort', () => {
  const fullData = GAMES.map(g => ({ ...g }));

  it('filtra jogos do time mandante', () => {
    const result = filterSort(fullData, 'Athletico-PR', 'home');
    expect(result.length).toBe(7);
    expect(result.every(g => g.Home === 'Athletico-PR')).toBe(true);
  });

  it('retorna array vazio para time inexistente', () => {
    const result = filterSort(fullData, 'Time Inexistente', 'home');
    expect(result.length).toBe(0);
  });
});

describe('applyN', () => {
  const games = [1, 2, 3, 4, 5];
  it('retorna todos quando n >= 999', () => {
    expect(applyN(games, 999)).toHaveLength(5);
  });
  it('retorna últimos N', () => {
    expect(applyN(games, 3)).toEqual([3, 4, 5]);
  });
  it('retorna todos quando N maior que total', () => {
    expect(applyN(games, 10)).toHaveLength(5);
  });
});