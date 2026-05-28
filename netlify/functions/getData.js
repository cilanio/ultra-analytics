import Papa from 'papaparse';

export async function handler() {
  const API_KEY    = process.env.API_KEY_FUTPYTHON;
  const DATASET_ID = 'cmmw9k1sb000ensbzhys9y70p';
  const url        = `https://futpythontrader.com.br/api/download/${DATASET_ID}?api_key=${API_KEY}`;

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
  });

  if (errors.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar CSV' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
}