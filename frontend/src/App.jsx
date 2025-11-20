import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RHDashboard from "./pages/rh/RHDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ChefDashboard from "./pages/chef/ChefDashboard";
import ResponsableDashboard from "./pages/respo/respodash";

// Mapping des dashboards selon le rôle
const dashboards = {
  Admin: (props) => <AdminDashboard {...props} />,
  "Chef Chantier": (props) => <ChefDashboard {...props} />,
  Responsable: (props) => <ResponsableDashboard {...props} />,
  Manager: (props) => <ManagerDashboard {...props} />,
  RH: (props) => <RHDashboard {...props} />,
};

function App() {
  const [user, setUser] = useState(null); // { role, id }

  const handleLogin = (userData) => {
    // userData = { role, id }
    console.log("Données reçues du login :", userData); // Vérifie que id est présent
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Si utilisateur connecté, affiche le dashboard correspondant
  if (user) {
    const DashboardComponent = dashboards[user.role];

    if (!DashboardComponent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-2xl text-red-600 font-bold">
            Rôle inconnu : {user.role}
          </h1>
          <button
            onClick={handleLogout}
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors duration-300"
          >
            Se déconnecter
          </button>
        </div>
      );
    }

    return (
      <DashboardComponent
        userId={user.id}    // Passe l'ID utilisateur
        role={user.role}    // Passe le rôle si besoin
        onLogout={handleLogout}
      />
    );
  }

  // Sinon, affiche le login
  return <Login onLogin={handleLogin} />;
}

export default App;