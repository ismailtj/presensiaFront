import { useState, useEffect } from 'react';
import axios from 'axios';

const useApiGet = (endpoint, options = {}, autoLoad = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('jwt');

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const res = await axios.get('http://localhost:1337/api'+endpoint, {
        headers: {
          Authorization:  `Bearer ${token}`
        }
      }, options);
      console.log(res);
      
      setData(res.data.data);
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

export default useApiGet;