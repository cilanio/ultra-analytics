const SEASON = '2026';

const DEV_URLS = {
  brasileirao:   `/api-proxy/api/download/brazil/serie-a-betano/${SEASON}`,
  'copa-brasil': `/api-proxy/api/download/brazil/copa-betano-do-brasil/${SEASON}`,
  libertadores:  `/api-proxy/api/download/south-america/copa-libertadores/${SEASON}`,
};

// Normalização agressiva — remove país, converte para minúsculas, remove espaços extras
export function normalizeTeamName(name) {
  if (!name && name !== 0) return '';
  return String(name)
    .replace(/\s*\([A-Z]{2,3}\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
function normalizeRow(row) {
  const cleanName = (v) => {
    if (!v && v !== 0) return v;
    return String(v).replace(/\s*\([A-Z]{2,3}\)\s*$/i, '').trim();
  };
  return {
    ...row,
    Home:      cleanName(row.Home),
    Away:      cleanName(row.Away),
    _homeNorm: normalizeTeamName(String(row.Home || '')),
    _awayNorm: normalizeTeamName(String(row.Away || '')),
  };
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseRow(lines[0]);
  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => {
  const v = values[i] ?? '';
  // Preserve Date and Time as strings
  if (h === 'Date' || h === 'Time') {
    obj[h] = v;
  } else {
    const num = parseFloat(v);
    obj[h] = isNaN(num) ? v : num;
  }
});
      return obj;
    })
    .filter((r) => Object.values(r).some(Boolean));
}

export async function loadFromSheets(competitionId = 'brasileirao') {
  const isDev   = import.meta.env.DEV;
  const API_KEY = import.meta.env.VITE_API_KEY_FUTPYTHON;

  const url = isDev
    ? `${DEV_URLS[competitionId]}?api_key=${API_KEY}`
    : `/.netlify/functions/getData?competition=${competitionId}&season=${SEASON}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  let rows;
  if (isDev) {
    const text = await res.text();
    rows = parseCSV(text);
  } else {
    rows = await res.json();
  }

  if (!Array.isArray(rows) || !rows.length) throw new Error('Nenhum dado encontrado');

  return rows
    .map(normalizeRow)
    .map((r) => ({ ...r, _competition: competitionId }));
}