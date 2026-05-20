function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const parseRow = (line) => {
    const result = [];
    let current  = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseRow(line);
      const obj    = {};
      headers.forEach((h, i) => {
        const v   = values[i] ?? '';
        const num = parseFloat(v);
        obj[h]    = isNaN(num) ? v : num;
      });
      return obj;
    })
    .filter((r) => Object.values(r).some(Boolean));
}

const API_KEY    = 'cmofc0brd000111ibfzy1hmk9';
const DATASET_ID = 'cmmw9k1sb000ensbzhys9y70p';

export async function loadFromSheets() {
  const isDev = import.meta.env.DEV;
  const url   = isDev
    ? `/api-proxy/api/download/${DATASET_ID}?api_key=${API_KEY}`
    : `/.netlify/functions/getData`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();
  const rows = parseCSV(text);

  if (!rows.length) throw new Error('Nenhum dado encontrado');
  return rows;
}