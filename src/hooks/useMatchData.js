import { useState, useEffect } from 'react';
import { loadFromSheets } from '../services/sheetsApi';

export function useMatchData() {
  const [allData,  setAllData]  = useState({ brasileirao: [], 'copa-brasil': [], libertadores: [] });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [br, copa, libert] = await Promise.all([
          loadFromSheets('brasileirao'),
          loadFromSheets('copa-brasil'),
          loadFromSheets('libertadores'),
        ]);
        setAllData({ brasileirao: br, 'copa-brasil': copa, libertadores: libert });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { allData, loading, error };
}