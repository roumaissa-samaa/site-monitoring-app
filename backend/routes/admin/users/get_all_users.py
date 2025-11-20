from flask import Blueprint, request, jsonify
from database import get_db

get_users_bp = Blueprint('get_all_users', __name__)

@get_users_bp.route('/admin/utilisateurs', methods=['GET'])
def get_utilisateurs():
    # Récupère le paramètre 'archived' si fourni, sinon None
    archived_param = request.args.get('archived', None)

    conn = get_db()
    cur = conn.cursor()

    if archived_param is None:
        # Pas de filtre : récupérer tous les utilisateurs
        cur.execute("SELECT ID_UTILISATEUR, NOM, PRENOM, EMAIL, ROLE, archived FROM UTILISATEUR")
    else:
        # Filtrer selon le paramètre archived
        archived = archived_param.lower() == 'true'
        cur.execute(
            "SELECT ID_UTILISATEUR, NOM, PRENOM, EMAIL, ROLE, archived FROM UTILISATEUR WHERE archived = %s",
            (archived,)
        )

    users = cur.fetchall()
    cur.close()

    utilisateurs = [
        {
            'id': u[0],
            'nom': u[1],
            'prenom': u[2],
            'email': u[3],
            'role': u[4],
            'archived': u[5]
        } for u in users
    ]

    return jsonify(utilisateurs)
