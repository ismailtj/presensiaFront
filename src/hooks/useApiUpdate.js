import { useState, useEffect } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const useApiUpdate = (endpoint, options = {}, autoLoad = true,load,id) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(autoLoad);
    const [error, setError] = useState(null);
  
    const token = localStorage.getItem('jwt');
  
    const fetchData = async () => {
      setLoading(true);
      try {
        
        const res = await axios.put(apiUrl+'/api'+endpoint+'/'+id,
            {
                data:load
            } ,
            {
                headers: {
                Authorization:  `Bearer ${token}`
                }
            }, options);
        
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

}

export default useApiUpdate