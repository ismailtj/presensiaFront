import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // <-- NOUVEL ÉTAT DE CHARGEMENT
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Réinitialiser l'erreur précédente
    setIsLoading(true); // <-- ACTIVER LE CHARGEMENT

    try {
      const res = await axios.post(apiUrl + '/api/auth/local', {
        identifier,
        password,
      });
      const { jwt, user } = res.data;
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('role', user.type);
      localStorage.setItem('id', user.id);

      if (user.type === 'prof') { // Utilisez '===' pour la comparaison stricte
        navigate('/prof');
      } else {
        navigate('/etudiant');
      }
    } catch (err) {
      setError("Identifiants incorrects");
    } finally {
      setIsLoading(false); // <-- DÉSACTIVER LE CHARGEMENT, que la requête réussisse ou échoue
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-semibold text-center ">Connexion</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          type="text"
          placeholder="Email ou nom d'utilisateur"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isLoading} // <-- DÉSACTIVER L'INPUT LORS DU CHARGEMENT
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isLoading} // <-- DÉSACTIVER L'INPUT LORS DU CHARGEMENT
        />
        <button
          type="submit"
          className={`w-full py-2 rounded ${
            isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          disabled={isLoading} // <-- DÉSACTIVER LE BOUTON LORS DU CHARGEMENT
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'} {/* <-- TEXTE DYNAMIQUE */}
        </button>
      </form>
    </div>
  );
};

export default Login;