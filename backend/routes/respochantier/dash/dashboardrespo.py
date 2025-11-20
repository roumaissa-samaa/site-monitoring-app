from flask import Blueprint, jsonify
from database import get_db
from datetime import date

dashboardr_bp = Blueprint('dashboardr', __name__)

@dashboardr_bp.route('/responsable/dashboard', methods=['GET'])
def get_dashboard():
    conn = get_db()
    cur = conn.cursor()

    dashboard_data = {}

    # 1️⃣ Nombre de chantiers en cours / terminés
    cur.execute("""
        SELECT
            SUM(CASE WHEN ETAT = 'En cours' THEN 1 ELSE 0 END) AS chantiers_en_cours,
            SUM(CASE WHEN ETAT = 'Terminé' THEN 1 ELSE 0 END) AS chantiers_termines
        FROM CHANTIER
    """)
    chantiers_counts = cur.fetchone()
    dashboard_data['chantiers_en_cours'] = chantiers_counts[0]
    dashboard_data['chantiers_termines'] = chantiers_counts[1]

    # 2️⃣ Avancement par chantier (% complété)
    cur.execute("""
        SELECT c.ID_CHANTIER, c.NOM,
            CASE 
                WHEN COUNT(t.ID_TACHE) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN t.DATE_FIN IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(t.ID_TACHE), 2)
            END AS pourcentage_avancement
        FROM CHANTIER c
        LEFT JOIN TACHE t ON c.ID_CHANTIER = t.CHANTIER_ID
        GROUP BY c.ID_CHANTIER, c.NOM
    """)
    avancement_chantiers = []
    for row in cur.fetchall():
        avancement_chantiers.append({
            'ID_CHANTIER': row[0],
            'NOM': row[1],
            'pourcentage_avancement': row[2]
        })
    dashboard_data['avancement_chantiers'] = avancement_chantiers

    # 3️⃣ Nombre d’ouvriers affectés au total
    cur.execute("""
        SELECT COUNT(DISTINCT ID_OUVRIER) AS total_ouvriers
        FROM AFFECTATION
    """)
    total_ouvriers = cur.fetchone()[0]
    dashboard_data['total_ouvriers'] = total_ouvriers

    # 4️⃣ Alertes
    # Dépassement de budget
    cur.execute("""
        SELECT ID_CHANTIER, NOM, BUDGET
        FROM CHANTIER
        WHERE BUDGET < 0
    """)
    depassement_budget = []
    for row in cur.fetchall():
        depassement_budget.append({
            'ID_CHANTIER': row[0],
            'NOM': row[1],
            'BUDGET': row[2]
        })

    # Retard : tâches non terminées après la date de fin prévue
    today = date.today()
    cur.execute("""
        SELECT t.ID_TACHE, t.TITRE, t.CHANTIER_ID
        FROM TACHE t
        JOIN CHANTIER c ON t.CHANTIER_ID = c.ID_CHANTIER
        WHERE t.DATE_FIN IS NULL AND c.DATE_FIN_ESTIMEE < %s
    """, (today,))
    retard_taches = []
    for row in cur.fetchall():
        retard_taches.append({
            'ID_TACHE': row[0],
            'TITRE': row[1],
            'CHANTIER_ID': row[2]
        })

    # Absence d’ouvriers affectés
    cur.execute("""
        SELECT c.ID_CHANTIER, c.NOM
        FROM CHANTIER c
        LEFT JOIN AFFECTATION a ON c.ID_CHANTIER = a.ID_CHANTIER
        GROUP BY c.ID_CHANTIER, c.NOM
        HAVING COUNT(a.ID_AFFECTATION) = 0
    """)
    absence_ouvriers = []
    for row in cur.fetchall():
        absence_ouvriers.append({
            'ID_CHANTIER': row[0],
            'NOM': row[1]
        })

    dashboard_data['alertes'] = {
        'depassement_budget': depassement_budget,
        'retard_taches': retard_taches,
        'absence_ouvriers': absence_ouvriers
    }

    return jsonify(dashboard_data)
