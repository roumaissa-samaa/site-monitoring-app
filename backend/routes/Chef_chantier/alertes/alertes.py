# routes/chef_chantier/add_alerte.py
from flask import Blueprint, request, jsonify
from database import get_db
from datetime import datetime

alertes_bp = Blueprint('add_alerte_bp', __name__)

@alertes_bp.route('/chef/alertes', methods=['POST'])
def add_alerte():
    data = request.get_json()

    # Vérification du champ obligatoire message et chef_id
    if 'chef_chantier_id' not in data or not data.get('message'):
        return jsonify({"error": "userId et message sont obligatoires"}), 400

    chef_id = data['chef_chantier_id']

    conn = get_db()
    cur = conn.cursor()
    try:
        # Récupérer l'ID du chantier correspondant au chef
        cur.execute(
            "SELECT ID_CHANTIER FROM CHANTIER WHERE CHEF_CHANTIER_ID = %s",
            (chef_id,)
        )
        result = cur.fetchone()
        if result:
            chantier_id = result[0]
        else:
            return jsonify({"error": f"Aucun chantier trouvé pour le chef {chef_id}"}), 404

        # Insertion de l'alerte
        cur.execute("""
            INSERT INTO ALERTES (CHANTIER_ID, MESSAGE, DATE_ALERTE, ACTIVE)
            VALUES (%s, %s, %s, TRUE) RETURNING ID
        """, (
            chantier_id,
            data['message'],
            datetime.now()
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify({"id_alerte": new_id, "message": "Alerte créée avec succès"}), 201
