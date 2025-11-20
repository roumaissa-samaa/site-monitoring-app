# routes/chef_chantier/get_alertes_chef.py
from flask import Blueprint, jsonify, request
from database import get_db

get_alertes_chef_bp = Blueprint('get_alertes_chef_bp', __name__)

@get_alertes_chef_bp.route('/chef/alertes', methods=['GET'])
def get_alertes_chef():
    chef_chantier_id = request.args.get('chef_chantier_id')
    if not chef_chantier_id:
        return jsonify({"error": "chef_chantier_id requis"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT a.ID, a.CHANTIER_ID, a.MESSAGE, a.DATE_ALERTE, a.ACTIVE
            FROM ALERTES a
            JOIN CHANTIER c ON a.CHANTIER_ID = c.ID_CHANTIER
            WHERE c.CHEF_CHANTIER_ID = %s
            ORDER BY a.DATE_ALERTE DESC
        """, (chef_chantier_id,))
        rows = cur.fetchall()

        alertes = []
        for row in rows:
            alertes.append({
                "id": row[0],
                "chantier_id": row[1],
                "message": row[2],
                "date_alerte": row[3].isoformat() if row[3] else None,
                "active": row[4]
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify(alertes)
