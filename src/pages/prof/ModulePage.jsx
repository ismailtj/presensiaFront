import React from 'react'
import useApiGet from '../../hooks/useApiGet';

const ModulePage = () => {
    
    const { data, loading, error } = useApiGet('/modules');

  return (
    <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Gestion des modules</h2>
        {loading && <p className="text-gray-500">Chargement...</p>}
        {!data && error && <p className="text-red-500">Erreur : {error.message}</p>}
        {data && (
            <table className="min-w-full bg-white border border-gray-200">
            <thead>
                <tr className="bg-blue-100 text-left">
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">Nom</th>
                <th className="py-2 px-4 border">Description</th>
                </tr>
            </thead>
            <tbody>
                {data.map((mod) => (
                <tr key={mod.id} className="hover:bg-blue-50">
                    <td className="py-2 px-4 border">{mod.id}</td>
                    <td className="py-2 px-4 border">{mod.name}</td>
                    <td className="py-2 px-4 border">{mod.description}</td>
                </tr>
                ))}
            </tbody>
            </table>
            )}
        </div>
  )
}

export default ModulePage