from flask import Blueprint, request, jsonify
from database import get_db

update_role_bp = Blueprint('update_role', __name__, url_prefix='/admin')

@update_role_bp.route('/role/<int:user_id>', methods=['PUT'])
def update_role(user_id):
    data = request.get_json()
    new_role_name = data.get('role')

    if not new_role_name:
        return jsonify({'error': 'Le nouveau nom du rôle est requis'}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # Vérifier l'utilisateur existe et récupérer son rôle actuel
        cur.execute("SELECT ROLE FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (user_id,))
        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        current_role = row[0].lower()
        if current_role == 'admin':
            return jsonify({'error': "Le rôle 'admin' ne peut pas être modifié"}), 403
        
        # Mettre à jour le rôle
        cur.execute("UPDATE UTILISATEUR SET ROLE = %s WHERE ID_UTILISATEUR = %s", (new_role_name, user_id))
        conn.commit()

        return jsonify({'message': 'Rôle modifié avec succès'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
