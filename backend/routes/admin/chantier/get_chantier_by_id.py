from flask import Blueprint, jsonify
from database import get_db

get_chantier_by_id_bp = Blueprint('get_chantier_by_id', __name__)

@get_chantier_by_id_bp.route('/chantier/<string:id>', methods=['GET'])
def get_chantier_by_id(id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID_CHANTIER, NOM, DESCRIPTION, LOCALISATION, ETAT, DATE_DEBUT, DATE_FIN_ESTIMEE, RESPONSABLE_ID, CHEF_CHANTIER_ID, BUDGET 
            FROM CHANTIER WHERE ID_CHANTIER=%s
        """, (id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'Chantier non trouvé'}), 404
        chantier = {
            'id': row[0],
                'nom': row[1],
                'description': row[2],
                'localisation': row[3],
                'etat': row[4],
                'date_debut': row[5].isoformat() if row[5] else None,
                'date_fin_estimee': row[6].isoformat() if row[6] else None,
                'responsable_id': row[7],
                'chef_chantier_id': row[8],
                'budget':row[9]
        }
        return jsonify(chantier)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
