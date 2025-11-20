from flask import Blueprint, jsonify
from database import get_db

get_ouvriers_bp = Blueprint('get_ouvriers', __name__)

@get_ouvriers_bp.route('/rh/ouvriers', methods=['GET'])
@get_ouvriers_bp.route('/rh/ouvriers', methods=['GET'])
def get_all_ouvriers():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id_ouvrier AS id, nom, prenom, telephone, specialite, adresse, actif, jours_conge, jours_vacance
        FROM ouvrier
    """)

    ouvriers = [
        {
            "id": row[0],
            "nom": row[1],
            "prenom": row[2],
            "telephone": row[3],
            "specialite": row[4],
            "adresse": row[5],        # ✅ ajouté
            "actif": row[6],          # ✅ bon mapping
            "jours_conge": row[7],    # ✅ bon mapping
            "jours_vacance": row[8],  # ✅ bon mapping
        }
        for row in cur.fetchall()
    ]
    cur.close()
    return jsonify(ouvriers)
