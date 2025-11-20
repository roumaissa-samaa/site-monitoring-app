import { useState, useEffect } from 'react';
import logo from "../../images/menara_holding.png";
import prefa from "../../images/menara_prefa.png";

const HRDashboard = ({ userId, role, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [ouvriers, setOuvriers] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // États pour les formulaires
  const [showAddOuvrier, setShowAddOuvrier] = useState(false);
  const [showEditOuvrier, setShowEditOuvrier] = useState(false);
  const [selectedOuvrier, setSelectedOuvrier] = useState(null);
  const [showPointageFilters, setShowPointageFilters] = useState(false);

  // États pour le profil utilisateur
  const [userProfile, setUserProfile] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [newOuvrier, setNewOuvrier] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    specialite: '',
    cin: '',
    adresse: ''
  });

  const [editOuvrier, setEditOuvrier] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    specialite: ''
  });

  const [pointageFilters, setPointageFilters] = useState({
    id_ouvrier: '',
    date_pointage: ''
  });

  const [reportFilters, setReportFilters] = useState({
    date_debut: '',
    date_fin: ''
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

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeMenu) {
        case 'dashboard':
          await loadDashboard();
          break;
        case 'ouvriers':
          await loadOuvriers();
          break;
        case 'pointages':
          await loadOuvriers(); // Pour avoir la liste des ouvriers
          await loadPointages();
          break;
        case 'rapports':
          await loadOuvriers(); // Pour avoir la liste des ouvriers
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

  const loadDashboard = async () => {
    const response = await fetch(`http://localhost:5000/rh/dashboard/`);
    const data = await response.json();
    if (response.ok) {
      setDashboardData(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadOuvriers = async () => {
    const response = await fetch(`http://localhost:5000/rh/ouvriers`);
    const data = await response.json();
    if (response.ok) {
      setOuvriers(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadPointages = async () => {
    let url = `http://localhost:5000/rh/pointages`;
    const params = new URLSearchParams();
    if (pointageFilters.id_ouvrier) params.append('id_ouvrier', pointageFilters.id_ouvrier);
    if (pointageFilters.date_pointage) params.append('date_pointage', pointageFilters.date_pointage);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      setPointages(data);
    } else {
      throw new Error(data.error);
    }
  };

  const handleAddOuvrier = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/rh/ouvriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOuvrier)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowAddOuvrier(false);
        setNewOuvrier({ nom: '', prenom: '', telephone: '', specialite: '', cin: '', adresse: '' });
        await loadOuvriers();
        setError('');
        alert('Ouvrier ajouté avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'ouvrier');
    }
  };

  const handleEditOuvrier = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/rh/ouvriers/${selectedOuvrier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOuvrier)
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowEditOuvrier(false);
        setSelectedOuvrier(null);
        await loadOuvriers();
        setError('');
        alert('Ouvrier mis à jour avec succès !');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la modification de l\'ouvrier');
    }
  };

  const handleArchiveOuvrier = async (ouvrierld) => {
    try {
      const response = await fetch(`http://localhost:5000/rh/ouvriers/${ouvrierld}/archive`, {
        method: 'PATCH'
      });
      
      const data = await response.json();
      if (response.ok) {
        await loadOuvriers();
        alert(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'archivage');
    }
  };

  const handleUpdateConge = async (id, jours_conge) => {
    try {
      const response = await fetch(`http://localhost:5000/rh/ouvriers/${id}/conge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jours_conge })
      });
      
      const data = await response.json();
      if (response.ok) {
        await loadOuvriers();
        alert(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des congés');
    }
  };

  const handleUpdateVacance = async (id, jours_vacance) => {
    try {
      const response = await fetch(`http://localhost:5000/rh/ouvriers/${id}/vacance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jours_vacance })
      });
      
      const data = await response.json();
      if (response.ok) {
        await loadOuvriers();
        alert(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des vacances');
    }
  };

  const handleExportReport = async (format) => {
    if (!reportFilters.date_debut || !reportFilters.date_fin) {
      setError('Les dates de début et fin sont requises pour l\'export');
      return;
    }

    try {
      const endpoint = format === 'csv' ? 'export_csv' : 'export_pdf';
      const url = `http://localhost:5000/rh/rapports/presence/${endpoint}?date_debut=${reportFilters.date_debut}&date_fin=${reportFilters.date_fin}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = urlBlob;
        a.download = `rapport_presence_${reportFilters.date_debut}_to_${reportFilters.date_fin}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(urlBlob);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'export');
      }
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  const getStatusColor = (actif) => {
    return actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Fonction utilitaire pour calculer la durée de travail
  const calculateDuration = (heureArrivee, heureDepart) => {
    if (!heureArrivee || !heureDepart) return 'En cours';
    
    const [arriveeH, arriveeM] = heureArrivee.split(':').map(Number);
    const [departH, departM] = heureDepart.split(':').map(Number);
    
    const arriveeMinutes = arriveeH * 60 + arriveeM;
    const departMinutes = departH * 60 + departM;
    
    const dureeMinutes = departMinutes - arriveeMinutes;
    
    if (dureeMinutes < 0) return 'Erreur';
    
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;
    
    return `${heures}h${minutes.toString().padStart(2, '0')}`;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard RH</h2>
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
                  <p className="text-sm font-medium text-gray-600">Ouvriers Actifs</p>
                  <p className="text-3xl font-bold text-green-600">{dashboardData.ouvriers_actifs}</p>
                  <p className="text-xs text-gray-500 mt-1">Personnel actuel</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ouvriers Archivés</p>
                  <p className="text-3xl font-bold text-red-600">{dashboardData.ouvriers_archives}</p>
                  <p className="text-xs text-gray-500 mt-1">Personnel inactif</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pointages (7j)</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData.pointages_7_derniers_jours}</p>
                  <p className="text-xs text-gray-500 mt-1">Cette semaine</p>
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
                  <p className="text-sm font-medium text-gray-600">Présents Aujourd'hui</p>
                  <p className="text-3xl font-bold text-orange-600">{dashboardData.present_auj}</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboardData.taux_presence_pourcentage}% de présence</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Alerte de présence */}
          {dashboardData.taux_presence_pourcentage < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-700">
                  Taux de présence faible aujourd'hui: {dashboardData.taux_presence_pourcentage}%
                </span>
                <button 
                  onClick={() => setActiveMenu('pointages')}
                  className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Voir les pointages →
                </button>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveMenu('ouvriers')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="font-medium text-gray-900">Gérer ouvriers</p>
              </button>
              <button
                onClick={() => {setActiveMenu('ouvriers'); setShowAddOuvrier(true);}}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="font-medium text-gray-900">Ajouter ouvrier</p>
              </button>
              <button
                onClick={() => setActiveMenu('pointages')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-gray-900">Voir pointages</p>
              </button>
            </div>
          </div>

          {/* Graphique de performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de Présence</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Taux de présence aujourd'hui</span>
                  <span>{dashboardData.taux_presence_pourcentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{width: `${dashboardData.taux_presence_pourcentage}%`}}
                  ></div>
                </div>
              </div>
              {dashboardData.ouvriers_actifs > dashboardData.present_auj && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Absents aujourd'hui</span>
                    <span>{Math.round(((dashboardData.ouvriers_actifs - dashboardData.present_auj) / dashboardData.ouvriers_actifs) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full" 
                      style={{width: `${((dashboardData.ouvriers_actifs - dashboardData.present_auj) / dashboardData.ouvriers_actifs) * 100}%`}}
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

  const renderOuvriers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Ouvriers</h2>
        <button
          onClick={() => setShowAddOuvrier(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Ajouter un ouvrier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Prénom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Téléphone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Spécialité</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Congés</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Vacances</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ouvriers.map((ouvrier) => (
                <tr key={ouvrier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ouvrier.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.telephone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ouvrier.specialite || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(ouvrier.actif)}`}>
                      {ouvrier.actif ? 'Actif' : 'Archivé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      value={ouvrier.jours_conge || 0}
                      onChange={(e) => handleUpdateConge(ouvrier.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      value={ouvrier.jours_vacance || 0}
                      onChange={(e) => handleUpdateVacance(ouvrier.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOuvrier(ouvrier);
                        setEditOuvrier({
                          nom: ouvrier.nom,
                          prenom: ouvrier.prenom,
                          telephone: ouvrier.telephone || '',
                          specialite: ouvrier.specialite || ''
                        });
                        setShowEditOuvrier(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleArchiveOuvrier(ouvrier.id)}
                      className={`font-medium ${ouvrier.actif ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {ouvrier.actif ? 'Archiver' : 'Désarchiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajouter Ouvrier */}
      {showAddOuvrier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Ajouter un Ouvrier</h3>
            </div>
            <form onSubmit={handleAddOuvrier} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={newOuvrier.nom}
                    onChange={(e) => setNewOuvrier({...newOuvrier, nom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={newOuvrier.prenom}
                    onChange={(e) => setNewOuvrier({...newOuvrier, prenom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CIN *</label>
                  <input
                    type="text"
                    value={newOuvrier.cin}
                    onChange={(e) => setNewOuvrier({...newOuvrier, cin: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={newOuvrier.telephone}
                    onChange={(e) => setNewOuvrier({...newOuvrier, telephone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={newOuvrier.specialite}
                    onChange={(e) => setNewOuvrier({...newOuvrier, specialite: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={newOuvrier.adresse}
                    onChange={(e) => setNewOuvrier({...newOuvrier, adresse: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddOuvrier(false);
                    setNewOuvrier({ nom: '', prenom: '', telephone: '', specialite: '', cin: '', adresse: '' });
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

      {/* Modal Modifier Ouvrier */}
      {showEditOuvrier && selectedOuvrier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full m-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Modifier Ouvrier</h3>
            </div>
            <form onSubmit={handleEditOuvrier} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={editOuvrier.nom}
                    onChange={(e) => setEditOuvrier({...editOuvrier, nom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={editOuvrier.prenom}
                    onChange={(e) => setEditOuvrier({...editOuvrier, prenom: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={editOuvrier.telephone}
                    onChange={(e) => setEditOuvrier({...editOuvrier, telephone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={editOuvrier.specialite}
                    onChange={(e) => setEditOuvrier({...editOuvrier, specialite: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditOuvrier(false);
                    setSelectedOuvrier(null);
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

  const renderPointages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Pointages</h2>
        <button
          onClick={() => setShowPointageFilters(!showPointageFilters)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Filtrer les pointages
        </button>
      </div>

      {/* Filtres des pointages */}
      {showPointageFilters && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les Pointages</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ouvrier</label>
              <select
                value={pointageFilters.id_ouvrier}
                onChange={(e) => setPointageFilters({...pointageFilters, id_ouvrier: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les ouvriers</option>
                {ouvriers.filter(o => o.actif).map((ouvrier) => (
                  <option key={ouvrier.id} value={ouvrier.id}>
                    {ouvrier.prenom} {ouvrier.nom} ({ouvrier.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={pointageFilters.date_pointage}
                onChange={(e) => setPointageFilters({...pointageFilters, date_pointage: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  loadPointages();
                  setShowPointageFilters(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID Pointage</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID Ouvrier</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom Ouvrier</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Heure Arrivée</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Heure Départ</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pointages.map((pointage) => {
                const ouvrier = ouvriers.find(o => o.id === pointage.id_ouvrier);
                const duree = pointage.heure_arrivee && pointage.heure_depart 
                  ? calculateDuration(pointage.heure_arrivee, pointage.heure_depart)
                  : 'En cours';
                
                return (
                  <tr key={pointage.id_pointage} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{pointage.id_pointage}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pointage.id_ouvrier}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ouvrier ? `${ouvrier.prenom} ${ouvrier.nom}` : 'Inconnu'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(pointage.date_pointage).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pointage.heure_arrivee || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pointage.heure_depart || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        duree === 'En cours' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {duree}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pointages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun pointage trouvé</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRapports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Rapports</h2>
      </div>

      {/* Générateur de rapports */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Générer un Rapport de Présence</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={reportFilters.date_debut}
              onChange={(e) => setReportFilters({...reportFilters, date_debut: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={reportFilters.date_fin}
              onChange={(e) => setReportFilters({...reportFilters, date_fin: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="flex items-end">
            <div className="w-full space-y-2">
              <button
                onClick={() => handleExportReport('csv')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter CSV
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Sélectionnez une période pour générer un rapport de présence détaillé.
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
                <span className="text-gray-600">Consultation du dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-600">Accès à la gestion RH</span>
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
              <span className="text-blue-600">RH</span> <span className="text-purple-600">Panel</span>
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
                onClick={() => {setActiveMenu('ouvriers'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'ouvriers' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ouvriers
              </button>

              <button
                onClick={() => {setActiveMenu('pointages'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'pointages' && !showProfile
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pointages
              </button>

              <button
                onClick={() => {setActiveMenu('rapports'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'rapports' && !showProfile
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
              {!showProfile && activeMenu === 'ouvriers' && renderOuvriers()}
              {!showProfile && activeMenu === 'pointages' && renderPointages()}
              {!showProfile && activeMenu === 'rapports' && renderRapports()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;