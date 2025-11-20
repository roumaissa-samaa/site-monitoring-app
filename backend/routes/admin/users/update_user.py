# routes/admin/update_user.py

from flask import Blueprint, request, jsonify
from database import get_db

update_user_bp = Blueprint('update_user', __name__)

@update_user_bp.route('/admin/utilisateurs/<int:id>', methods=['PUT'])
def update_utilisateur(id):
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')
    role = data.get('role')
    archived = data.get('archived', False)

    if not all([nom, prenom, email, mot_de_passe, role]):
        return jsonify({'error': 'Tous les champs sont requis'}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE UTILISATEUR 
            SET NOM = %s, PRENOM = %s, EMAIL = %s, MOT_DE_PASSE = %s, ROLE = %s, ARCHIVED = %s 
            WHERE ID_UTILISATEUR = %s
        """, (nom, prenom, email, mot_de_passe, role, archived, id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500
    finally:
        cur.close()

    return jsonify({'message': 'Utilisateur mis à jour avec succès'})
