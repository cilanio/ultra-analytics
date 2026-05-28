const DATASET_ID = 'cmmw9k1sb000ensbzhys9y70p';

export async function loadFromSheets() {
  const isDev   = import.meta.env.DEV;
  const API_KEY = import.meta.env.VITE_API_KEY_FUTPYTHON;

  const url = isDev
    ? `/api-proxy/api/download/${DATASET_ID}?api_key=${API_KEY}`
    : `/.netlify/functions/getData`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  if (isDev) {
    // In dev, API returns CSV — parse with PapaParse
    const Papa = (await import('papaparse')).default;
    const text = await res.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data.length) reject(new Error('Nenhum dado encontrado'));
          else resolve(results.data);
        },
        error: (err) => reject(new Error(err.message)),
      });
    });
  }

  // In production, Netlify Function returns JSON directly
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) throw new Error('Nenhum dado encontrado');
  return data;
}