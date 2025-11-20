from flask import Blueprint, jsonify
from database import get_db
from datetime import datetime

manager_dashboard_bp = Blueprint('manager_dashboard', __name__, url_prefix='/manager')

@manager_dashboard_bp.route('/dashboard', methods=['GET'])
def dashboard():
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Nombre total de chantiers (non archivés)
        cur.execute("SELECT COUNT(*) FROM chantier WHERE archived = FALSE")
        total_chantiers = cur.fetchone()[0]

        # Nombre de chantiers en retard (date_fin_estimee < aujourd'hui et etat != 'Terminé')
        today = datetime.now().date()
        cur.execute("""
            SELECT COUNT(*)
            FROM chantier
            WHERE archived = FALSE
              AND date_fin_estimee < %s
              AND etat != 'Terminé'
        """, (today,))
        chantiers_en_retard = cur.fetchone()[0]

        # Budget total (si tu as un champ 'budget' dans chantier)
        # Sinon enlever cette partie
        cur.execute("SELECT COALESCE(SUM(budget), 0) FROM chantier WHERE archived = FALSE")
        budget_total = cur.fetchone()[0]

        # Nombre d’alertes actives (exemple, suppose une table alertes avec colonne 'active')
        cur.execute("SELECT COUNT(*) FROM alertes WHERE active = TRUE")
        alertes_actives = cur.fetchone()[0]

    except Exception as e:
        cur.close()
        return jsonify({'error': str(e)}), 500

    cur.close()
    return jsonify({
        'total_chantiers': total_chantiers,
        'chantiers_en_retard': chantiers_en_retard,
        'budget_total': float(budget_total),
        'alertes_actives': alertes_actives
    })
