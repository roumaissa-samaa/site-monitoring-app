from flask import Blueprint, request, jsonify
from database import get_db

update_ouvrier_bp = Blueprint('update_ouvrier', __name__)

@update_ouvrier_bp.route('/rh/ouvriers/<string:ouvrier_id>', methods=['PUT'])
def update_ouvrier(ouvrier_id):
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    telephone = data.get('telephone')
    specialite = data.get('specialite')

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE ouvrier
            SET nom = %s, prenom = %s, telephone = %s, specialite = %s
            WHERE id_ouvrier = %s
        """, (nom, prenom, telephone, specialite, ouvrier_id))
        conn.commit()
        return jsonify({'message': 'Ouvrier mis à jour'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
