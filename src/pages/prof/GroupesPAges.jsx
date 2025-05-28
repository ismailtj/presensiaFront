// src/pages/GroupPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import useApiGet from '../../hooks/useApiGet'; 
import useUserApiGet from '../../hooks/useUserApiGet'; 

const GroupPage = () => {
    // Fetch groups
    const { data: groups, loading: groupsLoading, error: groupsError, refetch: refetchGroups } = useApiGet('/groups?populate=*'); 
    
    // Fetch users (potential delegates and students)
    const { data: users, loading: usersLoading, error: usersError } = useUserApiGet('/users'); // No default filter, get all users

    const token = localStorage.getItem('jwt');

    // States for add/edit group form
    const [formData, setFormData] = useState({
        name: '',
        delegue: '', // Will store the delegate user's ID
    });
    
    const [formError, setFormError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [notification, setNotification] = useState(null); 

    // States for Bootstrap modals
    const [groupModalInstance, setGroupModalInstance] = useState(null);
    const [studentsModalInstance, setStudentsModalInstance] = useState(null); // New state for students modal
    const [isEditMode, setIsEditMode] = useState(false); 
    const [currentGroupId, setCurrentGroupId] = useState(null); 
    const [currentStudents, setCurrentStudents] = useState([]); // State to hold students for the modal
    const [currentGroupName, setCurrentGroupName] = useState(''); // State to hold group name for students modal title

    // Initialize Bootstrap modals
    useEffect(() => {
        const groupModalElement = document.getElementById('groupModal');
        if (groupModalElement) {
            const bsModal = new Modal(groupModalElement);
            setGroupModalInstance(bsModal);
        }
        const studentsModalElement = document.getElementById('studentsModal'); // Initialize new modal
        if (studentsModalElement) {
            const bsStudentsModal = new Modal(studentsModalElement);
            setStudentsModalInstance(bsStudentsModal);
        }
    }, []); 

    // Handle automatic display/hide of notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null); 
            }, 5000); 
            return () => clearTimeout(timer); 
        }
    }, [notification]);

    // Handles form changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Opens add modal
    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentGroupId(null);
        setFormData({ // Reset form
            name: '',
            delegue: '',
        });
        setFormError(null); 
        setNotification(null); 
        if (groupModalInstance) {
            groupModalInstance.show();
        }
    };

    // Opens edit modal
    const openEditModal = (groupToEdit) => {
        setIsEditMode(true);
        setCurrentGroupId(groupToEdit.documentId);
        setFormData({ // Pre-fill with group data
            name: groupToEdit.name,
            delegue: groupToEdit.delegue ? groupToEdit.delegue.id : '', // Use delegate ID or empty string
        });
        setFormError(null); 
        setNotification(null); 
        if (groupModalInstance) {
            groupModalInstance.show();
        }
    };

    // Closes group modal
    const closeModal = () => {
        if (groupModalInstance) {
            groupModalInstance.hide();
        }
        setIsEditMode(false); 
        setCurrentGroupId(null);
        setFormData({ name: '', delegue: '' });
    };

    // Opens students modal
    const openStudentsModal = (group) => {
        setCurrentGroupName(group.name);
        // Assuming 'group.students' directly contains the student array from your API response
        // If your API returns a different structure or you need to fetch students separately for the group,
        // you would modify this logic. For example, if 'group.students' contains IDs, you'd filter your 'users' state.
        if (group.eleves && Array.isArray(group.eleves)) {
            setCurrentStudents(group.eleves);
        }  else {
            setCurrentStudents([]);
        }
        
        if (studentsModalInstance) {
            studentsModalInstance.show();
        }
    };

    // Closes students modal
    const closeStudentsModal = () => {
        if (studentsModalInstance) {
            studentsModalInstance.hide();
        }
        setCurrentStudents([]);
        setCurrentGroupName('');
    };

    // Handle form submission (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setFormError(null); 
        setNotification(null); 
        setIsSubmitting(true); 

        if (!formData.name.trim()) {
            setFormError('Le nom du groupe est requis.');
            setIsSubmitting(false);
            return;
        }
        
        if (!token) {
            setFormError('Authentification requise. Veuillez vous connecter.');
            setNotification({ type: 'danger', message: 'Authentification requise. Veuillez vous connecter.' });
            setIsSubmitting(false);
            return;
        }

        try {
            let response;
            // Payload similar to ModulePage, but for Group
            const payload = {
                "data": { // Ensure your API expects this nested "data" format
                    name: formData.name, 
                    delegue: formData.delegue ? formData.delegue : null, // Send delegate ID or null
                }
            };

            if (isEditMode) {
                response = await axios.put(
                    `http://localhost:1337/api/groups/${currentGroupId}`, 
                    payload,
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Groupe modifié avec succès !' });
            } else {
                response = await axios.post(
                    'http://localhost:1337/api/groups', 
                    payload,
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Groupe ajouté avec succès !' });
            }
            
            
            
            if (refetchGroups) {
                refetchGroups(); 
            }
            
            closeModal(); 

        } catch (err) {
            console.error('Erreur lors de l\'opération sur le groupe:', err);
            
            let errorMessage = 'Une erreur est survenue lors de l\'opération sur le groupe.';
            if (axios.isAxiosError(err)) {
                if (err.response && err.response.status === 401) {
                    errorMessage = 'Non autorisé. Votre session a peut-être expiré.';
                } else if (err.response && err.response.data && err.response.data.errors) {
                    const apiErrors = err.response.data.errors;
                    if (Array.isArray(apiErrors) && apiErrors.length > 0 && apiErrors[0].message) {
                        errorMessage = apiErrors[0].message;
                    } else if (typeof apiErrors === 'object' && Object.keys(apiErrors).length > 0) {
                        const firstErrorKey = Object.keys(apiErrors)[0];
                        errorMessage = apiErrors[firstErrorKey][0] || apiErrors[firstErrorKey].message || 'Erreur de validation.';
                    }
                } else if (err.response && err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = err.message || 'Problème de connexion API.';
                }
            }
            setFormError(errorMessage); 
            setNotification({ type: 'danger', message: errorMessage }); 

        } finally {
            setIsSubmitting(false); 
        }
    };

    // Handle group deletion
    const handleDelete = async (groupId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) {
            return; 
        }

        if (!token) {
            setNotification({ type: 'danger', message: 'Authentification requise pour supprimer. Veuillez vous connecter.' });
            return;
        }

        try {
            await axios.delete(`http://localhost:1337/api/groups/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setNotification({ type: 'success', message: 'Groupe supprimé avec succès !' });
            if (refetchGroups) {
                refetchGroups(); 
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du groupe:', err);
            let errorMessage = 'Une erreur est survenue lors de la suppression du groupe.';
            if (axios.isAxiosError(err)) {
                if (err.response && err.response.status === 401) {
                    errorMessage = 'Non autorisé. Votre session a peut-être expiré.';
                } else if (err.response && err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = err.message || 'Problème de connexion API lors de la suppression.';
                }
            }
            setNotification({ type: 'danger', message: errorMessage });
        }
    };

    // Utility function to find delegate username by ID
    const getDelegueUsername = (delegueId) => {
        if (!users) return 'Chargement...'; 
        const delegueUser = users.find(user => user.id === delegueId);
        return delegueUser ? `${delegueUser.username} (${delegueUser.email})` : 'Inconnu';
    };


    return (
        <div className="container-fluid p-4 bg-white rounded shadow-sm"> 
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3"> 
                <h2 className="h4 text-primary mb-0">Gestion des groupes</h2> 
                <button
                    type="button"
                    className="btn btn-success shadow-sm" 
                    onClick={openAddModal} 
                >
                    <i className="bi bi-plus-lg me-2"></i> Ajouter un groupe 
                </button>
            </div>

            {/* Notification Area */}
            {notification && (
                <div 
                    className={`alert alert-${notification.type} alert-dismissible fade show`} 
                    role="alert"
                >
                    {notification.message}
                    <button 
                        type="button" 
                        className="btn-close" 
                        data-bs-dismiss="alert" 
                        aria-label="Close"
                        onClick={() => setNotification(null)} 
                    ></button>
                </div>
            )}

            {/* Initial loading and error messages */}
            {groupsLoading && <p className="text-muted text-center py-5">Chargement des groupes...</p>}
            {(!groups && groupsError) && ( 
                <div className="alert alert-danger text-center my-4" role="alert">
                    Erreur de chargement des groupes : {groupsError.message || 'Problème de communication API.'}
                </div>
            )}

            {/* Groups Table */}
            {groups && ( 
                <div className="table-responsive"> 
                    <table className="table table-striped table-hover table-bordered align-middle"> 
                        <thead className="table-primary"> 
                            <tr>
                                <th scope="col">Nom du groupe</th>
                                <th scope="col">Délégué</th>
                                <th scope="col" className="text-center">Élèves</th> {/* New column for students */}
                                <th scope="col" className="text-center">Actions</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {groups.length === 0 ? ( 
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-4">Aucun groupe trouvé.</td> 
                                </tr>
                            ) : (
                                groups.map((group) => (
                                    <tr key={group.id}>
                                        <td>{group.name}</td> 
                                        <td>
                                            {group.delegue ? getDelegueUsername(group.delegue.id) : 'Aucun délégué'}
                                        </td> 
                                        <td className="text-center"> {/* New cell for students button */}
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openStudentsModal(group)}
                                                title="Voir les élèves"
                                            >
                                                <i className="bi bi-people-fill me-1"></i> Voir les élèves ({group.eleves ? group.eleves.length : 0})
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-info me-2" 
                                                title="Éditer"
                                                onClick={() => openEditModal(group)} 
                                            >
                                                <i className="bi bi-pencil-fill"></i> Éditer
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                title="Supprimer"
                                                onClick={() => handleDelete(group.documentId)} 
                                            >
                                                <i className="bi bi-trash-fill"></i> Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Group Modal */}
            <div className="modal fade" id="groupModal" tabIndex="-1" aria-labelledby="groupModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered"> 
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white"> 
                            <h5 className="modal-title" id="groupModalLabel">
                                {isEditMode ? 'Modifier le groupe' : 'Ajouter un nouveau groupe'}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {formError && (
                                    <div className="alert alert-danger" role="alert">
                                        {formError}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="groupName" className="form-label">Nom du groupe</label>
                                    <input
                                        type="text"
                                        className="form-control" 
                                        id="groupName"
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="delegue" className="form-label">Délégué (Étudiant)</label>
                                    <select
                                        className="form-select" 
                                        id="delegue"
                                        name="delegue" 
                                        value={formData.delegue}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting || usersLoading} 
                                    >
                                        <option value="">Sélectionner un délégué</option>
                                        {usersLoading && <option disabled>Chargement des étudiants...</option>}
                                        {usersError && <option disabled>Erreur de chargement des étudiants</option>}
                                        {users && users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.username} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {usersError && (
                                        <small className="text-danger mt-1 d-block">Impossible de charger la liste des délégués.</small>
                                    )}
                                </div>
                                
                                <div className="modal-footer d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary" 
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary" 
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Opération en cours...' : (isEditMode ? 'Modifier' : 'Ajouter')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List Modal */}
            <div className="modal fade" id="studentsModal" tabIndex="-1" aria-labelledby="studentsModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg"> 
                    <div className="modal-content">
                        <div className="modal-header bg-info text-white"> {/* Changed color to distinguish */}
                            <h5 className="modal-title" id="studentsModalLabel">
                                Élèves du groupe : {currentGroupName}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {currentStudents.length === 0 ? (
                                <p className="text-muted text-center">Aucun élève trouvé pour ce groupe.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">Nom Prénom</th>
                                                <th scope="col">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentStudents.map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.username}</td>
                                                    <td>{student.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeStudentsModal}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPage;