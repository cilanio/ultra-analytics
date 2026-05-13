const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzASQECO-rygFTlseu0lFTcprJq_sXvmRawD0FguMHtdT7KqdmJzS9RkP0TzDTib8M2/exec';

/**
 * Loads match data from Google Sheets via Apps Script.
 * This is the ONLY place in the app that calls fetch.
 * @returns {Promise<Array>} Array of match objects
 */
export async function loadFromSheets() {
  const res = await fetch(APPS_SCRIPT_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) {
    throw new Error('Planilha vazia ou sem dados');
  }
  return data;
}