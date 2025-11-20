from flask import Blueprint, jsonify
from database import get_db

tache_bp = Blueprint('tache', __name__)

@tache_bp.route('/responsable/chantier/<string:chantier_id>/taches', methods=['GET'])
def get_taches_chantier(chantier_id):
    conn = get_db()
    cur = conn.cursor()

    query = """
    SELECT 
        ID_TACHE,
        TITRE,
        DESCRIPTION,
        DATE_DEBUT,
        DATE_FIN
    FROM TACHE
    WHERE CHANTIER_ID = %s
    ORDER BY DATE_DEBUT ASC
    """
    
    cur.execute(query, (chantier_id,))
    taches = cur.fetchall()

    return jsonify(taches)
