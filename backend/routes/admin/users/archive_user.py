from flask import Blueprint, jsonify, request
from database import get_db

archive_user_bp = Blueprint('archive_user', __name__)

@archive_user_bp.route('/admin/utilisateur/<int:user_id>/archive', methods=['PATCH'])
def toggle_archive_utilisateur(user_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        # Récupérer l'état actuel de l'utilisateur
        cur.execute("SELECT archived FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

        current_archived = row[0]
        # Basculer l'état
        new_archived = not current_archived
        cur.execute("UPDATE UTILISATEUR SET archived = %s WHERE ID_UTILISATEUR = %s", (new_archived, user_id))
        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500
    finally:
        cur.close()

    action = "archivé" if new_archived else "réactivé"
    return jsonify({'message': f'Utilisateur {action} avec succès'})
