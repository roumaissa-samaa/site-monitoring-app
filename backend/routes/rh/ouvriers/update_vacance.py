from flask import Blueprint, request, jsonify
from database import get_db

update_vacance_bp = Blueprint('update_vacance', __name__)

@update_vacance_bp.route('/rh/ouvriers/<string:id>/vacance', methods=['PATCH'])
def update_vacance(id):
    data = request.get_json()
    jours_vacance = data.get('jours_vacance')

    if jours_vacance is None:
        return jsonify({'error': 'Le nombre de jours de vacances est requis'}), 400

    try:
        conn = get_db()
        cur = conn.cursor()

        query = "UPDATE ouvrier SET jours_vacance = %s WHERE id_ouvrier = %s"
        cur.execute(query, (jours_vacance, id))
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({'error': f"Aucun ouvrier trouvé avec l'ID {id}"}), 404

        return jsonify({'message': f'Jours de vacances mis à jour pour l\'ouvrier {id}'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        cur.close()
