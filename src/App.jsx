import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import ProfPage from './pages/ProfPage';
import EtudiantPage from './pages/EtudiantPage';




// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route element={<PrivateRoute />}>
//           <Route path="/prof" element={<ProfPage />} />
//           <Route path="/etudiant" element={<EtudiantPage />} />
//         </Route>

//         <Route path="*" element={<Login />} />
//       </Routes>
//     </Router>
//     </>
//   )
// }

// export default App

import React from 'react';
import UserManager from './components/UserManager';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <UserManager />
    </div>
  );
};

export default App;
