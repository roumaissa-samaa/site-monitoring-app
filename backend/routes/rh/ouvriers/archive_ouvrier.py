from flask import Blueprint, jsonify
from database import get_db

archive_ouvrier_bp = Blueprint('archive_ouvrier', __name__)

@archive_ouvrier_bp.route('/rh/ouvriers/<string:ouvrier_id>/archive', methods=['PATCH'])
def toggle_archive_ouvrier(ouvrier_id):
    conn = get_db()
    cur = conn.cursor()

    try:
        # Récupérer l'état actuel
        cur.execute("SELECT actif FROM ouvrier WHERE id_ouvrier = %s", (ouvrier_id,))
        result = cur.fetchone()
        if not result:
            return jsonify({'error': 'Ouvrier non trouvé'}), 404

        current_status = result[0]
        new_status = not current_status  # inverser l'état

        cur.execute("""
            UPDATE ouvrier
            SET actif = %s
            WHERE id_ouvrier = %s
        """, (new_status, ouvrier_id))
        conn.commit()

        action = "archivé" if not current_status else "déarchivé"
        return jsonify({'message': f'Ouvrier {action}'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
