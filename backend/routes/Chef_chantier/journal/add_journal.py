# routes/chef_chantier/add_journal.py
from flask import Blueprint, request, jsonify
from database import get_db
from datetime import datetime

add_journal_bp = Blueprint('add_journal_bp', __name__)

@add_journal_bp.route('/chef/journal', methods=['POST'])
def add_journal():
    data = request.get_json()

    # Vérification des champs obligatoires
    if 'userId' not in data or not data.get('description'):
        return jsonify({"error": "userId et description sont obligatoires"}), 400

    chef_id = data['userId']

    conn = get_db()
    cur = conn.cursor()
    try:
        # Récupérer l'ID du chantier correspondant au chef
        cur.execute("SELECT ID_CHANTIER FROM CHANTIER WHERE CHEF_CHANTIER_ID = %s", (chef_id,))
        result = cur.fetchone()
        if result:
            chantier_id = result[0]
        else:
            return jsonify({"error": f"Aucun chantier trouvé pour le chef {chef_id}"}), 404

        # Insertion dans le journal
        cur.execute("""
            INSERT INTO JOURNAL_DE_CHANTIER (CHANTIER_ID, DATE_ENTREE, DESCRIPTION)
            VALUES (%s, %s, %s) RETURNING ID_JOURNAL
        """, (
            chantier_id,
            data.get('date_entree', datetime.now().date()),
            data['description']
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify({"id_journal": new_id, "message": "Entrée de journal créée avec succès"}), 201
