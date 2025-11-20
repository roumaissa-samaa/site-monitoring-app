from flask import Blueprint, jsonify
from database import get_db
from datetime import datetime, timedelta, date

rh_dashboard_bp = Blueprint('rh_dashboard', __name__, url_prefix='/rh/dashboard')

@rh_dashboard_bp.route('/', methods=['GET'])
def dashboard():
    conn = get_db()
    cur = conn.cursor()

    # Nombre total d'ouvriers actifs
    cur.execute("SELECT COUNT(*) FROM ouvrier WHERE actif = TRUE")
    actifs = cur.fetchone()[0]

    # Nombre total d'ouvriers archivés
    cur.execute("SELECT COUNT(*) FROM ouvrier WHERE actif = FALSE")
    archives = cur.fetchone()[0]

    # Nombre de pointages la dernière semaine
    date_limite = datetime.now() - timedelta(days=7)
    cur.execute("SELECT COUNT(*) FROM pointage WHERE date_pointage >= %s", (date_limite,))
    pointages_semaine = cur.fetchone()[0]

    # Nombre d'ouvriers présents aujourd'hui
    today = date.today()
    cur.execute("""
        SELECT COUNT(DISTINCT id_ouvrier)
        FROM pointage
        WHERE date_pointage = %s
    """, (today,))
    present_auj = cur.fetchone()[0]

    taux_presence = 0
    if actifs > 0:
        taux_presence = (present_auj / actifs) * 100

    cur.close()

    return jsonify({
        'ouvriers_actifs': actifs,
        'ouvriers_archives': archives,
        'pointages_7_derniers_jours': pointages_semaine,
        'present_auj': present_auj,
        'taux_presence_pourcentage': round(taux_presence, 2)
    })
