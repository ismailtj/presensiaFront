import React from 'react'
import { Link, Outlet } from 'react-router'

const ProfPage = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
    <header className="bg-blue-600 text-white py-4 px-8 shadow-md">
      <h1 className="text-xl font-bold">Espace Professeur</h1>
      <nav className="mt-2 space-x-4">
        <Link to="users" className="hover:underline">Utilisateurs</Link>
        <Link to="modules" className="hover:underline">Modules</Link>
        <Link to="seances" className="hover:underline">Séances</Link>
      </nav>
    </header>
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  </div>
  )
}

export default ProfPage