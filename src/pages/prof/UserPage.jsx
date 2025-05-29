import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import useUserApiGet from '../../hooks/useUserApiGet'; // Votre hook personnalisé
const apiUrl = import.meta.env.VITE_API_URL;

const UserPage = () => {
    const { data, loading, error, refetch } = useUserApiGet('/users'); // Assurez-vous que votre useApiGet gère le préfixe /api
    
    
    const token = localStorage.getItem('jwt'); // Assurez-vous que votre JWT est bien stocké ici

    // États pour le formulaire d'ajout/édition
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmed: true,
        type: 'etudiant', // Valeur par défaut
        provider: 'local',
        role:"1" // Valeur par défaut
    });
    
    const [formError, setFormError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // Nouveaux états pour les messages de notification (succès/erreur)
    const [notification, setNotification] = useState(null); 

    // État pour stocker l'instance de la modale Bootstrap
    const [userModalInstance, setUserModalInstance] = useState(null);

    // NOUVEAUX ÉTATS POUR L'ÉDITION
    const [isEditMode, setIsEditMode] = useState(false); 
    const [currentUserId, setCurrentUserId] = useState(null); 

    // Initialisation de l'instance de la modale Bootstrap
    useEffect(() => {
        const modalElement = document.getElementById('userModal');
        if (modalElement) {
            const bsModal = new Modal(modalElement);
            setUserModalInstance(bsModal);
        }
    }, []); 

    // Gère l'affichage/masquage automatique des notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null); 
            }, 5000); 
            return () => clearTimeout(timer); 
        }
    }, [notification]);

    // Gère les changements dans le formulaire
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Ouvre la modale en mode ajout
    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentUserId(null);
        setFormData({ // Réinitialise le formulaire
            username: '',
            email: '',
            password: '', // Le mot de passe ne sera rempli qu'à l'ajout ou si modifié en édition
            confirmed: true,
            type: 'etudiant',
            provider: 'local',
            role:"1",
        });
        setFormError(null); 
        setNotification(null); 
        if (userModalInstance) {
            userModalInstance.show();
        }
    };

    // Ouvre la modale en mode édition
    const openEditModal = (userToEdit) => {
        setIsEditMode(true);
        setCurrentUserId(userToEdit.id);
        setFormData({ // Pré-remplit avec les données de l'utilisateur
            username: userToEdit.username,
            email: userToEdit.email,
            password: '', // Ne pré-remplit pas le mot de passe pour des raisons de sécurité
            confirmed: userToEdit.confirmed,
            type: userToEdit.type,
            provider: userToEdit.provider,
            role:"1",
        });
        setFormError(null); 
        setNotification(null); 
        if (userModalInstance) {
            userModalInstance.show();
        }
    };

    // Ferme la modale
    const closeModal = () => {
        if (userModalInstance) {
            userModalInstance.hide();
        }
        setIsEditMode(false); 
        setCurrentUserId(null);
        setFormData({
            username: '', email: '', password: '',
            confirmed: true, type: 'etudiant', provider: 'local',role:"1"
        });
    };

    // Gestion de la soumission du formulaire (Ajout ou Édition)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setFormError(null); 
        setNotification(null); 
        setIsSubmitting(true); 

        // Validation de base
        if (!formData.username.trim() || !formData.email.trim() || (!isEditMode && !formData.password.trim())) {
            setFormError('Nom d\'utilisateur, email et mot de passe (pour l\'ajout) sont requis.');
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
            const payload = { ...formData };
            if (isEditMode && !payload.password) {
                delete payload.password; // Ne pas envoyer le champ password s'il n'est pas modifié en édition
            }

            if (isEditMode) {
                response = await axios.put(
                    `${apiUrl}/api/users/${currentUserId}`, 
                    payload,
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Utilisateur modifié avec succès !' });
            } else {
                response = await axios.post(
                    apiUrl+'/api/users', 
                    payload,
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Utilisateur ajouté avec succès !' });
            }
            
            
            
            if (refetch) {
                refetch(); 
            }
            
            closeModal(); 

        } catch (err) {
            console.error('Erreur lors de l\'opération sur l\'utilisateur:', err);
            
            let errorMessage = 'Une erreur est survenue lors de l\'opération sur l\'utilisateur.';
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

    // Gestion de la suppression d'un utilisateur
    const handleDelete = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            return; 
        }

        if (!token) {
            setNotification({ type: 'danger', message: 'Authentification requise pour supprimer. Veuillez vous connecter.' });
            return;
        }

        try {
            await axios.delete(`${apiUrl}/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setNotification({ type: 'success', message: 'Utilisateur supprimé avec succès !' });
            if (refetch) {
                refetch(); 
            }
        } catch (err) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', err);
            let errorMessage = 'Une erreur est survenue lors de la suppression de l\'utilisateur.';
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


    return (
        <div className="container-fluid p-4 bg-white rounded shadow-sm"> 
            {/* En-tête de la page */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3"> 
                <h2 className="h4 text-primary mb-0">Gestion des utilisateurs</h2> 
                <button
                    type="button"
                    className="btn btn-success shadow-sm" 
                    onClick={openAddModal} 
                >
                    <i className="bi bi-plus-lg me-2"></i> Ajouter un utilisateur 
                </button>
            </div>

            {/* Zone d'affichage des notifications (messages de succès/erreur) */}
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

            {/* Messages de chargement et d'erreur initiaux */}
            {loading && <p className="text-muted text-center py-5">Chargement des utilisateurs...</p>}
            {(!data && error) && ( 
                <div className="alert alert-danger text-center my-4" role="alert">
                    Erreur de chargement des utilisateurs : {error.message || 'Problème de communication API.'}
                </div>
            )}

            {/* Tableau des utilisateurs */}
            
            {data && ( 
                <div className="table-responsive"> 
                    <table className="table table-striped table-hover table-bordered align-middle"> 
                        <thead className="table-primary"> 
                            <tr>
                                <th scope="col">Nom prénom</th>
                                <th scope="col">Email</th>
                                <th scope="col">Type</th>
                                
                                <th scope="col" className="text-center">Actions</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? ( 
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">Aucun utilisateur trouvé.</td> 
                                </tr>
                            ) : (
                                data.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td> 
                                        <td>{user.email}</td> 
                                        <td>{user.type}</td> 
                                        
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-info me-2" 
                                                title="Éditer"
                                                onClick={() => openEditModal(user)} 
                                            >
                                                <i className="bi bi-pencil-fill"></i> Éditer
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                title="Supprimer"
                                                onClick={() => handleDelete(user.id)} 
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

            {/* Modale d'ajout/édition d'utilisateur */}
            <div className="modal fade" id="userModal" tabIndex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered"> 
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white"> 
                            <h5 className="modal-title" id="userModalLabel">
                                {isEditMode ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
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
                                    <label htmlFor="username" className="form-label">Nom et prénom d'utilisateur</label>
                                    <input
                                        type="text"
                                        className="form-control" 
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control" 
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Mot de passe {isEditMode && "(Laisser vide pour ne pas changer)"}</label>
                                    <input
                                        type="password"
                                        className="form-control" 
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        required={!isEditMode} 
                                        disabled={isSubmitting}
                                    />
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
        </div>
    );
};

export default UserPage;