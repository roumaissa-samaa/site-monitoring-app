from flask import Blueprint, jsonify
from database import get_db

consulter_chantier_bp = Blueprint('consulter_chantier_bp', __name__, url_prefix='/manager')

@consulter_chantier_bp.route('/chantier', methods=['GET'])
def consulter_chantier():
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID_CHANTIER, NOM, DESCRIPTION, LOCALISATION, ETAT, DATE_DEBUT, DATE_FIN_ESTIMEE, RESPONSABLE_ID, CHEF_CHANTIER_ID, ARCHIVED
            FROM CHANTIER
            WHERE ARCHIVED = FALSE
            ORDER BY DATE_DEBUT DESC
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
                'archived': row[9]
            })
        return jsonify(chantiers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
