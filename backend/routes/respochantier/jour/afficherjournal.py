from flask import Blueprint, jsonify
from database import get_db

journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/responsable/chantier/<string:chantier_id>/journal', methods=['GET'])
def get_journal_chantier(chantier_id):
    conn = get_db()
    cur = conn.cursor()  # simple cursor, renvoie des tuples

    query = """
    SELECT 
        ID_JOURNAL,
        DATE_ENTREE,
        DESCRIPTION
    FROM JOURNAL_DE_CHANTIER
    WHERE CHANTIER_ID = %s
    ORDER BY DATE_ENTREE DESC
    """
    
    cur.execute(query, (chantier_id,))
    journal_entries = cur.fetchall()

    # Convertir les tuples en dictionnaires pour jsonify
    result = []
    for entry in journal_entries:
        result.append({
            "ID_JOURNAL": entry[0],
            "DATE_ENTREE": entry[1],
            "DESCRIPTION": entry[2]
        })

    return jsonify(result)
