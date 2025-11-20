import { useState } from 'react';
import logo from "../images/menara_holding.png";
import prefa from "../images/menara_prefa.png";

const Login = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    identifiant: '',
    mot_de_passe: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifiant: formData.identifiant,
          mot_de_passe: formData.mot_de_passe
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Connexion réussie
        onLogin({
          id: data.id,
          role: data.role,
          identifiant: data.id
        });
      } else {
        // Erreur de connexion
        setError(data.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Page d'accueil avec présentation
  if (!showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex flex-col">
        {/* Header avec logos */}
        <div className="flex items-center justify-center pt-12 pb-8">
          <div className="flex items-center justify-center space-x-8">
            <img 
              src={logo} 
              alt="Menara Holding" 
              className="h-24 md:h-32 object-contain"
            />
            <div className="w-px h-16 bg-gray-300"></div>
            <img 
              src={prefa} 
              alt="Menara Préfa" 
              className="h-16 md:h-20 object-contain"
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Titre principal */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                <span className="text-emerald-600">Menara</span> <span className="text-blue-600">TCGM</span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mb-6"></div>
              <h2 className="text-2xl md:text-3xl font-light text-gray-700 mb-6">
                Plateforme Interne de Gestion BTP
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Solution complète dédiée au staff Menara Préfa pour la gestion optimisée 
                des chantiers et le suivi des performances.
                <span className="block mt-2 text-emerald-600 font-medium">Accès réservé au personnel autorisé</span>
              </p>
            </div>

            {/* Fonctionnalités principales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Authentification */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Sécurisé Staff</h3>
                <p className="text-gray-600 text-sm">Authentification par rôles pour Admin, RH, Manager, Chef et Responsable chantier</p>
              </div>

              {/* Gestion chantiers */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion Projets</h3>
                <p className="text-gray-600 text-sm">Création, modification et suivi complet des chantiers avec affectation du personnel</p>
              </div>

              {/* Gestion ouvriers */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion Équipes</h3>
                <p className="text-gray-600 text-sm">Administration du personnel avec affectations et historique complet</p>
              </div>

              {/* Pointage */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Système Pointage</h3>
                <p className="text-gray-600 text-sm">Interface de saisie avec simulation reconnaissance faciale et suivi RH</p>
              </div>

              {/* Dashboard */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-teal-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboards Staff</h3>
                <p className="text-gray-600 text-sm">Vues personnalisées par profil avec exports PDF/Excel</p>
              </div>

              {/* Suivi tâches */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Journal & Tâches</h3>
                <p className="text-gray-600 text-sm">Suivi quotidien avec statuts d'avancement</p>
              </div>
            </div>

            {/* Bouton d'accès */}
            <div className="space-y-4">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Se Connecter</span>
              </button>
              <p className="text-sm text-gray-500">
                Connectez-vous avec votre identifiant personnel
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 mb-2">
                © 2025 Menara Préfa - Groupe Menara Holding. Tous droits réservés.
              </p>
              <p className="text-xs text-gray-400">
                Plateforme interne - V.1.0.0
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Page de connexion
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header avec logos */}
      <div className="flex items-center justify-center pt-12 pb-8">
        <div className="flex items-center space-x-12">
          <img 
            src={logo} 
            alt="Menara Holding" 
            className="h-24 md:h-32 object-contain"
          />
          <div className="w-px h-16 bg-gray-300"></div>
          <img 
            src={prefa} 
            alt="Menara Préfa" 
            className="h-16 md:h-20 object-contain"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Bouton retour */}
          <div className="mb-6">
            <button
              onClick={() => setShowLogin(false)}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          </div>

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span className="text-emerald-600">Connexion</span> <span className="text-blue-600">Staff</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Accédez à votre espace de travail Menara Préfa
            </p>
          </div>

          {/* Formulaire de connexion */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Champ identifiant */}
              <div>
                <label htmlFor="identifiant" className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant Staff
                </label>
                <input
                  id="identifiant"
                  name="identifiant"
                  type="number"
                  required
                  value={formData.identifiant}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  placeholder="Entrez votre identifiant"
                  disabled={loading}
                />
              </div>

              {/* Champ mot de passe */}
              <div>
                <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="mot_de_passe"
                  name="mot_de_passe"
                  type="password"
                  required
                  value={formData.mot_de_passe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Bouton de connexion */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.identifiant || !formData.mot_de_passe}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-blue-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 Menara Préfa - Groupe Menara Holding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;