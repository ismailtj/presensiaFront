import React, { useState } from 'react';
import { Link, Outlet, useLocation,useNavigate } from 'react-router-dom';



const ProfPage = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Utilisateurs', path: 'users' },
    { name: 'Modules', path: 'modules' },
    { name: 'Groupes', path: 'groups' },
    { name: 'Séances', path: 'seances' },
  ];

  // La fonction isActive vérifie si le chemin actuel contient le 'path' du lien,
  // ce qui est utile pour les routes imbriquées (ex: /prof/users vs /prof/users/1)
  const isActive = (path) => pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('jwt'); // ou sessionStorage selon ton stockage
    localStorage.removeItem('id'); // ou sessionStorage selon ton stockage
    localStorage.removeItem('role'); // ou sessionStorage selon ton stockage
    navigate('/login'); // redirige vers la page de connexion
  };

  return (
    
    // Conteneur principal: prend toute la hauteur de l'écran et utilise un dégradé de fond doux
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">

      {/* Navbar - En-tête qui prend toute la largeur */}
      <header className="w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg z-50 fixed top-0 left-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Titre (aligné à gauche) */}
            <h1 className="text-2xl font-bold tracking-wide  **hidden md:block**">👨‍🏫</h1>

            {/* Navigation pour écrans Desktop (cachée sur mobile) */}
            <nav className="hidden md:flex space-x-8 text-lg font-medium">
              {navLinks.map(({ name, path }) => (
                <Link
                  key={path}
                  to={path}
                  // Classes pour le style et l'effet au survol, avec un indicateur d'active
                  className={`relative text-light transition-colors duration-300 hover:text-yellow-300
                  ${isActive(path) ? ' font-semibold' : ''}`}
                >
                  {name}
                  {/* Petit indicateur visuel de la page active (facultatif) */}
                  {isActive(path) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-yellow-300 transform scale-x-75 transition-transform duration-300 group-hover:scale-x-100"></span>
                  )}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Déconnexion
              </button>
            </nav>

            {/* Bouton du menu mobile (affiché seulement sur mobile) */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="focus:outline-none text-white hover:text-yellow-300 transition-colors duration-300"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {open ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" // Icône croix
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" // Icône hamburger
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile dépliant */}
        {open && (
          <div className="md:hidden bg-blue-700 px-4 pb-4 pt-2 space-y-2 transition-all duration-300 ease-in-out transform origin-top animate-slide-down">
            {navLinks.map(({ name, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)} // Ferme le menu après un clic
                className={`block py-2 rounded px-3 text-base font-medium
                  ${isActive(path)
                    ? 'bg-yellow-400 text-blue-800 font-semibold' // Style actif
                    : 'text-white hover:bg-blue-500' // Style inactif au survol
                  }`}
              >
                {name}
              </Link>
            ))}
          </div>
        )}
      </header>

      
      <main className="flex-1 p-6 mt-16 min-vw-100"> 
        <Outlet /> 
      </main>
    </div>
  );
};

export default ProfPage;
