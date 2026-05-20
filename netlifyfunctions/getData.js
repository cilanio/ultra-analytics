export async function handler(event, context) {
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRphdUYQ0F68J46Ur3pObAwZmuMSlByj_ZZ87bet93gA_GiF4RI9I6Yp9c5QP_JRTR61NFsSy0sFdjx/pub?gid=95433899&single=true&output=csv';

  const res = await fetch(SHEET_URL);
  const text = await res.text();

  // Parse CSV to JSON
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((h, i) => {
      const num = parseFloat(values[i]);
      obj[h] = isNaN(num) ? values[i] : num;
    });
    return obj;
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify(rows),
  };
}