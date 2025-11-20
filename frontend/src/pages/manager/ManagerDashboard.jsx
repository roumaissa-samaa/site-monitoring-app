import { useState, useEffect } from 'react';
import logo from "../../images/menara_holding.png";
import prefa from "../../images/menara_prefa.png";

const ManagerDashboard = ({ userId, role, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [chantiers, setChantiers] = useState([]);
  const [selectedChantier, setSelectedChantier] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // États pour les formulaires
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [showViewJournal, setShowViewJournal] = useState(false);

  // États pour le profil utilisateur
  const [userProfile, setUserProfile] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [newReport, setNewReport] = useState({
    chantier_id: '',
    description: '',
    genere_par: userId
  });

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
        case 'reports':
          await loadChantiers(); // Pour avoir la liste des chantiers
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
    const response = await fetch(`http://localhost:5000/manager/dashboard`);
    const data = await response.json();
    if (response.ok) {
      setDashboardData(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadChantiers = async () => {
    const response = await fetch(`http://localhost:5000/manager/chantier`);
    const data = await response.json();
    if (response.ok) {
      setChantiers(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadJournalForChantier = async (chantierId) => {
    const response = await fetch(`http://localhost:5000/journal/${chantierId}`);
    const data = await response.json();
    if (response.ok) {
      setJournalEntries(data);
    } else {
      throw new Error(data.error);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/manager/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowGenerateReport(false);
        setNewReport({ chantier_id: '', description: '', genere_par: userId });
        setError('');
        alert('Rapport généré avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
    }
  };

  const handleExportReports = async (format) => {
    try {
      const response = await fetch(`http://localhost:5000/manager/reports/export?genere_par=${userId}&format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `rapports_manager.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  const handleViewJournal = (chantierId) => {
    setSelectedChantier(chantierId);
    loadJournalForChantier(chantierId);
    setShowViewJournal(true);
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'À venir': return 'bg-yellow-100 text-yellow-800';
      case 'En retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Manager</h2>
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
                  <p className="text-sm font-medium text-gray-600">Total Chantiers</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.total_chantiers}</p>
                  <p className="text-xs text-gray-500 mt-1">Chantiers actifs</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chantiers en Retard</p>
                  <p className="text-3xl font-bold text-red-600">{dashboardData.chantiers_en_retard}</p>
                  <p className="text-xs text-gray-500 mt-1">Nécessitent attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Total</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.budget_total.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-gray-500 mt-1">Tous chantiers</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                  <p className="text-3xl font-bold text-orange-600">{dashboardData.alertes_actives}</p>
                  <p className="text-xs text-gray-500 mt-1">À traiter</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5c-1.414-1.414-3.207-1.5-4.536-1.5H9a7 7 0 01-7-7c0-2.485 1.343-4.668 3.354-5.865" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes en retard */}
          {dashboardData.chantiers_en_retard > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">
                  {dashboardData.chantiers_en_retard} chantier(s) sont en retard
                </span>
                <button 
                  onClick={() => setActiveMenu('chantiers')}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Voir les chantiers →
                </button>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
                </svg>
                <p className="font-medium text-gray-900">Voir chantiers</p>
              </button>
              <button
                onClick={() => {setActiveMenu('reports'); setShowGenerateReport(true);}}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-gray-900">Générer rapport</p>
              </button>
              <button
                onClick={() => handleExportReports('csv')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-gray-900">Exporter CSV</p>
              </button>
              <button
                onClick={() => handleExportReports('pdf')}
                className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="font-medium text-gray-900">Exporter PDF</p>
              </button>
            </div>
          </div>

          {/* Graphique de performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des Chantiers</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Chantiers dans les temps</span>
                  <span>{dashboardData.total_chantiers > 0 ? Math.round(((dashboardData.total_chantiers - dashboardData.chantiers_en_retard) / dashboardData.total_chantiers) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{width: `${dashboardData.total_chantiers > 0 ? ((dashboardData.total_chantiers - dashboardData.chantiers_en_retard) / dashboardData.total_chantiers) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
              {dashboardData.chantiers_en_retard > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Chantiers en retard</span>
                    <span>{Math.round((dashboardData.chantiers_en_retard / dashboardData.total_chantiers) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{width: `${(dashboardData.chantiers_en_retard / dashboardData.total_chantiers) * 100}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderChantiers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Chantiers</h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Localisation</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">État</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date début</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date fin estimée</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Chef</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chantiers.map((chantier) => (
                <tr key={chantier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{chantier.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{chantier.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.localisation}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getEtatColor(chantier.etat)}`}>
                      {chantier.etat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {chantier.date_debut ? new Date(chantier.date_debut).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {chantier.date_fin_estimee ? new Date(chantier.date_fin_estimee).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.chef_chantier_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewJournal(chantier.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Voir journal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal pour voir le journal - Version étendue */}
      {showViewJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden m-4">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">
                  Journal du Chantier #{selectedChantier}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Historique complet des activités
                </p>
              </div>
              <button
                onClick={() => {setShowViewJournal(false); setJournalEntries([]);}}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Corps du modal avec scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              {journalEntries.length > 0 ? (
                <div className="space-y-6">
                  {journalEntries.map((entry, index) => (
                    <div key={entry.id_journal} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      {/* Header de l'entrée */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">#{entry.id_journal}</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                Entrée Journal #{entry.id_journal}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 21H7a2 2 0 01-2-2v-4a2 2 0 012-2h2M21 21h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2" />
                                  </svg>
                                  Chantier ID: {entry.chantier_id}
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Auteur: {entry.auteur}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {entry.date_entree ? new Date(entry.date_entree).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Date non spécifiée'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.date_entree ? new Date(entry.date_entree).toLocaleTimeString('fr-FR') : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Corps de l'entrée */}
                      <div className="p-6">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <h5 className="text-sm font-medium text-blue-800 mb-2">Description des activités:</h5>
                          <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                            {entry.description}
                          </p>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="mt-4 grid md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID Journal</div>
                            <div className="text-sm font-semibold text-gray-900">{entry.id_journal}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID Chantier</div>
                            <div className="text-sm font-semibold text-gray-900">{entry.chantier_id}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chef Responsable</div>
                            <div className="text-sm font-semibold text-gray-900">ID #{entry.auteur}</div>
                          </div>
                        </div>

                        {/* Timeline indicator si ce n'est pas le dernier élément */}
                        {index < journalEntries.length - 1 && (
                          <div className="flex justify-center mt-6">
                            <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6M9 21v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 21H7a2 2 0 01-2-2v-4a2 2 0 012-2h2M21 21h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée dans le journal</h3>
                  <p className="text-gray-500">Ce chantier n'a pas encore d'entrées dans le journal des activités.</p>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {journalEntries.length > 0 ? `${journalEntries.length} entrée(s) trouvée(s)` : 'Journal vide'}
                </div>
                <button
                  onClick={() => {setShowViewJournal(false); setJournalEntries([]);}}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Rapports</h2>
        <button
          onClick={() => setShowGenerateReport(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Générer un rapport
        </button>
      </div>

      {showGenerateReport && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Générer un nouveau rapport</h3>
          <form onSubmit={handleGenerateReport}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chantier
                </label>
                <select
                  value={newReport.chantier_id}
                  onChange={(e) => setNewReport({...newReport, chantier_id: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Sélectionner un chantier</option>
                  {chantiers.map((chantier) => (
                    <option key={chantier.id} value={chantier.id}>
                      {chantier.nom} - {chantier.localisation}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du rapport
                </label>
                <textarea
                  placeholder="Description détaillée du rapport..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="4"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Générer le rapport
              </button>
              <button
                type="button"
                onClick={() => {setShowGenerateReport(false); setNewReport({ chantier_id: '', description: '', genere_par: userId });}}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Actions d'export */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exporter les rapports</h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleExportReports('csv')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter CSV
          </button>
          <button
            onClick={() => handleExportReports('pdf')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter PDF
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Les exports incluent tous vos rapports générés
        </p>
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
                <span className="text-gray-600">Consultation générale</span>
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
              <span className="text-blue-600">Manager</span> <span className="text-purple-600">Panel</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
                </svg>
                Chantiers
              </button>

              <button
                onClick={() => {setActiveMenu('reports'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'reports' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Rapports
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
              {!showProfile && activeMenu === 'reports' && renderReports()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;