import { useState, useEffect } from 'react';
import { loadFromSheets } from '../services/sheetsApi';

/**
 * Loads match data once on mount.
 * No component calls fetch directly — only this hook does via sheetsApi.
 */
export function useMatchData() {
  const [fullData, setFullData] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    loadFromSheets()
      .then((data) => { setFullData(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return { fullData, loading, error };
}