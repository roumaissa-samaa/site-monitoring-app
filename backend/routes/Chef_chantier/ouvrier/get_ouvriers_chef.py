# routes/chef_chantier/get_ouvriers_chef.py
from flask import Blueprint, jsonify, request
from database import get_db
from datetime import date

get_ouvriers_chef_bp = Blueprint('get_ouvriers_chef_bp', __name__)

@get_ouvriers_chef_bp.route('/chef/ouvriers', methods=['GET'])
def get_ouvriers_chef():
    chef_id = request.args.get('chef_id')  # ID du chef connecté
    if not chef_id:
        return jsonify({"error": "chef_id requis"}), 400

    today = date.today()
    conn = get_db()
    cur = conn.cursor()
    try:
        # On récupère les ouvriers affectés aux chantiers du chef
        cur.execute("""
            SELECT o.ID_OUVRIER, o.NOM, o.PRENOM, o.SPECIALITE,
                   a.ID_CHANTIER,
                   pt.ID_TACHE,
                   CASE WHEN pt.ID_TACHE IS NOT NULL AND pt.ACTIF=TRUE THEN TRUE ELSE FALSE END AS participe
            FROM OUVRIER o
            JOIN AFFECTATION a ON o.ID_OUVRIER = a.ID_OUVRIER AND a.ACTIF=TRUE
            JOIN CHANTIER c ON a.ID_CHANTIER = c.ID_CHANTIER
            LEFT JOIN PARTICIPATION_TACHE pt ON o.ID_OUVRIER = pt.ID_OUVRIER AND pt.ACTIF=TRUE
            WHERE c.CHEF_CHANTIER_ID = %s
            ORDER BY o.NOM
        """, (chef_id,))

        rows = cur.fetchall()
        ouvriers = []
        for row in rows:
            ouvriers.append({
                "id_ouvrier": row[0],
                "nom": row[1],
                "prenom": row[2],
                "specialite": row[3],
                "id_chantier": row[4],
                "tache_id": row[5],
                "participe": row[6]
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify(ouvriers)
