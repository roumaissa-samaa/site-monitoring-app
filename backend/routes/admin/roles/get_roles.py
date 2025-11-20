from flask import Blueprint, jsonify
from database import get_db

get_roles_bp = Blueprint('get_roles', __name__, url_prefix='/admin')

@get_roles_bp.route('/roles', methods=['GET'])
def get_roles():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT ID_UTILISATEUR, NOM, PRENOM, ROLE FROM UTILISATEUR")
    users = []
    for row in cur.fetchall():
        users.append({
            'id': row[0],
            'nom': row[1],
            'prenom':row[2],
            'role': row[3]
        })
    cur.close()
    return jsonify({'roles': users})
