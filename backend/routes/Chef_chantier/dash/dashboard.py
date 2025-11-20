# routes/chef_chantier/dashboard.py
from flask import Blueprint, jsonify, request
from database import get_db
from datetime import date

dashboardc_bp = Blueprint('dashboardc_bp', __name__)

@dashboardc_bp.route('/chef/dashboard', methods=['GET'])
def dashboard_chef():
    chef_id = request.args.get('chef_id')
    if not chef_id:
        return jsonify({"error": "chef_id requis"}), 400

    today = date.today()
    conn = get_db()
    cur = conn.cursor()
    try:
        # Tâches totales / terminées / en cours
        cur.execute("""
            SELECT 
                COUNT(*) AS total,
                COUNT(CASE WHEN t.ETAT='Terminé' THEN 1 END) AS terminees,
                COUNT(CASE WHEN t.ETAT='En cours' THEN 1 END) AS en_cours
            FROM TACHE t
            JOIN CHANTIER c ON t.CHANTIER_ID = c.ID_CHANTIER
            WHERE c.CHEF_CHANTIER_ID=%s
        """, (chef_id,))
        taches_stats = cur.fetchone()
        taches = {
            "total": taches_stats[0],
            "terminees": taches_stats[1],
            "en_cours": taches_stats[2]
        }

        # Ouvriers présents aujourd'hui
        cur.execute("""
            SELECT COUNT(DISTINCT o.ID_OUVRIER)
            FROM OUVRIER o
            JOIN PARTICIPATION_TACHE pt ON o.ID_OUVRIER = pt.ID_OUVRIER AND pt.ACTIF=TRUE
            JOIN TACHE t ON pt.ID_TACHE = t.ID_TACHE
            JOIN CHANTIER c ON t.CHANTIER_ID = c.ID_CHANTIER
            JOIN POINTAGE p ON o.ID_OUVRIER = p.ID_OUVRIER
            WHERE c.CHEF_CHANTIER_ID=%s AND p.DATE_POINTAGE=%s
        """, (chef_id, today))
        nb_ouvriers_present = cur.fetchone()[0]

        # Alertes actives
        cur.execute("""
            SELECT COUNT(*) 
            FROM ALERTES a
            JOIN CHANTIER c ON a.CHANTIER_ID = c.ID_CHANTIER
            WHERE c.CHEF_CHANTIER_ID=%s AND a.ACTIVE=TRUE
        """, (chef_id,))
        nb_alertes = cur.fetchone()[0]

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    dashboard = {
        "taches": taches,
        "nb_ouvriers_present": nb_ouvriers_present,
        "nb_alertes": nb_alertes
    }

    return jsonify(dashboard)
