from flask import Blueprint, jsonify
from database import get_db

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/admin')

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    try:
        conn = get_db()
        cur = conn.cursor()

        # Exemple : tu peux commenter une partie si table inconnue
        cur.execute("""
            SELECT 
                SUM(CASE WHEN archived = FALSE THEN 1 ELSE 0 END) AS actifs,
                SUM(CASE WHEN archived = TRUE THEN 1 ELSE 0 END) AS archives
            FROM utilisateur
        """)
        users_counts = cur.fetchone()

        cur.execute("SELECT COUNT(*) FROM chantier WHERE etat = 'En cours'")
        chantiers_en_cours = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM chantier WHERE etat = 'Terminé'")
        chantiers_termines = cur.fetchone()[0]

        cur.execute("""
    SELECT id_chantier, nom, etat, description, localisation, date_debut, BUDGET
    FROM chantier
    ORDER BY date_debut DESC
    LIMIT 5
""")

        derniers_chantiers = [
    {
        "id": row[0],                  # id_chantier
        "nom": row[1],                 # nom
        "statut": row[2],              # etat
        "description": row[3],         # description
        "localisation": row[4],        # localisation
        "date_debut": row[5].isoformat() if row[5] else None,   # date_debut
        "budget":row[6]
    }
    for row in cur.fetchall()
]


        cur.execute("SELECT COUNT(*) FROM ouvrier WHERE actif = TRUE")
        ouvriers_actifs = cur.fetchone()[0]

        cur.close()

        return jsonify({
            "utilisateurs": {
                "actifs": users_counts[0],
                "archives": users_counts[1]
            },
            "chantiers": {
                "en_cours": chantiers_en_cours,
                "termines": chantiers_termines,
                "derniers": derniers_chantiers
            },
            "ouvriers": {
                "actifs": ouvriers_actifs
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
