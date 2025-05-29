import React, { useState } from 'react';
import useApiGet from '../../hooks/useApiGet';
import useApiUpdate from '../../hooks/useApiUpdate';
import axios from 'axios';
import SeanceStudentModal from '../../components/SeanceStudentModal';
const apiUrl = import.meta.env.VITE_API_URL;

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const SeancesPage = () => {
  const { data, loading, error } = useApiGet('/seances/?populate=*');
  const { data:datagroups, loading:loadinggroups, error:errorgroups } = useApiGet('/groups/?populate=*');
  const { data:datamodules, loading:loadingmodules, error:errormodules } = useApiGet('/modules/?populate=*');


  const [showModal, setShowModal] = useState(false);
  const [editSeance, setEditSeance] = useState(null);
  const [form, setForm] = useState({
    Date: '',
    debut: '08:00:00',
    fin: '10:00:00',
    moduleId: '',
    groupId: ''
  });
  const [selectedSeance, setselectedSeance] = useState()
  const [showList, setShowList] = useState(false);

  const clearForm = () => {
    setForm({
      Date: '',
    debut: '08:00:00',
    fin: '10:00:00',
    moduleId: '',
    groupId: ''
  });
}
  

  const handleSubmit = async () => {
    const payload = {
      data: {
        Date: form.Date,
        debut: form.debut+ ':00',
        fin: form.fin+ ':00',
        module: form.moduleId,
        group: form.groupId
      }
    };
    if (editSeance) {
      await axios.put(`${apiUrl}/api/seances/${editSeance.documentId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
    } else {
      await axios.post(apiUrl+'/api/seances', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
    }
    setShowModal(false);
    setEditSeance(null);
    setForm({ Date: '', debut: '08:00:00', fin: '10:00:00', moduleId: '', groupId: '' });
    window.location.reload();
  };

  const handleEdit = (seance) => {
    setEditSeance(seance);
    
    setForm({
      Date: seance.Date,
      debut: seance.debut.slice(0, 5),
      fin: seance.fin.slice(0, 5),
      moduleId: seance.module?.documentId,
      groupId: seance.group?.documentId
    });
    setShowModal(true);
  };


  if (loading) return <p className="text-gray-500">Chargement des séances...</p>;
  if (error) return <p className="text-red-500">Erreur : {error.message}</p>;
  
  return (
    <div className="bg-white p-6 rounded shadow-md">
    <h2 className="text-2xl font-semibold text-blue-700 mb-4">Séances</h2>
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Liste des séances</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ajouter une séance
        </button>
      </div>

      <div className="space-y-4">
        <table className="table table-striped table-hover table-bordered align-middle"> 
                        <thead className="table-primary"> 
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Heure</th>
                                <th scope="col">Module</th>
                                <th scope="col">Groupe</th>
                                
                                <th scope="col" className="text-center">Actions</th> 
                            </tr>
                        </thead>
                        <tbody>

                        
        {data?.length > 0 ? (
          data.map(seance => (
            <tr key={seance.id}>
                                        <td>{seance.Date}</td> 
                                        <td>{seance.debut.slice(0, 5)} - {seance.fin.slice(0, 5)}</td> 
                                        <td>{seance.module?.Name}</td> 
                                        <td>{seance.group?.name}</td> 
                                        
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-info me-2" 
                                                title="Éditer"
                                                onClick={() => handleEdit(seance)} 
                                            >
                                                <i className="bi bi-pencil-fill"></i> Éditer
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger me-2" 
                                                title="Supprimer"
                                                onClick={async () => { await axios.delete(`${apiUrl}/api/seances/${seance.documentId}`, {
                                                headers: {
                                                  Authorization: `Bearer ${localStorage.getItem('jwt')}`
                                                }});window.location.reload(); }} 
                                                  >
                                                <i className="bi bi-trash-fill"></i> Supprimer
                                            </button>
                                            <button 
                                                className="btn btn-sm  btn-info  me-2" 
                                                title="QR Code"
                                               onClick={() => window.open(`/qrcode/${seance.documentId}`, '_blank')}
                                                  >
                                                <i className="bi bi-trash-fill"></i> Afficher QR
                                            </button>
                                            <button 
                                                className="btn btn-sm  btn-primary  me-2" 
                                                title="Afficher List"
                                               onClick={() => {
                                                  setselectedSeance(seance);
                                                  setShowList(true);
                                               }}
                                                  >
                                                <i className="bi bi-trash-fill"></i> Afficher List
                                            </button>
                                        </td>
                                    </tr>

          ))
        ) : (
          <td colSpan="5" className="text-center text-muted py-4">Aucune séance disponible.</td>
        )}
        </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#000000d1] bg-opacity-30 flex items-center justify-center z-50"> 
          
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editSeance ? 'Modifier' : 'Ajouter'} une séance</h3>

            <div className="space-y-3">
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={form.Date}
                onChange={(e) => setForm({ ...form, Date: e.target.value })}
              />

              <div className="flex space-x-2">
                <select
                  className="w-1/2 p-2 border rounded"
                  value={form.debut}
                  onChange={(e) => setForm({ ...form, debut: e.target.value })}
                >
                  {HOURS.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                </select>

                <select
                  className="w-1/2 p-2 border rounded"
                  value={form.fin}
                  onChange={(e) => setForm({ ...form, fin: e.target.value })}
                >
                  {HOURS.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <select
                  className="w-1/2 p-2 border rounded"
                  value={form.moduleId}
                  onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                >
                  <option value={""}>--</option>
                  {datamodules?.map(mod => <option key={mod.id} value={mod.documentId}>{mod.Name}</option>)}
                </select>

                <select
                  className="w-1/2 p-2 border rounded"
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                >
                  <option value={""}>--</option>
                  {datagroups?.map(gr => <option key={gr.id} value={gr.documentId}>{gr.name}</option>)}
                </select>
              </div>
              

              {/* <input
                type="text"
                placeholder="ID du module"
                className="w-full p-2 border rounded"
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
              />
              <input
                type="text"
                placeholder="ID du groupe"
                className="w-full p-2 border rounded"
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value })}
              /> */}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >Valider</button>
                <button
                  onClick={() => { setShowModal(false); setEditSeance(null);; clearForm(); }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showList && (
      <SeanceStudentModal
        seance={selectedSeance}
        groupId={selectedSeance.group?.documentId}
        onClose={() => setShowList(false)}
      />
    )}
    </div>
  </div>
  )
}

export default SeancesPage