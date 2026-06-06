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
  const { data, errors } = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    // Preserve Date and Time as strings
    dynamicTypingFunction: (field) => field !== 'Date' && field !== 'Time',
  });

  if (errors.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar CSV' }),
    };
  }

  const tagged = data.map((row) => ({
    ...row,
    Home: normalizeTeamName(row.Home),
    Away: normalizeTeamName(row.Away),
    _competition: competition,
  }));

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