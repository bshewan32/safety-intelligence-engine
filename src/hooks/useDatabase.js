import { useState, useEffect } from 'react';

export function useDatabase(sql, params = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await window.electron.db.query(sql, params);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sql, JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await window.electron.db.query(sql, params);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

export async function executeDB(sql, params = []) {
  return await window.electron.db.execute(sql, params);
}