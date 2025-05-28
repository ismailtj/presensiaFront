import React, { useState } from 'react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'élève',
  });
  const [message, setMessage] = useState('');

  const handleAddUser = () => {
    const { fullName, email, password, role } = form;

    if (!fullName || !email || !password) {
      setMessage('❌ Veuillez remplir tous les champs.');
      return;
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      role,
      authenticated: true,
    };

    setUsers([...users, newUser]);
    setMessage(`✅ ${role.charAt(0).toUpperCase() + role.slice(1)} ajouté avec succès`);
    setForm({ fullName: '', email: '', password: '', role: 'élève' });

    // Masquer le message après 3 secondes
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = (id) => {
    const userToDelete = users.find((user) => user.id === id);
    setUsers(users.filter((user) => user.id !== id));

    if (userToDelete) {
      setMessage(`🗑️ ${userToDelete.role.charAt(0).toUpperCase() + userToDelete.role.slice(1)} supprimé`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-6">Gestion des utilisateurs</h2>

      {/* Message de succès */}
      {message && (
        <div className="mb-4 text-center text-sm font-medium text-green-600">
          {message}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nom complet"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="px-4 py-2 border rounded-xl"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="px-4 py-2 border rounded-xl"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-4 py-2 border rounded-xl"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="élève">Élève</option>
          <option value="professeur">Professeur</option>
        </select>
      </div>

      <button
        onClick={handleAddUser}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Ajouter utilisateur
      </button>

      {/* Liste des utilisateurs */}
      <ul className="mt-8 space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 p-4 rounded-xl"
          >
            <div>
              <p className="font-bold text-gray-800">
                {user.fullName} ({user.role})
              </p>
              <p className="text-sm text-gray-600">Email : {user.email}</p>
              <p className="text-sm text-green-600">Authentifié : {user.authenticated ? 'Oui' : 'Non'}</p>
            </div>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="mt-2 md:mt-0 text-red-500 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
        {users.length === 0 && (
          <p className="text-gray-400 text-center mt-4">Aucun utilisateur ajouté.</p>
        )}
      </ul>
    </div>
  );
};

export default UserManager;
