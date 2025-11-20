import { useState, useEffect } from 'react';
import logo from "../../images/menara_holding.png";
import prefa from "../../images/menara_prefa.png";

const ResponsableDashboard = ({ userId, role, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [chantiers, setChantiers] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState(null);
  const [chantierDetails, setChantierDetails] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [taches, setTaches] = useState([]);
  const [journal, setJournal] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [alerteCount, setAlerteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  // Ajoutez ces nouveaux états au composant ResponsableDashboard
  const [showManageOuvriers, setShowManageOuvriers] = useState(false);
  const [chantierOuvriers, setChantierOuvriers] = useState([]);
  const [showDeleteChantier, setShowDeleteChantier] = useState(false);

  // Nouveaux états pour les ouvriers et chefs disponibles
  const [ouvriersDisponibles, setOuvriersDisponibles] = useState([]);
  const [chefsDisponibles, setChefsDisponibles] = useState([]);
  
  // États pour les formulaires
  const [showAddChantier, setShowAddChantier] = useState(false);
  const [showEditChantier, setShowEditChantier] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchAlertes, setSearchAlertes] = useState('');

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

  const [newChantier, setNewChantier] = useState({
    nom: '',
    description: '',
    localisation: '',
    etat: 'À venir',
    date_debut: '',
    date_fin_estimee: '',
    chef_chantier_id: '',
    budget: '',
    ouvriers: []
  });
const [editChantier, setEditChantier] = useState({
  nom: '',
  description: '',
  localisation: '',
  etat: '',
  date_debut: '',
  date_fin_estimee: '',
  budget: '',
  chef_chantier_id: ''
});
  const [reportData, setReportData] = useState({
    description: '',
    format: 'csv'
  });

  // Charger les données selon le menu actif
  useEffect(() => {
    loadData();
  }, [activeMenu]);

// Effet pour recharger automatiquement les alertes quand la recherche change
  useEffect(() => {
    if (activeMenu === 'alertes') {
      const delayedSearch = setTimeout(() => {
        loadAlertes();
      }, 300); // Délai de 300ms pour éviter trop de requêtes
      
      return () => clearTimeout(delayedSearch);
    }
  }, [searchAlertes, activeMenu]);

  // Charger le nombre d'alertes au démarrage
  useEffect(() => {
    loadAlertCount();
  }, []);

 // Charger les ouvriers et chefs disponibles quand on ouvre le modal d'ajout
  useEffect(() => {
    if (showAddChantier) {
      loadOuvriersDisponibles();
      loadChefsDisponibles();
    }
  }, [showAddChantier]);

    // Charger le profil utilisateur quand on affiche le profil
  useEffect(() => {
    if (showProfile) {
      loadUserProfile();
    }
  }, [showProfile]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeMenu) {
        case 'dashboard':
          await loadDashboard();
          break;
        case 'chantiers':
          await loadChantiers();
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
const handleArchiveChantier = async (chantierId) => {
  console.log('handleArchiveChantier appelée avec ID:', chantierId);
  
  try {
    console.log('Envoi de la requête DELETE vers:', `http://localhost:5000/chantier/${chantierId}`);
    
    const response = await fetch(`http://localhost:5000/chantier/${chantierId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse reçue:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Données reçues:', data);
    
    if (response.ok) {
      console.log('Succès - fermeture du modal et rechargement');
      setShowDeleteChantier(false);
      setSelectedChantier(null);
      await loadChantiers();
      setError('');
      alert('Chantier archivé avec succès !');
    } else {
      console.error('Erreur backend:', data.error);
      setError(data.error);
    }
  } catch (err) {
    console.error('Erreur lors de la requête:', err);
    setError('Erreur lors de l\'archivage du chantier: ' + err.message);
  }
};
  const handleAddOuvrierToChantier = async (chantierId, ouvrierId) => {
  try {
    const response = await fetch(`http://localhost:5000/chantier/${chantierId}/ouvriers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ouvrier_id: ouvrierId })
    });
    
    const data = await response.json();
    if (response.ok) {
      await loadChantierOuvriers(chantierId);
      await loadOuvriersDisponibles(); // Recharger les ouvriers disponibles
      setError('');
      alert('Ouvrier ajouté au chantier avec succès !');
    } else {
      setError(data.error);
    }
  } catch (err) {
    setError('Erreur lors de l\'ajout de l\'ouvrier');
  }
};

const loadChantierOuvriers = async (chantierId) => {
  try {
    const response = await fetch(`http://localhost:5000/chantier/${chantierId}/ouvriers`);
    const data = await response.json();
    if (response.ok) {
      setChantierOuvriers(data.ouvriers);
    } else {
      setError(data.error);
    }
  } catch (err) {
    setError('Erreur lors du chargement des ouvriers du chantier');
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


const loadOuvriersDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:5000/ouvriers/disponibles');
      const data = await response.json();
      if (response.ok) {
        setOuvriersDisponibles(data.ouvriers);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des ouvriers:', err);
    }
  };

   const loadChefsDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:5000/chefs/disponibles');
      const data = await response.json();
      if (response.ok) {
        setChefsDisponibles(data.chefs);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des chefs:', err);
    }
  };

  const loadDashboard = async () => {
    const response = await fetch(`http://localhost:5000/responsable/dashboard`);
    const data = await response.json();
    if (response.ok) {
      setDashboardData(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadChantiers = async () => {
    const response = await fetch(`http://localhost:5000/responsable/chantiers`);
    const data = await response.json();
    if (response.ok) {
      setChantiers(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadChantierDetails = async (chantierId) => {
    const response = await fetch(`http://localhost:5000/responsable/chantier/${chantierId}`);
    const data = await response.json();
    if (response.ok) {
      setChantierDetails(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadAffectations = async (chantierId) => {
    const response = await fetch(`http://localhost:5000/responsable/chantier/${chantierId}/affectations`);
    const data = await response.json();
    if (response.ok) {
      setAffectations(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadTaches = async (chantierId) => {
    const response = await fetch(`http://localhost:5000/responsable/chantier/${chantierId}/taches`);
    const data = await response.json();
    if (response.ok) {
      setTaches(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadJournal = async (chantierId) => {
    const response = await fetch(`http://localhost:5000/responsable/chantier/${chantierId}/journal`);
    const data = await response.json();
    if (response.ok) {
      setJournal(data);
    } else {
      throw new Error(data.error);
    }
  };

const loadAlertes = async () => {
    const url = searchAlertes 
      ? `http://localhost:5000/responsable/alertes?search=${encodeURIComponent(searchAlertes)}`
      : `http://localhost:5000/responsable/alertes`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      setAlertes(Array.isArray(data) ? data : data.alertes || []);
    } else {
      throw new Error(data.error);
    }
  };

  const loadAlertCount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/responsable/alertes/count`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAlerteCount(data.count);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du nombre d\'alertes:', err);
    }
  };

  const handleAddChantier = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/chantier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newChantier,
          responsable_id: userId
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowAddChantier(false);
        setNewChantier({
          nom: '', description: '', localisation: '', etat: 'À venir',
          date_debut: '', date_fin_estimee: '', chef_chantier_id: '', budget: '', ouvriers: []
        });
        await loadChantiers();
        setError('');
        alert('Chantier ajouté avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du chantier');
    }
  };

const handleEditChantier = async (e) => {
    e.preventDefault();
    if (!selectedChantier) return;
    
    // Filtrer les champs vides pour n'envoyer que ceux qui ont des valeurs
    const dataToSend = {};
    if (editChantier.etat && editChantier.etat.trim() !== '') {
      dataToSend.etat = editChantier.etat;
    }
    if (editChantier.chef_chantier_id && editChantier.chef_chantier_id.trim() !== '') {
      dataToSend.chef_chantier_id = editChantier.chef_chantier_id;
    }
    
    // Vérifier qu'au moins un champ est fourni
    if (Object.keys(dataToSend).length === 0) {
      setError('Veuillez sélectionner au moins un champ à modifier');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/chantierrespo/${selectedChantier.ID_CHANTIER}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowEditChantier(false);
        setSelectedChantier(null);
        await loadChantiers();
        setError('');
        alert('Chantier mis à jour avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la modification du chantier');
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!selectedChantier) return;

    try {
      const response = await fetch(`http://localhost:5000/responsable/chantier/${selectedChantier.ID_CHANTIER}/generer_rapport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          genere_par: userId
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `rapport_${selectedChantier.ID_CHANTIER}.${reportData.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setShowReportModal(false);
        setReportData({ description: '', format: 'csv' });
        alert('Rapport généré avec succès !');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la génération du rapport');
      }
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
    }
  };

  const handleUpdateAlertStatus = async (alertId, active) => {
    try {
      const response = await fetch(`http://localhost:5000/responsable/alertes/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });

      if (response.ok) {
        await loadAlertes();
        await loadAlertCount();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  // Fonction pour vider le filtre de recherche
  const clearSearchAlertes = () => {
    setSearchAlertes('');
  };

const handleOuvrierToggle = (ouvrierId) => {
    setNewChantier(prev => ({
      ...prev,
      ouvriers: prev.ouvriers.includes(ouvrierId)
        ? prev.ouvriers.filter(id => id !== ouvrierId)
        : [...prev.ouvriers, ouvrierId]
    }));
  };

// Ajoutez cette fonction dans votre composant ResponsableDashboard
// À placer avec les autres fonctions de gestion des ouvriers

const handleRemoveOuvrierFromChantier = async (chantierId, ouvrierId) => {
  try {
    const response = await fetch(`http://localhost:5000/chantier/${chantierId}/ouvriers/${ouvrierId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    if (response.ok) {
      // Recharger les listes après suppression
      await loadChantierOuvriers(chantierId);
      await loadOuvriersDisponibles();
      setError('');
      alert('Ouvrier retiré du chantier avec succès !');
    } else {
      setError(data.error);
    }
  } catch (err) {
    setError('Erreur lors du retrait de l\'ouvrier');
    console.error(err);
  }
};
  const getStatutColor = (etat) => {
    switch (etat) {
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'À venir': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Responsable</h2>
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
                  <p className="text-sm font-medium text-gray-600">Chantiers En cours</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.chantiers_en_cours}</p>
                  <p className="text-xs text-gray-500 mt-1">Projets actifs</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chantiers Terminés</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.chantiers_termines}</p>
                  <p className="text-xs text-gray-500 mt-1">Projets complétés</p>
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
                  <p className="text-sm font-medium text-gray-600">Ouvriers Affectés</p>
                  <p className="text-3xl font-bold text-purple-600">{dashboardData.total_ouvriers}</p>
                  <p className="text-xs text-gray-500 mt-1">Personnel total</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                  <p className="text-3xl font-bold text-orange-600">{alerteCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Nécessitent attention</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Alertes */}
          {(dashboardData.alertes.depassement_budget.length > 0 || 
            dashboardData.alertes.retard_taches.length > 0 || 
            dashboardData.alertes.absence_ouvriers.length > 0) && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes</h3>
              <div className="space-y-4">
                {dashboardData.alertes.depassement_budget.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Dépassement de budget</h4>
                    {dashboardData.alertes.depassement_budget.map((chantier) => (
                      <p key={chantier.ID_CHANTIER} className="text-sm text-red-700">
                        {chantier.NOM} - Budget: {chantier.BUDGET}€
                      </p>
                    ))}
                  </div>
                )}
                
                {dashboardData.alertes.retard_taches.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Tâches en retard</h4>
                    {dashboardData.alertes.retard_taches.map((tache) => (
                      <p key={tache.ID_TACHE} className="text-sm text-yellow-700">
                        {tache.TITRE} - Chantier: {tache.CHANTIER_ID}
                      </p>
                    ))}
                  </div>
                )}
                
                {dashboardData.alertes.absence_ouvriers.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-orange-800 mb-2">Chantiers sans ouvriers</h4>
                    {dashboardData.alertes.absence_ouvriers.map((chantier) => (
                      <p key={chantier.ID_CHANTIER} className="text-sm text-orange-700">
                        {chantier.NOM}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveMenu('chantiers')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="font-medium text-gray-900">Gérer chantiers</p>
              </button>
              <button
                onClick={() => {setActiveMenu('chantiers'); setShowAddChantier(true);}}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="font-medium text-gray-900">Nouveau chantier</p>
              </button>
              <button
                onClick={() => setActiveMenu('alertes')}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="font-medium text-gray-900">Voir alertes</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div> );

const renderChantiers = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold text-gray-900">Gestion des Chantiers</h2>
      <button
        onClick={() => setShowAddChantier(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Nouveau chantier
      </button>
    </div>
    
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID Chantier</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">État</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date Début</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Chef Chantier</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {chantiers.map((chantier) => (
              <tr key={chantier.ID_CHANTIER} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{chantier.ID_CHANTIER}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{chantier.nom_chantier}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatutColor(chantier.ETAT)}`}>
                    {chantier.ETAT}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {chantier.DATE_DEBUT ? new Date(chantier.DATE_DEBUT).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{chantier.chef_chantier || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={async () => {
                      setSelectedChantier(chantier);
                      await loadChantierDetails(chantier.ID_CHANTIER);
                      setActiveMenu('details');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChantier(chantier);
                      setEditChantier({ 
                        etat: chantier.ETAT || '', 
                        chef_chantier_id: chantier.CHEF_CHANTIER_ID || '' 
                      });
                      setShowEditChantier(true);
                    }}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Modifier
                  </button>
                                      <button
                      onClick={async () => {
                        setSelectedChantier(chantier);
                        await loadChantierOuvriers(chantier.ID_CHANTIER);
                        await loadOuvriersDisponibles();
                        setShowManageOuvriers(true);
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium text-xs px-2 py-1 rounded bg-purple-50 hover:bg-purple-100"
                    >
                      Ouvriers
                    </button>
                    
                    {chantier.ETAT !== 'En cours' && chantier.ETAT !== 'Archivé' && (
                      <button
                        onClick={() => {
                          setSelectedChantier(chantier);
                          setShowDeleteChantier(true);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                      >
                        Archiver
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {/* Modal Manage Workers */}
    {showManageOuvriers && selectedChantier && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-t-lg">
            <h3 className="text-2xl font-bold">Gérer les Ouvriers - {selectedChantier.nom_chantier}</h3>
            <p className="text-purple-100">Chantier ID: {selectedChantier.ID_CHANTIER}</p>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Workers */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Ouvriers Affectés ({chantierOuvriers.length})
                </h4>
                <div className="border rounded-lg max-h-80 overflow-y-auto">
                  {chantierOuvriers.length > 0 ? (
                    chantierOuvriers.map(ouvrier => (
                      <div key={ouvrier.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{ouvrier.nom_complet}</p>
                          <p className="text-sm text-gray-500">
                            ID: {ouvrier.id} | Affecté le: {new Date(ouvrier.date_affectation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveOuvrierFromChantier(selectedChantier.ID_CHANTIER, ouvrier.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded bg-red-50 hover:bg-red-100"
                        >
                          Retirer
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun ouvrier affecté</p>
                  )}
                </div>
              </div>

              {/* Available Workers */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Ouvriers Disponibles ({ouvriersDisponibles.length})
                </h4>
                <div className="border rounded-lg max-h-80 overflow-y-auto">
                  {ouvriersDisponibles.length > 0 ? (
                    ouvriersDisponibles.map(ouvrier => (
                      <div key={ouvrier.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{ouvrier.nom_complet}</p>
                          <p className="text-sm text-gray-500">ID: {ouvrier.id}</p>
                        </div>
                        <button
                          onClick={() => handleAddOuvrierToChantier(selectedChantier.ID_CHANTIER, ouvrier.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 rounded bg-green-50 hover:bg-green-100"
                        >
                          Ajouter
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun ouvrier disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-lg">
            <button
              onClick={() => {
                setShowManageOuvriers(false);
                setSelectedChantier(null);
                setChantierOuvriers([]);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Modal Ajouter Chantier */}
    {showAddChantier && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-lg">
            <h3 className="text-2xl font-bold">Nouveau Chantier</h3>
          </div>
          <form onSubmit={handleAddChantier} className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={newChantier.nom}
                  onChange={(e) => setNewChantier({...newChantier, nom: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                <input
                  type="text"
                  value={newChantier.localisation}
                  onChange={(e) => setNewChantier({...newChantier, localisation: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
                <select
                  value={newChantier.etat}
                  onChange={(e) => setNewChantier({...newChantier, etat: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="À venir">À venir</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chef Chantier *</label>
                <select
                  value={newChantier.chef_chantier_id}
                  onChange={(e) => setNewChantier({...newChantier, chef_chantier_id: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">-- Sélectionner un chef --</option>
                  {chefsDisponibles.map(chef => (
                    <option key={chef.id} value={chef.id}>
                      {chef.nom_complet} (ID: {chef.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={newChantier.date_debut}
                  onChange={(e) => setNewChantier({...newChantier, date_debut: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin estimée</label>
                <input
                  type="date"
                  value={newChantier.date_fin_estimee}
                  onChange={(e) => setNewChantier({...newChantier, date_fin_estimee: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newChantier.budget}
                  onChange={(e) => setNewChantier({...newChantier, budget: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows="3"
                value={newChantier.description}
                onChange={(e) => setNewChantier({...newChantier, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Description du chantier..."
              />
            </div>

            {/* Sélection des ouvriers */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ouvriers disponibles ({newChantier.ouvriers.length} sélectionnés)
              </label>
              <div className="border rounded-lg max-h-40 overflow-y-auto p-2">
                {ouvriersDisponibles.length > 0 ? (
                  ouvriersDisponibles.map(ouvrier => (
                    <div key={ouvrier.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`ouvrier-${ouvrier.id}`}
                        checked={newChantier.ouvriers.includes(ouvrier.id)}
                        onChange={() => handleOuvrierToggle(ouvrier.id)}
                        className="h-4 w-4 text-green-600 rounded border-gray-300"
                      />
                      <label htmlFor={`ouvrier-${ouvrier.id}`} className="ml-3 text-sm text-gray-900 cursor-pointer">
                        {ouvrier.nom_complet} (ID: {ouvrier.id})
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm p-2">Aucun ouvrier disponible</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddChantier(false);
                  setNewChantier({
                    nom: '', description: '', localisation: '', etat: 'À venir',
                    date_debut: '', date_fin_estimee: '', chef_chantier_id: '', budget: '', ouvriers: []
                  });
                  setError('');
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

    {/* Modal Modifier Chantier */}
    {showEditChantier && selectedChantier && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-lg">
            <h3 className="text-2xl font-bold">Modifier le Chantier {selectedChantier.ID_CHANTIER}</h3>
            <p className="text-blue-100">{selectedChantier.nom_chantier}</p>
          </div>
          <form onSubmit={handleEditChantier} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvel État
                </label>
                <select
                  value={editChantier.etat}
                  onChange={(e) => setEditChantier({...editChantier, etat: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Garder l'état actuel --</option>
                  <option value="À venir">À venir</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  État actuel: {selectedChantier.ETAT || 'Non défini'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau Chef Chantier
                </label>
                <select
                  value={editChantier.chef_chantier_id}
                  onChange={(e) => setEditChantier({...editChantier, chef_chantier_id: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Garder le chef actuel --</option>
                  {chefsDisponibles.map(chef => (
                    <option key={chef.id} value={chef.id}>
                      {chef.nom_complet} (ID: {chef.id})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Chef actuel: {selectedChantier.chef_chantier || 'Aucun'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sauvegarder les modifications
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditChantier(false);
                  setSelectedChantier(null);
                  setEditChantier({ etat: '', chef_chantier_id: '' });
                  setError('');
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
    {/* Modal Archiver Chantier - À ajouter après le modal Modifier Chantier */}
{showDeleteChantier && selectedChantier && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-lg">
        <h3 className="text-2xl font-bold">Archiver le Chantier</h3>
        <p className="text-red-100">ID: {selectedChantier.ID_CHANTIER}</p>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Confirmer l'archivage
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            <strong>{selectedChantier.nom_chantier}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Cette action va :
          </p>
          <ul className="text-sm text-gray-600 text-left mt-2 space-y-1">
            <li>• Archiver définitivement le chantier</li>
            <li>• Désactiver toutes les affectations d'ouvriers</li>
            <li>• Rendre le chantier non modifiable</li>
          </ul>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleArchiveChantier(selectedChantier.ID_CHANTIER)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            Confirmer l'archivage
          </button>
          <button
            onClick={() => {
              setShowDeleteChantier(false);
              setSelectedChantier(null);
            }}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
)}
  </div>
);



  const renderChantierDetails = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveMenu('chantiers')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour aux chantiers
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Détails du Chantier {selectedChantier?.ID_CHANTIER}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setReportData({ description: '', format: 'csv' });
              setShowReportModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Générer Rapport
          </button>
        </div>
      </div>

      {chantierDetails && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nom</p>
                  <p className="text-gray-900">{chantierDetails.NOM}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">État</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatutColor(chantierDetails.ETAT)}`}>
                    {chantierDetails.ETAT}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Localisation</p>
                  <p className="text-gray-900">{chantierDetails.LOCALISATION}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget</p>
                  <p className="text-gray-900">{chantierDetails.BUDGET}€</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date de début</p>
                  <p className="text-gray-900">
                    {chantierDetails.DATE_DEBUT ? new Date(chantierDetails.DATE_DEBUT).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Date de fin estimée</p>
                  <p className="text-gray-900">
                    {chantierDetails.DATE_FIN_ESTIMEE ? new Date(chantierDetails.DATE_FIN_ESTIMEE).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Responsable</p>
                  <p className="text-gray-900">{chantierDetails.nom_responsable || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Chef de chantier</p>
                  <p className="text-gray-900">{chantierDetails.nom_chef || '-'}</p>
                </div>
              </div>
              {chantierDetails.DESCRIPTION && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="text-gray-900 mt-1">{chantierDetails.DESCRIPTION}</p>
                </div>
              )}
            </div>

            {/* Onglets pour les différentes sections */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={async () => {
                      await loadAffectations(selectedChantier.ID_CHANTIER);
                      setActiveTab('ouvriers');
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'ouvriers' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Ouvriers
                  </button>
                  <button
                    onClick={async () => {
                      await loadTaches(selectedChantier.ID_CHANTIER);
                      setActiveTab('taches');
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'taches' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tâches
                  </button>
                  <button
                    onClick={async () => {
                      await loadJournal(selectedChantier.ID_CHANTIER);
                      setActiveTab('journal');
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'journal' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Journal
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'ouvriers' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Ouvriers Affectés</h4>
                    {affectations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Prénom</th>
                              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date Affectation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {affectations.map((affectation, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">{affectation[2]}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{affectation[3]}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{affectation[4]}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {new Date(affectation[1]).toLocaleDateString('fr-FR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucun ouvrier affecté</p>
                    )}
                  </div>
                )}

                {activeTab === 'taches' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Tâches</h4>
                    {taches.length > 0 ? (
                      <div className="space-y-4">
                        {taches.map((tache, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{tache[1]}</h5>
                                <p className="text-sm text-gray-600 mt-1">{tache[2]}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                tache[4] ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {tache[4] ? 'Terminée' : 'En cours'}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Début: {tache[3] ? new Date(tache[3]).toLocaleDateString('fr-FR') : '-'} | 
                              Fin: {tache[4] ? new Date(tache[4]).toLocaleDateString('fr-FR') : '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune tâche</p>
                    )}
                  </div>
                )}

                {activeTab === 'journal' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Journal du Chantier</h4>
                    {journal.length > 0 ? (
                      <div className="space-y-4">
                        {journal.map((entry) => (
                          <div key={entry.ID_JOURNAL} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex justify-between items-start">
                              <p className="text-gray-900">{entry.DESCRIPTION}</p>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.DATE_ENTREE).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune entrée dans le journal</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipe</h3>
              {chantierDetails.ouvriers.length > 0 ? (
                <div className="space-y-2">
                  {chantierDetails.ouvriers.map((ouvrier) => (
                    <div key={ouvrier.ID_OUVRIER} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {ouvrier.PRENOM.charAt(0)}{ouvrier.NOM.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {ouvrier.PRENOM} {ouvrier.NOM}
                        </p>
                        <p className="text-xs text-gray-500">ID: {ouvrier.ID_OUVRIER}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun ouvrier affecté</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Générer Rapport */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Générer Rapport</h3>
            </div>
            <form onSubmit={handleGenerateReport} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={reportData.description}
                    onChange={(e) => setReportData({...reportData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Description du rapport..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={reportData.format}
                    onChange={(e) => setReportData({...reportData, format: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Générer
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
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

const renderAlertes = () => {
  // Filtrer les alertes selon l'ID correspondant à la recherche
  const filteredAlertes = searchAlertes
    ? alertes.filter((alerte) => alerte.id.toString().includes(searchAlertes))
    : alertes;

  return (
    <div className="space-y-6">
      {/* Titre et barre de recherche */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Alertes</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher alertes par ID..."
              value={searchAlertes}
              onChange={(e) => setSearchAlertes(e.target.value)}
              className="px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
            />
            {searchAlertes && (
              <button
                onClick={() => setSearchAlertes('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message de recherche active */}
      {searchAlertes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-blue-700">
                Recherche active : "{searchAlertes}"
              </span>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              {filteredAlertes.length} résultat(s) trouvé(s)
            </span>
          </div>
        </div>
      )}

      {/* Tableau des alertes */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Chantier</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Message</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAlertes.map((alerte) => (
                <tr key={alerte.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{alerte.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{alerte.nom_chantier}</p>
                      <p className="text-xs text-gray-500">{alerte.chantier_id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{alerte.message}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(alerte.date_alerte).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      alerte.active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {alerte.active ? 'Active' : 'Résolue'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleUpdateAlertStatus(alerte.id, !alerte.active)}
                      className={`font-medium ${
                        alerte.active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      {alerte.active ? 'Marquer résolue' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message si aucune alerte */}
        {filteredAlertes.length === 0 && (
          <div className="text-center py-8">
            {searchAlertes ? (
              <div>
                <p className="text-gray-500 mb-2">Aucune alerte trouvée pour "{searchAlertes}"</p>
                <button
                  onClick={() => setSearchAlertes('')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Aucune alerte trouvée</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Mon Profil</h2>
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : userProfile ? (
        <div className="space-y-6">
          {/* Informations du profil */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userProfile.prenom?.charAt(0)}{userProfile.nom?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {userProfile.prenom} {userProfile.nom}
                </h3>
                <p className="text-gray-600">{userProfile.email}</p>
                <p className="text-blue-600 font-medium">ID: {userProfile.id} | Rôle: {userProfile.role}</p>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Consultation du dashboard responsable</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-600">Gestion des chantiers et alertes</span>
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-lg">
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={editProfile.prenom}
                    onChange={(e) => setEditProfile({...editProfile, prenom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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

  const [activeTab, setActiveTab] = useState('ouvriers');

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
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
              <span className="text-blue-600">Responsable</span> <span className="text-purple-600">Panel</span>
            </h1>
            
            <nav className="space-y-2">
              <button
                onClick={() => {setActiveMenu('dashboard'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'dashboard' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
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
                onClick={() => {setActiveMenu('chantiers'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'chantiers' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Chantiers
              </button>

              <button
                onClick={() => {setActiveMenu('details'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'details' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!selectedChantier ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedChantier}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Détails Chantier
              </button>

              <button
                onClick={() => {setActiveMenu('alertes'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors relative ${
                  activeMenu === 'alertes' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Alertes
                {alerteCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {alerteCount > 99 ? '99+' : alerteCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Profil et Déconnexion en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
             <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors mb-2 ${
                    showProfile 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {showProfile && renderProfile()}
              {!showProfile && activeMenu === 'dashboard' && renderDashboard()}
              {!showProfile && activeMenu === 'chantiers' && renderChantiers()}
              {!showProfile && activeMenu === 'details' && renderChantierDetails()}
              {!showProfile && activeMenu === 'alertes' && renderAlertes()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsableDashboard;