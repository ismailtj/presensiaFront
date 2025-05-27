import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (endpoint, options = {}, autoLoad = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios(endpoint, options);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;