import { useState, useEffect } from 'react';
import logo from "../../images/menara_holding.png";
import prefa from "../../images/menara_prefa.png";

const ChefDashboard = ({ userId, role, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [taches, setTaches] = useState([]);
  const [ouvriers, setOuvriers] = useState([]);
  const [journaux, setJournaux] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  // Add these state variables to your existing component
  const [chefChantier, setChefChantier] = useState(null);
  const [availableOuvriers, setAvailableOuvriers] = useState([]);
  const [selectedOuvriers, setSelectedOuvriers] = useState([]);
  // États pour les formulaires
  const [showAddTache, setShowAddTache] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [showAddAlerte, setShowAddAlerte] = useState(false);
  const [editingTache, setEditingTache] = useState(null);

  const [newTache, setNewTache] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    chantier_id: '',
    ouvriers: []
  });

  const [newJournal, setNewJournal] = useState({
    description: '',
    date_entree: new Date().toISOString().split('T')[0]
  });

  const [newAlerte, setNewAlerte] = useState({
    message: ''
  });

  // États pour le profil utilisateur
  const [userProfile, setUserProfile] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // États pour l'édition du profil
  const [editProfile, setEditProfile] = useState({
    nom: '',
    prenom: '',
    email: ''
  });

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Charger les données selon le menu actif
  useEffect(() => {
    loadData();
  }, [activeMenu]);

  // Charger le profil utilisateur quand on affiche le profil
  useEffect(() => {
    if (showProfile) {
      loadUserProfile();
    }
  }, [showProfile]);

  useEffect(() => {
    loadChefChantier();
  }, []);

    // Add this effect to load available workers when chantier is loaded
  useEffect(() => {
    if (chefChantier) {
      loadAvailableOuvriers(chefChantier.id_chantier);
    }
  }, [chefChantier]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeMenu) {
        case 'dashboard':
          await loadDashboard();
          break;
        case 'taches':
          await loadTaches();
          break;
        case 'ouvriers':
          await loadOuvriers();
          break;
        case 'journal':
          await loadJournaux();
          break;
        case 'alertes':
          await loadAlertes();
          break;
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    const response = await fetch(`http://localhost:5000/chef/dashboard?chef_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setDashboardData(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadTaches = async () => {
    const response = await fetch(`http://localhost:5000/chef/taches?chef_chantier_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setTaches(data.taches);
    } else {
      throw new Error(data.error);
    }
  };

  const loadOuvriers = async () => {
    const response = await fetch(`http://localhost:5000/chef/ouvriers?chef_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setOuvriers(data);
    } else {
      throw new Error(data.error);
    }
  };

  // Function to load available workers for a specific chantier
  const loadAvailableOuvriers = async (chantierId) => {
    try {
      const response = await fetch(`http://localhost:5000/chef/ouvriers-disponibles?chantier_id=${chantierId}`);
      const data = await response.json();
      if (response.ok) {
        setAvailableOuvriers(data);
        setSelectedOuvriers([]); // Reset selection when chantier changes
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des ouvriers disponibles');
      console.error(err);
    }
  };

  const loadJournaux = async () => {
    const response = await fetch(`http://localhost:5000/chef/journaux?chef_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setJournaux(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadAlertes = async () => {
    const response = await fetch(`http://localhost:5000/chef/alertes?chef_chantier_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setAlertes(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/user/profile/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data);
        setEditProfile({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email
        });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to load chef's chantier
  const loadChefChantier = async () => {
    try {
      const response = await fetch(`http://localhost:5000/chef/chantier?chef_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setChefChantier(data);
        // Auto-fill chantier_id in the form
        setNewTache(prev => ({...prev, chantier_id: data.id_chantier}));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement du chantier');
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/user/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowEditProfile(false);
        await loadUserProfile();
        setError('');
        alert('Profil mis à jour avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/change-password/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowChangePassword(false);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setError('');
        alert('Mot de passe modifié avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la modification du mot de passe');
    }
  };

  const handleAddTache = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (selectedOuvriers.length === 0) {
      setError('Vous devez sélectionner au moins un ouvrier');
      return;
    }

    if (newTache.date_debut && newTache.date_fin && new Date(newTache.date_fin) < new Date(newTache.date_debut)) {
      setError('La date de fin doit être postérieure à la date de début');
      return;
    }

    try {
      const taskData = {
        ...newTache,
        ouvriers: selectedOuvriers
      };

      const response = await fetch('http://localhost:5000/chef/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowAddTache(false);
        setNewTache({ titre: '', description: '', date_debut: '', date_fin: '', chantier_id: '', ouvriers: [] });
        setSelectedOuvriers([]);
        setError('');
        await loadTaches();
        
        // Notification de succès
        alert(`Tâche "${taskData.titre}" créée avec succès ! ${selectedOuvriers.length} ouvrier(s) assigné(s).`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la création de la tâche');
      console.error(err);
    }
  };
  const handleUpdateTache = async (tacheId, updateData) => {
    try {
      const response = await fetch(`http://localhost:5000/chef/tache/${tacheId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        setEditingTache(null);
        await loadTaches();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/chef/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJournal, userId })
      });
      
      if (response.ok) {
        setShowAddJournal(false);
        setNewJournal({ description: '', date_entree: new Date().toISOString().split('T')[0] });
        await loadJournaux();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout au journal');
    }
  };

  const handleAddAlerte = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/chef/alertes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAlerte, chef_chantier_id: userId })
      });
      
      if (response.ok) {
        setShowAddAlerte(false);
        setNewAlerte({ message: '' });
        await loadAlertes();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'alerte');
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'À venir': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Chef de Chantier</h2>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
      
      {dashboardData && (
        <div className="space-y-6">
          {/* Cartes statistiques principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tâches Totales</p>
                  <p className="text-3xl font-bold text-emerald-600">{dashboardData.taches.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Toutes les tâches</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tâches Terminées</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.taches.terminees}</p>
                  <p className="text-xs text-gray-500 mt-1">Complétées</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tâches En Cours</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.taches.en_cours}</p>
                  <p className="text-xs text-gray-500 mt-1">En progression</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ouvriers Présents</p>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData.nb_ouvriers_present}</p>
                  <p className="text-xs text-gray-500 mt-1">Aujourd'hui</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes actives */}
          {dashboardData.nb_alertes > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">
                  Vous avez {dashboardData.nb_alertes} alerte(s) active(s)
                </span>
                <button 
                  onClick={() => setActiveMenu('alertes')}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Voir les alertes →
                </button>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => {setActiveMenu('taches'); setShowAddTache(true);}}
                className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="font-medium text-gray-900">Nouvelle tâche</p>
              </button>
              <button
                onClick={() => {setActiveMenu('journal'); setShowAddJournal(true);}}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="font-medium text-gray-900">Ajouter au journal</p>
              </button>
              <button
                onClick={() => {setActiveMenu('alertes'); setShowAddAlerte(true);}}
                className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium text-gray-900">Nouvelle alerte</p>
              </button>
              <button
                onClick={() => setActiveMenu('ouvriers')}
                className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-medium text-gray-900">Voir ouvriers</p>
              </button>
            </div>
          </div>

          {/* Graphique de progression */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression des Tâches</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Terminées</span>
                  <span>{dashboardData.taches.total > 0 ? Math.round((dashboardData.taches.terminees / dashboardData.taches.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{width: `${dashboardData.taches.total > 0 ? (dashboardData.taches.terminees / dashboardData.taches.total) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>En cours</span>
                  <span>{dashboardData.taches.total > 0 ? Math.round((dashboardData.taches.en_cours / dashboardData.taches.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{width: `${dashboardData.taches.total > 0 ? (dashboardData.taches.en_cours / dashboardData.taches.total) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

const renderTaches = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h2>
      <button
        onClick={() => setShowAddTache(true)}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Nouvelle Tâche
      </button>
    </div>

    {showAddTache && (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Nouvelle Tâche</h3>
            {chefChantier && (
              <p className="text-sm text-gray-600 mt-1">
                Chantier: <span className="font-medium">{chefChantier.nom}</span> ({chefChantier.id_chantier})
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddTache(false);
              setNewTache({ titre: '', description: '', date_debut: '', date_fin: '', chantier_id: chefChantier?.id_chantier || '', ouvriers: [] });
              setSelectedOuvriers([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAddTache} className="space-y-6">
          {/* Titre de la tâche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la tâche *
            </label>
            <input
              type="text"
              placeholder="Ex: Installation des fondations"
              value={newTache.titre}
              onChange={(e) => setNewTache({...newTache, titre: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée
            </label>
            <textarea
              placeholder="Décrivez les détails de la tâche, les objectifs et les exigences particulières..."
              value={newTache.description}
              onChange={(e) => setNewTache({...newTache, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="4"
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début prévue
              </label>
              <input
                type="date"
                value={newTache.date_debut}
                onChange={(e) => setNewTache({...newTache, date_debut: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min={new Date().toISOString().split('T')[0]} // Empêche la sélection de dates passées
              />
              <p className="text-xs text-gray-500 mt-1">Date à laquelle la tâche devrait commencer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin estimée
              </label>
              <input
                type="date"
                value={newTache.date_fin}
                onChange={(e) => setNewTache({...newTache, date_fin: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min={newTache.date_debut || new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">Date limite pour terminer la tâche</p>
            </div>
          </div>

          {/* Sélection des ouvriers */}
          {chefChantier && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ouvriers assignés *
              </label>
              {availableOuvriers.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableOuvriers.map((ouvrier) => (
                    <label key={ouvrier.id_ouvrier} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedOuvriers.includes(ouvrier.id_ouvrier)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOuvriers([...selectedOuvriers, ouvrier.id_ouvrier]);
                          } else {
                            setSelectedOuvriers(selectedOuvriers.filter(id => id !== ouvrier.id_ouvrier));
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {ouvrier.prenom} {ouvrier.nom}
                          </span>
                          <span className="text-xs text-gray-500">ID: {ouvrier.id_ouvrier}</span>
                        </div>
                        <div className="text-xs text-gray-600">{ouvrier.specialite}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Aucun ouvrier disponible pour ce chantier</p>
                </div>
              )}
              {selectedOuvriers.length > 0 && (
                <p className="text-sm text-emerald-600 mt-2">
                  {selectedOuvriers.length} ouvrier(s) sélectionné(s)
                </p>
              )}
            </div>
          )}

          {/* Validation */}
          {newTache.date_debut && newTache.date_fin && new Date(newTache.date_fin) < new Date(newTache.date_debut) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">La date de fin doit être postérieure à la date de début</span>
              </div>
            </div>
          )}

          {!chefChantier && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-700">Chargement du chantier...</span>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={!newTache.titre || !chefChantier || selectedOuvriers.length === 0}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Créer la tâche
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddTache(false);
                setNewTache({ titre: '', description: '', date_debut: '', date_fin: '', chantier_id: chefChantier?.id_chantier || '', ouvriers: [] });
                setSelectedOuvriers([]);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )}

    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Titre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">État</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date début</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date fin</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {taches.map((tache) => (
              <tr key={tache.id_tache} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{tache.id_tache}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{tache.titre}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{tache.description}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getEtatColor(tache.etat)}`}>
                    {tache.etat}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{tache.date_debut}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{tache.date_fin}</td>
                <td className="px-6 py-4 text-sm">
                  <select
                    onChange={(e) => handleUpdateTache(tache.id_tache, { etat: e.target.value })}
                    defaultValue={tache.etat}
                    className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="À venir">À venir</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  const renderOuvriers = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Mes Ouvriers</h2>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Prénom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Spécialité</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Chantier</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Participe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ouvriers.map((ouvrier) => (
                <tr key={ouvrier.id_ouvrier} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.id_ouvrier}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.specialite}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.id_chantier}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      ouvrier.participe ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ouvrier.participe ? 'Oui' : 'Non'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Journal de Chantier</h2>
        <button
          onClick={() => setShowAddJournal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nouvelle Entrée
        </button>
      </div>

      {showAddJournal && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Nouvelle Entrée Journal</h3>
          <form onSubmit={handleAddJournal}>
            <div className="space-y-4">
              <input
                type="date"
                value={newJournal.date_entree}
                onChange={(e) => setNewJournal({...newJournal, date_entree: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description de l'activité du jour..."
                value={newJournal.description}
                onChange={(e) => setNewJournal({...newJournal, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Ajouter l'entrée
              </button>
              <button
                type="button"
                onClick={() => {setShowAddJournal(false); setNewJournal({ description: '', date_entree: new Date().toISOString().split('T')[0] });}}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {journaux.map((journal) => (
          <div key={journal.id_journal} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 21H7a2 2 0 01-2-2v-4a2 2 0 012-2h2M21 21h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2" />
                </svg>
                <span className="font-semibold text-gray-900">Entrée #{journal.id_journal}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(journal.date_entree).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{journal.description}</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Chantier: {journal.chantier_id}</span>
            </div>
          </div>
        ))}
        {journaux.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 21H7a2 2 0 01-2-2v-4a2 2 0 012-2h2M21 21h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2" />
            </svg>
            <p className="text-gray-500 text-lg">Aucune entrée dans le journal</p>
            <p className="text-gray-400 text-sm mt-1">Commencez par ajouter une nouvelle entrée</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAlertes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Alertes</h2>
        <button
          onClick={() => setShowAddAlerte(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Nouvelle Alerte
        </button>
      </div>

      {showAddAlerte && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Nouvelle Alerte</h3>
          <form onSubmit={handleAddAlerte}>
            <textarea
              placeholder="Message de l'alerte..."
              value={newAlerte.message}
              onChange={(e) => setNewAlerte({...newAlerte, message: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              rows="3"
              required
            />
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Créer l'alerte
              </button>
              <button
                type="button"
                onClick={() => {setShowAddAlerte(false); setNewAlerte({ message: '' });}}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {alertes.map((alerte) => (
          <div key={alerte.id} className={`rounded-lg shadow-lg p-6 ${
            alerte.active ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <svg className={`w-5 h-5 ${alerte.active ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className={`font-semibold ${alerte.active ? 'text-red-900' : 'text-gray-700'}`}>
                  Alerte #{alerte.id}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  alerte.active ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {alerte.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(alerte.date_alerte).toLocaleDateString('fr-FR')} à {new Date(alerte.date_alerte).toLocaleTimeString('fr-FR')}
              </span>
            </div>
            <p className={`leading-relaxed ${alerte.active ? 'text-red-800' : 'text-gray-600'}`}>
              {alerte.message}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Chantier: {alerte.chantier_id}</span>
            </div>
          </div>
        ))}
        {alertes.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-500 text-lg">Aucune alerte</p>
            <p className="text-gray-400 text-sm mt-1">Les alertes apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Mon Profil</h2>
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : userProfile ? (
        <div className="space-y-6">
          {/* Informations du profil */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userProfile.prenom?.charAt(0)}{userProfile.nom?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {userProfile.prenom} {userProfile.nom}
                </h3>
                <p className="text-gray-600">{userProfile.email}</p>
                <p className="text-emerald-600 font-medium">ID: {userProfile.id} | Rôle: {userProfile.role}</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Modifier le profil
                </button>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Changer le mot de passe
                </button>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations personnelles</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{userProfile.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prénom:</span>
                    <span className="font-medium">{userProfile.prenom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{userProfile.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Informations système</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Utilisateur:</span>
                    <span className="font-medium">{userProfile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rôle:</span>
                    <span className="font-medium capitalize">{userProfile.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Actif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">Connexion aujourd'hui à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-600">Consultation du dashboard chef de chantier</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Gestion des tâches et ouvriers</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-500">Impossible de charger le profil</p>
        </div>
      )}

      {/* Modal Modifier Profil */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Modifier le Profil</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={editProfile.nom}
                    onChange={(e) => setEditProfile({...editProfile, nom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={editProfile.prenom}
                    onChange={(e) => setEditProfile({...editProfile, prenom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditProfile({
                      nom: userProfile?.nom || '',
                      prenom: userProfile?.prenom || '',
                      email: userProfile?.email || ''
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Changer Mot de Passe */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Changer le Mot de Passe</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel *</label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Au moins 6 caractères</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Changer le mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      {/* Header avec logos */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            <img src={logo} alt="Menara Holding" className="h-20 object-contain" />
            <div className="w-px h-8 bg-gray-300"></div>
            <img src={prefa} alt="Menara Préfa" className="h-12 object-contain" />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Connecté en tant que</p>
            <p className="font-semibold text-gray-900">{role} #{userId}</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen relative">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-8">
              <span className="text-emerald-600">Chef</span> <span className="text-blue-600">Panel</span>
            </h1>
            
            <nav className="space-y-2">
              <button
                onClick={() => {setActiveMenu('dashboard'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'dashboard' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={() => {setActiveMenu('taches'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'taches' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2 a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tâches
              </button>

              <button
                onClick={() => {setActiveMenu('ouvriers'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'ouvriers' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ouvriers
              </button>

              <button
                onClick={() => {setActiveMenu('journal'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'journal' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 21H7a2 2 0 01-2-2v-4a2 2 0 012-2h2M21 21h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2" />
                </svg>
                Journal
              </button>

              <button
                onClick={() => {setActiveMenu('alertes'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'alertes' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alertes
              </button>
            </nav>

            {/* Profil et Déconnexion en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors mb-2 ${
                  showProfile 
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon Profil
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <>
              {showProfile && renderProfile()}
              {!showProfile && activeMenu === 'dashboard' && renderDashboard()}
              {!showProfile && activeMenu === 'taches' && renderTaches()}
              {!showProfile && activeMenu === 'ouvriers' && renderOuvriers()}
              {!showProfile && activeMenu === 'journal' && renderJournal()}
              {!showProfile && activeMenu === 'alertes' && renderAlertes()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;