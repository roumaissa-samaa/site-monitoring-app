from flask import Flask
from flask_cors import CORS
from database import init_app

# --- Import du blueprint Auth ---
from routes.auth.auth_routes import auth_blueprint  
from routes.respochantier.alertes import alertesre_bp 
# --- Imports des autres blueprints ---
from routes.respochantier.alertmanag import update_alert_status_bp
# Admin
from routes.admin.chantier.archive_chantier import archive_chantier_bp
from routes.admin.chantier.get_all_chantiers import get_all_chantiers_bp
from routes.admin.chantier.get_chantier_by_id import get_chantier_by_id_bp
from routes.admin.roles.get_roles import get_roles_bp
from routes.admin.roles.update_role import update_role_bp
from routes.admin.dashboard.get_dashboard import dashboard_bp
from routes.admin.users.add_user import add_user_bp
from routes.admin.users.archive_user import archive_user_bp
from routes.admin.users.get_all_users import get_users_bp
from routes.admin.users.update_user import update_user_bp

# RH
from routes.rh.ouvriers.add_ouvrier import add_ouvrier_bp
from routes.rh.ouvriers.get_all_ouvriers import get_ouvriers_bp
from routes.rh.ouvriers.update_ouvrier import update_ouvrier_bp
from routes.rh.ouvriers.archive_ouvrier import archive_ouvrier_bp
from routes.rh.ouvriers.update_vacance import update_vacance_bp
from routes.rh.ouvriers.update_conge import update_conge_bp
from routes.rh.pointages.get_pointages import get_pointages_bp
from routes.rh.rapports.export_presence_csv import export_reports_csv_bp 
from routes.rh.rapports.export_presence_pdf import export_pdf_bp
from routes.rh.dashboardrh.dashboardrh import rh_dashboard_bp

# Manager
from routes.manager.chantier.consulterchan import consulter_chantier_bp
from routes.manager.chantier.consulterjournal import journal_chantier_bp
from routes.manager.dash.dashboardman import manager_dashboard_bp
from routes.manager.Rapport.generer import reports_bp
from routes.manager.Rapport.exporter import manager_report_bp

from routes.profile import user_bp

# Responsable chantier
from routes.respochantier.chantierrespo.add_chantier import add_chantier_bp
from routes.respochantier.chantierrespo.getchantierinfo import chantier_detail_bp
from routes.respochantier.chantierrespo.liste import list_chantiers_bp
from routes.respochantier.chantierrespo.modifch import update_chantier_respo_bp
from routes.respochantier.dash.dashboardrespo import dashboardr_bp 
from routes.respochantier.jour.afficherjournal import journal_bp  
from routes.respochantier.ouvrier.affct import affectation_bp 
from routes.respochantier.ouvrier.gen import rapport_bp  
from routes.respochantier.tache.tache import tache_bp 

# Chef de chantier
from routes.Chef_chantier.tache.ajout import add_tache_bp
from routes.Chef_chantier.tache.update_tache import update_tache_bp
from routes.Chef_chantier.tache.get_taches import get_taches_bp
from routes.Chef_chantier.journal.add_journal import add_journal_bp
from routes.Chef_chantier.journal.get_journal_chef import get_journal_chef_bp
from routes.Chef_chantier.ouvrier.get_ouvriers_chef import get_ouvriers_chef_bp
from routes.Chef_chantier.alertes.alertes import alertes_bp
from routes.Chef_chantier.dash.dashboard import dashboardc_bp
from routes.Chef_chantier.alertes.get_alertes_chef import get_alertes_chef_bp


# --- Création de l’app ---
app = Flask(__name__)
CORS(app)  # Autoriser les requêtes du frontend
init_app(app)

app.register_blueprint(user_bp)

# --- Enregistrement des Blueprints ---
app.register_blueprint(alertesre_bp)
# Auth
app.register_blueprint(auth_blueprint)

app.register_blueprint(update_alert_status_bp)
# Chef de chantier
app.register_blueprint(get_alertes_chef_bp)
app.register_blueprint(dashboardc_bp)
app.register_blueprint(alertes_bp)
app.register_blueprint(get_ouvriers_chef_bp)
app.register_blueprint(add_journal_bp)
app.register_blueprint(get_journal_chef_bp)
app.register_blueprint(get_taches_bp)
app.register_blueprint(add_tache_bp)
app.register_blueprint(update_tache_bp)

# Admin
app.register_blueprint(archive_chantier_bp)
app.register_blueprint(get_all_chantiers_bp)
app.register_blueprint(get_chantier_by_id_bp)
app.register_blueprint(get_roles_bp)
app.register_blueprint(update_role_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(add_user_bp)
app.register_blueprint(archive_user_bp)
app.register_blueprint(get_users_bp)
app.register_blueprint(update_user_bp)

# RH
app.register_blueprint(add_ouvrier_bp)
app.register_blueprint(get_ouvriers_bp)
app.register_blueprint(update_ouvrier_bp)
app.register_blueprint(archive_ouvrier_bp)
app.register_blueprint(update_vacance_bp)
app.register_blueprint(update_conge_bp)
app.register_blueprint(get_pointages_bp)
app.register_blueprint(export_reports_csv_bp)
app.register_blueprint(export_pdf_bp)
app.register_blueprint(rh_dashboard_bp)

# Manager
app.register_blueprint(consulter_chantier_bp)
app.register_blueprint(journal_chantier_bp)
app.register_blueprint(manager_dashboard_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(manager_report_bp)

# Responsable chantier
app.register_blueprint(add_chantier_bp)
app.register_blueprint(chantier_detail_bp)
app.register_blueprint(list_chantiers_bp)
app.register_blueprint(update_chantier_respo_bp)
app.register_blueprint(dashboardr_bp)
app.register_blueprint(journal_bp)
app.register_blueprint(affectation_bp)
app.register_blueprint(rapport_bp)
app.register_blueprint(tache_bp)


# --- Point d’entrée ---
if __name__ == "__main__":
    app.run(debug=True)