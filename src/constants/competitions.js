export const COMPETITIONS = [
  {
    id:       'brasileirao',
    name:     'Brasileirão Série A',
    season:   '2026',
    country:  'brazil',
    league:   'brasileirao-betano',
    color:    '#63b3ed',
    flag:     '🇧🇷',
  },
  {
    id:       'copa-brasil',
    name:     'Copa do Brasil',
    season:   '2026',
    country:  'brazil',
    league:   'copa-betano-do-brasil',
    color:    '#48bb78',
    flag:     '🇧🇷',
  },
  {
    id:       'libertadores',
    name:     'Libertadores',
    season:   '2026',
    country:  'south-america',
    league:   'copa-libertadores',
    color:    '#f6ad55',
    flag:     '🌎',
  },
];

export const COMPETITION_MAP = Object.fromEntries(
  COMPETITIONS.map((c) => [c.id, c])
);