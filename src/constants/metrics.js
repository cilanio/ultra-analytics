export const METRICS = {
  Total_Shots:         'Finalizações',
  Shots_On_Target:     'Fin. no Alvo',
  Total_Shots_All:     'Finalizações Totais',
  Shots_On_Target_All: 'Fin. Totais no Alvo',
  Goals_For:           'Gols Feitos',
  Goals_Against:       'Gols Sofridos',
  Corners:             'Escanteios',
  Fouls:               'Faltas',
  Big_Chances:         'Grandes Chances',
  Possession:          'Posse (%)',
  Yellow_Cards:        'Cartões Am.',
  Goalkeeper_Saves:    'Defesas GK',
  Offsides:            'Impedimentos',
  Throw_Ins:           'Laterais',
};

export const METRIC_KEYS = Object.keys(METRICS);

export const METRIC_COLORS = [
  '#63b3ed',
  '#ffff00',
  '#c0392b',
  '#8A2BE2',
  '#48bb78',
  '#a3e635',
  '#f687b3',
  '#76e4f7',
];

export const RATIO_TIPS = {
  eff_shots:      'Gols marcados em relação ao total de finalizações do time',
  precision:      'Porcentagem de finalizações que foram direcionadas ao gol',
  conversion:     'Porcentagem de chutes no alvo que resultaram em gol',
  eff_bruta:      'Porcentagem de finalizações totais que resultaram em gol',
  chances_rate:   'Porcentagem de finalizações que geraram grandes chances',
  chances_conv:   'Porcentagem de grandes chances que resultaram em gol',
  corner_rate:    'Escanteios conquistados por cada finalização realizada',
  shots_share:    'Participação do time no total de finalizações da partida',
  ontarget_share: 'Participação do time no total de chutes no alvo da partida',
};

export const WIN_RATE_ONLY = new Set([
  'Corners', 'Fouls', 'Yellow_Cards', 'Goalkeeper_Saves',
  'Offsides', 'Throw_Ins', 'Possession', 'Goals_Against',
  'Total_Shots_All', 'Shots_On_Target_All',
]);