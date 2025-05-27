import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  const token = localStorage.getItem('jwt');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && location.pathname === '/login') {
      if (role === 'prof') navigate('/prof');
      else if (role === 'etudiant') navigate('/etudiant');
    }
  }, [token, role, location, navigate]);

  return !!token;
};

export default useAuth;