from flask import Blueprint, jsonify, request
from database import get_db

get_taches_bp = Blueprint('get_taches_bp', __name__)

@get_taches_bp.route('/chef/taches', methods=['GET'])
def get_taches():
    chef_chantier_id = request.args.get('chef_chantier_id')
    if not chef_chantier_id:
        return jsonify({"error": "chef_chantier_id requis"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        # Récupérer tous les chantiers du chef
        cur.execute("""
            SELECT ID_CHANTIER
            FROM CHANTIER
            WHERE CHEF_CHANTIER_ID = %s
        """, (chef_chantier_id,))
        chantiers = cur.fetchall()

        if not chantiers:
            return jsonify([])  # renvoie tableau vide si pas de chantier

        # Extraire les IDs de chantiers
        chantier_ids = [row[0] for row in chantiers]

        # Créer la chaîne de placeholders pour IN (%s, %s, %s...)
        placeholders = ','.join(['%s'] * len(chantier_ids))
        query = f"""
            SELECT ID_TACHE, TITRE, DESCRIPTION, DATE_DEBUT, DATE_FIN, ETAT, CHANTIER_ID
            FROM TACHE
            WHERE CHANTIER_ID IN ({placeholders})
            ORDER BY DATE_DEBUT ASC
        """
        cur.execute(query, chantier_ids)
        rows = cur.fetchall()

        # Formatage des tâches
        taches = [
            {
                "id_tache": row[0],
                "titre": row[1],
                "description": row[2],
                "date_debut": row[3].isoformat() if row[3] else None,
                "date_fin": row[4].isoformat() if row[4] else None,
                "etat": row[5] if row[5] else "À venir",
                "chantier_id": row[6]
            }
            for row in rows
        ]

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify(taches)
