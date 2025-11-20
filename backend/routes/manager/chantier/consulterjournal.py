from flask import Blueprint, jsonify
from database import get_db

journal_chantier_bp = Blueprint('journal_chantier', __name__)

@journal_chantier_bp.route('/journal/<string:id_chantier>', methods=['GET'])
def consulter_journal(id_chantier):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
        SELECT j.id_journal, j.date_entree, j.description, j.chantier_id, c.chef_chantier_id
        FROM journal_de_chantier j
        JOIN chantier c ON j.chantier_id::varchar = c.id_chantier
        WHERE j.chantier_id::varchar = %s
        ORDER BY j.date_entree DESC
    """, (str(id_chantier),))

        
        rows = cur.fetchall()
        journal_entries = [
            {
                "id_journal": row[0],
                "date_entree": row[1].isoformat() if row[1] else None,
                "description": row[2],
                "chantier_id": row[3],
                "auteur": row[4]
            }
            for row in rows
        ]
        return jsonify(journal_entries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
