from flask import Blueprint, jsonify
from database import get_db

affectation_bp = Blueprint('affectation', __name__)

@affectation_bp.route('/responsable/chantier/<string:chantier_id>/affectations', methods=['GET'])
def get_affectations(chantier_id):
    conn = get_db()
    cur = conn.cursor()

    query = """
    SELECT 
        a.ID_AFFECTATION,
        a.DATE_AFFECTATION,
        o.ID_OUVRIER,
        o.NOM,
        o.PRENOM
    FROM AFFECTATION a
    JOIN OUVRIER o ON a.ID_OUVRIER = o.ID_OUVRIER
    WHERE a.ID_CHANTIER = %s
    ORDER BY a.DATE_AFFECTATION DESC
    """
    
    cur.execute(query, (chantier_id,))
    affectations = cur.fetchall()

    return jsonify(affectations)
