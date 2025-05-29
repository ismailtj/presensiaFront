import React, { useEffect, useState } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const getStatutPresence = (emargement, heureDebut, heureFin) => {
  if (!emargement) return 'absent';
  

  

  const pointage = new Date(emargement.pointage);
  const debut = new Date(heureDebut);
  const fin = new Date(heureFin);
  const limitePonctualite = new Date(debut.getTime() + 20 * 60000);

  if (pointage >= debut && pointage <= limitePonctualite) return 'present';
  if (pointage > limitePonctualite && pointage <= fin) return 'retard';
  return 'absent';
};

const badgeColor = {
  present: 'bg-green-600',
  retard: 'bg-yellow-500',
  absent: 'bg-red-600'
};

const SeanceStudentModal = ({ seance, groupId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [emargements, setEmargements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, emargementsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/groups/${groupId}?populate=*`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      }  ),
          axios.get(`${apiUrl}/api/emargements?populate=*&filters[seance][id][$eq]=${seance.id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      })
        ]);

        setStudents(studentsRes.data.data.eleves);
        setEmargements(emargementsRes.data.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
      }
    };

    if (seance && groupId) {
      fetchData();
    }
  }, [seance, groupId]);

  const renderBadge = (statut) => (
    <span className={`px-2 py-1 text-white rounded ${badgeColor[statut]}`}>{statut}</span>
  );

  return (
    <div className="fixed inset-0 bg-[#000000d1] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Liste des élèves - {seance?.Date}</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {students.map(eleve => {
              const emargement = emargements.find(e => e.eleve?.id === eleve.id);
              const statut = getStatutPresence(
                emargement,
                `${seance.Date}T${seance.debut}`,
                `${seance.Date}T${seance.fin}`
              );
              return (
                <tr key={eleve.id} className="border-t">
                  <td className="px-4 py-2">{eleve?.username}</td>
                  <td className="px-4 py-2">{renderBadge(statut)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default SeanceStudentModal;
