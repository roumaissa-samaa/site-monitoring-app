# routes/chef_chantier/get_journal_chef.py
from flask import Blueprint, jsonify, request
from database import get_db

get_journal_chef_bp = Blueprint('get_journal_chef_bp', __name__)

@get_journal_chef_bp.route('/chef/journaux', methods=['GET'])
def get_journaux_chef():
    chef_id = request.args.get('chef_id')
    if not chef_id:
        return jsonify({"error": "chef_id requis"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT j.ID_JOURNAL, j.DATE_ENTREE, j.DESCRIPTION, j.CHANTIER_ID
            FROM JOURNAL_DE_CHANTIER j
            JOIN CHANTIER c ON j.CHANTIER_ID = c.ID_CHANTIER
            WHERE c.CHEF_CHANTIER_ID = %s
            ORDER BY j.DATE_ENTREE DESC
        """, (chef_id,))
        rows = cur.fetchall()

        journaux = []
        for row in rows:
            journaux.append({
                "id_journal": row[0],
                "date_entree": row[1].isoformat() if row[1] else None,
                "description": row[2],
                "chantier_id": row[3]
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify(journaux)
