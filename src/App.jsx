import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import ProfPage from './pages/ProfPage';
import EtudiantPage from './pages/EtudiantPage';
import UserPage from './pages/prof/UserPage';
import SeancesPage from './pages/prof/SeancesPage';
import ModulePage from './pages/prof/ModulePage';
import GroupesPAges from './pages/prof/GroupesPAges';
import QrPage from './pages/prof/QrPage';




function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/prof" element={<ProfPage />} >
            <Route index element={<UserPage /> } />
            <Route path='users' element={<UserPage />} />
            <Route path='seances' element={<SeancesPage />} />
            <Route path='modules' element={<ModulePage />} />
            <Route path='groups' element={<GroupesPAges />} />
          </Route>
          <Route path="/qrcode/:id" element={<QrPage />} />
          <Route path="/etudiant" element={<EtudiantPage />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
