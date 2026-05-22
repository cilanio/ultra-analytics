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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
    body: text,
  };
}