from flask import Blueprint, jsonify
from database import get_db  # ta connexion MySQL

list_chantiers_bp = Blueprint('list_chantiers', __name__)

@list_chantiers_bp.route('/responsable/chantiers', methods=['GET'])
def get_chantiers():
    conn = get_db()
    cur = conn.cursor()  # sans dictionary=True

    query = """
    SELECT 
        c.ID_CHANTIER,
        c.NOM,
        c.DATE_DEBUT,
        c.ETAT,
        u.NOM
    FROM CHANTIER c
    LEFT JOIN UTILISATEUR u ON c.CHEF_CHANTIER_ID = u.ID_UTILISATEUR
    WHERE c.ARCHIVED != TRUE OR c.ARCHIVED IS NULL
    ORDER BY c.DATE_DEBUT DESC
    """
    cur.execute(query)
    rows = cur.fetchall()

    # Convertir chaque tuple en dictionnaire
    chantiers = []
    for row in rows:
        chantiers.append({
            "ID_CHANTIER": row[0],
            "nom_chantier": row[1],
            "DATE_DEBUT": str(row[2]),  # convertir date en string
            "ETAT": row[3],
            "chef_chantier": row[4]
        })

    cur.close()
    conn.close()
    return jsonify(chantiers)
