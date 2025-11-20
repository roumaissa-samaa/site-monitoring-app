from flask import Blueprint, jsonify
from database import get_db

get_all_chantiers_bp = Blueprint('get_all_chantiers', __name__)

@get_all_chantiers_bp.route('/chantiers', methods=['GET'])
def get_all_chantiers():
    conn = get_db()
    cur = conn.cursor()
    try:
        # On sélectionne tous les chantiers, archivés ou non
        cur.execute("""
            SELECT ID_CHANTIER, NOM, DESCRIPTION, LOCALISATION, ETAT, DATE_DEBUT, DATE_FIN_ESTIMEE, RESPONSABLE_ID, CHEF_CHANTIER_ID, ARCHIVED, BUDGET
            FROM CHANTIER
        """)
        rows = cur.fetchall()
        chantiers = []
        for row in rows:
            chantiers.append({
                'id': row[0],
                'nom': row[1],
                'description': row[2],
                'localisation': row[3],
                'etat': row[4],
                'date_debut': row[5].isoformat() if row[5] else None,
                'date_fin_estimee': row[6].isoformat() if row[6] else None,
                'responsable_id': row[7],
                'chef_chantier_id': row[8],
                # Champ archivage transformé en "Oui" ou "Non"
                'archived': "Oui" if row[9] else "Non",
                'budget': row[10]
            })
        return jsonify(chantiers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
