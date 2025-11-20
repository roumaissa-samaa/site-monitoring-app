from flask import Blueprint, request, jsonify
from database import get_db

update_conge_bp = Blueprint('update_conge', __name__)

@update_conge_bp.route('/rh/ouvriers/<string:id>/conge', methods=['PATCH'])
def update_conge(id):
    data = request.get_json()
    jours_conge = data.get('jours_conge')

    if jours_conge is None:
        return jsonify({'error': 'Le nombre de jours de congé est requis'}), 400

    try:
        conn = get_db()
        cur = conn.cursor()

        query = "UPDATE ouvrier SET jours_conge = %s WHERE id_ouvrier = %s"
        cur.execute(query, (jours_conge, id))
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({'error': f"Aucun ouvrier trouvé avec l'ID {id}"}), 404

        return jsonify({'message': f'Jours de congé mis à jour pour l\'ouvrier {id}'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        cur.close()
