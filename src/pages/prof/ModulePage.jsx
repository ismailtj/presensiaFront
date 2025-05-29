import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap'; // Assure-toi que Bootstrap JS est correctement importé si tu l'utilises
import useApiGet from '../../hooks/useApiGet'; // Ton hook personnalisé
const apiUrl = import.meta.env.VITE_API_URL;

const ModulePage = () => {
    // 1. Déstructurer 'refetch' du hook useApiGet
    const { data: modules, loading, error, refetch } = useApiGet('/modules'); 
    
    const token = localStorage.getItem('jwt');

    // États pour le formulaire d'ajout/édition de module dans la modale
    const [newModuleName, setNewModuleName] = useState('');
    
    const [formError, setFormError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // Nouveaux états pour les messages de notification (succès/erreur)
    const [notification, setNotification] = useState(null); // { type: 'success' | 'danger', message: '...' }

    // État pour stocker l'instance de la modale Bootstrap
    const [addModuleModalInstance, setAddModuleModalInstance] = useState(null);

    // NOUVEAUX ÉTATS POUR L'ÉDITION
    const [isEditMode, setIsEditMode] = useState(false); // Vrai si on est en mode édition
    const [currentModuleId, setCurrentModuleId] = useState(null); // ID du module à éditer
    const [editModuleName, setEditModuleName] = useState(''); // Nom pré-rempli pour l'édition


    // Initialisation de l'instance de la modale Bootstrap une fois que le composant est monté
    useEffect(() => {
        const modalElement = document.getElementById('addModuleModal');
        if (modalElement) {
            const bsModal = new Modal(modalElement);
            setAddModuleModalInstance(bsModal);
        }
    }, []); 

    // Gère l'affichage/masquage automatique des notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null); // Masque la notification après 5 secondes
            }, 5000); 
            return () => clearTimeout(timer); // Nettoyage du timer
        }
    }, [notification]);

    // Ouvre la modale en mode ajout
    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentModuleId(null);
        setNewModuleName(''); // Vide le champ pour un nouvel ajout
        setFormError(null); 
        setNotification(null); 
        if (addModuleModalInstance) {
            addModuleModalInstance.show();
        }
    };

    // Ouvre la modale en mode édition
    const openEditModal = (moduleToEdit) => {
        
        setIsEditMode(true);
        setCurrentModuleId(moduleToEdit.documentId);
        setNewModuleName(moduleToEdit.Name); // Pré-remplit avec le nom actuel du module
        setFormError(null); 
        setNotification(null); 
        if (addModuleModalInstance) {
            addModuleModalInstance.show();
        }
    };

    // Ferme la modale
    const closeModal = () => {
        if (addModuleModalInstance) {
            addModuleModalInstance.hide();
        }
        setIsEditMode(false); // Réinitialise le mode après fermeture
        setCurrentModuleId(null);
        setNewModuleName('');
    };

    // Gestion de la soumission du formulaire (Ajout ou Édition)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setFormError(null); 
        setNotification(null); 
        setIsSubmitting(true); 

        if (!newModuleName.trim()) {
            setFormError('Le nom du module est requis.');
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
            if (isEditMode) {
                // Requête d'édition (PUT)
                response = await axios.put(
                    `${apiUrl}/api/modules/${currentModuleId}`, // URL d'édition
                    { 
                        "data": {
                            Name: newModuleName,
                        }
                    },
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Module modifié avec succès !' });
            } else {
                // Requête d'ajout (POST)
                response = await axios.post(
                    apiUrl+'/api/modules', // URL d'ajout
                    { 
                        "data": {
                            Name: newModuleName,
                        }
                    },
                    { 
                        headers: {
                            'Content-Type': 'application/json', 
                            Authorization: `Bearer ${token}`, 
                        },
                    }
                );
                setNotification({ type: 'success', message: 'Module ajouté avec succès !' });
            }
            
            
            
            if (refetch) {
                refetch(); 
            }
            
            closeModal(); // Ferme la modale

        } catch (err) {
            console.error('Erreur lors de l\'opération sur le module:', err);
            
            let errorMessage = 'Une erreur est survenue lors de l\'opération sur le module.';
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

    // Gestion de la suppression d'un module
    const handleDelete = async (moduleId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.')) {
            return; // Annule la suppression si l'utilisateur annule la confirmation
        }

        if (!token) {
            setNotification({ type: 'danger', message: 'Authentification requise pour supprimer. Veuillez vous connecter.' });
            return;
        }

        try {
            await axios.delete(`${apiUrl}/api/modules/${moduleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setNotification({ type: 'success', message: 'Module supprimé avec succès !' });
            if (refetch) {
                refetch(); // Rafraîchit la liste des modules
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du module:', err);
            let errorMessage = 'Une erreur est survenue lors de la suppression du module.';
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
                <h2 className="h4 text-primary mb-0">Gestion des modules</h2> 
                <button
                    type="button"
                    className="btn btn-success shadow-sm" 
                    onClick={openAddModal} // Utilise openAddModal
                >
                    <i className="bi bi-plus-lg me-2"></i> Ajouter un module 
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
                        onClick={() => setNotification(null)} // Permet de fermer manuellement
                    ></button>
                </div>
            )}
            {/* Fin de la zone de notification */}

            {/* Messages de chargement et d'erreur initiaux (quand la page se charge) */}
            {loading && <p className="text-muted text-center py-5">Chargement des modules...</p>}
            {/* Utilise 'modules' pour la condition d'affichage, qui devrait être un tableau même vide */}
            {(!modules && error) && ( 
                <div className="alert alert-danger text-center my-4" role="alert">
                    Erreur de chargement des modules : {error.message || 'Problème de communication API.'}
                </div>
            )}

            {/* Tableau des modules - Ne s'affiche que si les données sont présentes */}
            {modules && ( 
                <div className="table-responsive"> 
                    <table className="table table-striped table-hover table-bordered align-middle"> 
                        <thead className="table-primary"> 
                            <tr>
                                <th scope="col">Nom</th>
                                <th scope="col" className="text-center">Actions</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {/* Utilise 'modules' pour le mapping */}
                            {modules.length === 0 ? ( 
                                <tr>
                                    <td colSpan="2" className="text-center text-muted py-4">Aucun module trouvé.</td> {/* colspan à 2 car 2 colonnes maintenant */}
                                </tr>
                            ) : (
                                modules.map((mod) => (
                                    <tr key={mod.id}>
                                        <td>{mod.Name}</td> 
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-info me-2" 
                                                title="Éditer"
                                                onClick={() => openEditModal(mod)} // Ajout du onClick
                                            >
                                                <i className="bi bi-pencil-fill"></i> Éditer
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                title="Supprimer"
                                                onClick={() => handleDelete(mod.documentId)} // Ajout du onClick
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

            {/* Modale d'ajout/édition de module (structure Bootstrap) */}
            <div className="modal fade" id="addModuleModal" tabIndex="-1" aria-labelledby="addModuleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered"> 
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white"> 
                            <h5 className="modal-title" id="addModuleModalLabel">
                                {isEditMode ? 'Modifier le module' : 'Ajouter un nouveau module'}
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
                                    <label htmlFor="moduleName" className="form-label">Nom du module</label>
                                    <input
                                        type="text"
                                        className="form-control" 
                                        id="moduleName"
                                        value={newModuleName} // Le champ utilise newModuleName pour les deux modes
                                        onChange={(e) => setNewModuleName(e.target.value)}
                                        required
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

export default ModulePage;