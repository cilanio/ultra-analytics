import Papa from 'papaparse';

const BASE_URL = 'https://futpythontrader.com.br/api/download';

const SLUGS = {
  'brasileirao': 'brazil/serie-a-betano',
  'copa-brasil': 'brazil/copa-betano-do-brasil',
  'libertadores': 'south-america/copa-libertadores',
};

function normalizeTeamName(name) {
  if (!name && name !== 0) return '';
  return String(name).replace(/\s*\([A-Z]{2,3}\)\s*$/i, '').trim();
}

export async function handler(event) {
  const API_KEY     = process.env.API_KEY_FUTPYTHON;
  const competition = event.queryStringParameters?.competition || 'brasileirao';
  const season      = event.queryStringParameters?.season      || '2026';

  const slug = SLUGS[competition];
  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Competição desconhecida: ${competition}` }),
    };
  }

  const url = `${BASE_URL}/${slug}/${season}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: `API error: ${res.status}` }),
    };
  }

  const text = await res.text();

  // Parse without dynamicTyping — convert manually to preserve Date as string
  const { data, errors } = Papa.parse(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  });

  if (errors.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar CSV' }),
    };
  }

  const STRING_FIELDS = new Set(['Date', 'Time', 'Home', 'Away', 'League', 'Country', 'Div', 'Season', 'Match_ID']);

  const tagged = data.map((row) => {
    const obj = { _competition: competition };
    Object.entries(row).forEach(([k, v]) => {
      if (STRING_FIELDS.has(k) || k.startsWith('Min_')) {
        obj[k] = v; // keep as string
      } else {
        const num = parseFloat(v);
        obj[k] = isNaN(num) ? v : num;
      }
      // Normalize team names
      if (k === 'Home') obj[k] = normalizeTeamName(v);
      if (k === 'Away') obj[k] = normalizeTeamName(v);
    });
    return obj;
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(tagged),
  };
}