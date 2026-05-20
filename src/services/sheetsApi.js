const API_KEY    = 'cmofc0brd000111ibfzy1hmk9';
const DATASET_ID = 'cmmw9k1sb000ensbzhys9y70p';

/**
 * Loads match data from FutPythonTrader API.
 * Uses Vite proxy in development to bypass CORS.
 * In production (Netlify), calls the API directly via Netlify Function.
 */
export async function loadFromSheets() {
  const isDev = import.meta.env.DEV;
  const url   = isDev
    ? `/api-proxy/api/download/${DATASET_ID}?api_key=${API_KEY}`
    : `/.netlify/functions/getData`;

  const res = await fetch(url);
  if (res.status === 401) throw new Error('API Key inválida');
  if (!res.ok)            throw new Error(`HTTP ${res.status}`);

  const text    = await res.text();
  const lines   = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

  const rows = lines.slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const obj    = {};
      headers.forEach((h, i) => {
        const num = parseFloat(values[i]);
        obj[h]    = isNaN(num) ? values[i] : num;
      });
      return obj;
    })
    .filter((r) => Object.values(r).some(Boolean));

  if (!rows.length) throw new Error('Nenhum dado encontrado');
  return rows;
}