import { useState, useEffect } from 'react';
import logo from "../../images/menara_holding.png";
import prefa from "../../images/menara_prefa.png";

const AdminDashboard = ({ userId, role, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // États pour les formulaires
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    role: ''
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

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeMenu) {
        case 'dashboard':
          await loadDashboard();
          // Charger aussi les données supplémentaires pour les statistiques
          const [usersData, chantiersData, ouvriersData] = await Promise.all([
            loadUsers(),
            loadChantiers(),
            loadOuvriers()
          ]);
          break;
        case 'users':
          await loadUsers();
          break;
        case 'roles':
          await loadRoles();
          break;
        case 'chantiers':
          await loadChantiers();
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
    const response = await fetch('http://localhost:5000/admin/dashboard');
    const data = await response.json();
    if (response.ok) {
      setDashboardData(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadUsers = async () => {
    const response = await fetch('http://localhost:5000/admin/utilisateurs');
    const data = await response.json();
    if (response.ok) {
      setUsers(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadRoles = async () => {
    const response = await fetch('http://localhost:5000/admin/roles');
    const data = await response.json();
    if (response.ok) {
      setRoles(data.roles);
    } else {
      throw new Error(data.error);
    }
  };

  const loadChantiers = async () => {
    const response = await fetch('http://localhost:5000/chantiers');
    const data = await response.json();
    if (response.ok) {
      setChantiers(data);
    } else {
      throw new Error(data.error);
    }
  };

  const loadOuvriers = async () => {
    const response = await fetch('http://localhost:5000/rh/ouvriers');
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Erreur lors du chargement des ouvriers');
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/admin/utilisateur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        setShowAddUser(false);
        setNewUser({ nom: '', prenom: '', email: '', mot_de_passe: '', role: '' });
        await loadUsers();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout');
    }
  };

  const handleToggleArchive = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/utilisateur/${userId}/archive`, {
        method: 'PATCH'
      });
      if (response.ok) {
        await loadUsers();
      }
    } catch (err) {
      setError('Erreur lors de la modification');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/role/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        setEditingRole(null);
        await loadRoles();
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleArchiveChantier = async (chantierId, archive = true) => {
    try {
      const response = await fetch(`http://localhost:5000/chantier/${chantierId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive })
      });
      if (response.ok) {
        await loadChantiers();
      }
    } catch (err) {
      setError('Erreur lors de l\'archivage');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h2>
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
                  <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-3xl font-bold text-emerald-600">{users.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Comptes créés</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chantiers</p>
                  <p className="text-3xl font-bold text-blue-600">{chantiers.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Total projets</p>
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
                  <p className="text-sm font-medium text-gray-600">Ouvriers Actifs</p>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData?.ouvriers?.actifs || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Personnel terrain</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Total</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {(chantiers.reduce((total, ch) => total + (parseFloat(ch.budget) || 0), 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">MAD (Tous chantiers)</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => {setActiveMenu('users'); setShowAddUser(true);}}
                className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="font-medium text-gray-900">Ajouter utilisateur</p>
              </button>
              <button
                onClick={() => setActiveMenu('chantiers')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="font-medium text-gray-900">Voir chantiers</p>
              </button>
              <button
                onClick={() => setActiveMenu('roles')}
                className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="font-medium text-gray-900">Gérer rôles</p>
              </button>
              <button
                onClick={() => loadData()}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <svg className="w-6 h-6 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="font-medium text-gray-900">Actualiser</p>
              </button>
            </div>
          </div>

          {/* Tableau des chantiers */}
          {dashboardData.chantiers.derniers.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Derniers Chantiers</h3>
                  <button
                    onClick={() => setActiveMenu('chantiers')}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Voir tous →
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Localisation</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.chantiers.derniers.map((chantier) => (
                      <tr key={chantier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{chantier.nom}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            chantier.statut === 'En cours' ? 'bg-green-100 text-green-800' : 
                            chantier.statut === 'Terminé' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {chantier.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{chantier.localisation}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{(parseFloat(chantier.budget) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

   const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Ajouter un utilisateur
        </button>
      </div>

      {showAddUser && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Nouvel Utilisateur</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom"
              value={newUser.nom}
              onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Prénom"
              value={newUser.prenom}
              onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={newUser.mot_de_passe}
              onChange={(e) => setNewUser({...newUser, mot_de_passe: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="Admin">Admin</option>
              <option value="RH">RH</option>
              <option value="Manager">Manager</option>
              <option value="Chef Chantier">Chef Chantier</option>
              <option value="Responsable">Responsable</option>
            </select>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddUser}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Ajouter
            </button>
            <button
              onClick={() => {setShowAddUser(false); setNewUser({ nom: '', prenom: '', email: '', mot_de_passe: '', role: '' });}}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Rôle</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.nom} {user.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      user.archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.archived ? 'Archivé' : 'Actif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleArchive(user.id)}
                      className={`px-3 py-1 rounded text-xs ${
                        user.archived 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {user.archived ? 'Réactiver' : 'Archiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Gestion des Rôles</h2>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Rôle Actuel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.nom} {user.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 text-sm">
                    {editingRole === user.id ? (
                      <div className="flex gap-2">
                        <select
                          defaultValue={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="RH">RH</option>
                          <option value="Manager">Manager</option>
                          <option value="Chef Chantier">Chef Chantier</option>
                          <option value="Responsable">Responsable</option>
                        </select>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(user.id)}
                        disabled={user.role === 'Admin'}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.role === 'Admin'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {user.role === 'Admin' ? 'Non modifiable' : 'Modifier'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChantiers = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Gestion des Chantiers</h2>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Localisation</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">État</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Budget</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Archivé</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chantiers.map((chantier) => (
                <tr key={chantier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.localisation}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      chantier.etat === 'En cours' ? 'bg-green-100 text-green-800' : 
                      chantier.etat === 'Terminé' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {chantier.etat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.budget?.toLocaleString()} MAD</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{chantier.archived}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleArchiveChantier(chantier.id, chantier.archived === "Non")}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        chantier.archived === "Oui"
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {chantier.archived === "Oui" ? 'Désarchiver' : 'Archiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <span className="text-gray-600">Consultation du dashboard administrateur</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Gestion des utilisateurs</span>
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
              <span className="text-emerald-600">Admin</span> <span className="text-blue-600">Panel</span>
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
                onClick={() => {setActiveMenu('users'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'users' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Utilisateurs
              </button>

              <button
                onClick={() => {setActiveMenu('roles'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'roles' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Rôles
              </button>

              <button
                onClick={() => {setActiveMenu('chantiers'); setShowProfile(false);}}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeMenu === 'chantiers' && !showProfile
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Chantiers
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
              {!showProfile && activeMenu === 'users' && renderUsers()}
              {!showProfile && activeMenu === 'roles' && renderRoles()}
              {!showProfile && activeMenu === 'chantiers' && renderChantiers()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 