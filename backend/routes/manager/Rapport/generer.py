from flask import Blueprint, request, jsonify
from datetime import date
from database import get_db

reports_bp = Blueprint('reports', __name__, url_prefix='/manager/reports')

@reports_bp.route('/generate', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()
        chantier_id = data.get('chantier_id')
        genere_par = data.get('genere_par')
        description = data.get('description', '')

        # 1️⃣ Vérification des champs obligatoires
        if not chantier_id or not genere_par:
            return jsonify({"error": "Les champs 'chantier_id' et 'genere_par' sont obligatoires."}), 400

        conn = get_db()
        cur = conn.cursor()

        try:
            # 2️⃣ Insérer le rapport
            cur.execute("""
                INSERT INTO rapport (chantier_id, date_rapport, description, genere_par)
                VALUES (%s, %s, %s, %s)
            """, (chantier_id, date.today(), description, genere_par))
            conn.commit()
        except Exception as db_error:
            error_message = str(db_error)
            # 3️⃣ Gestion des erreurs spécifiques
            if "violates foreign key constraint" in error_message and "chantier_id" in error_message:
                return jsonify({"error": f"L'ID chantier '{chantier_id}' n'existe pas. Veuillez vérifier l'ID."}), 400
            return jsonify({"error": "Erreur lors de l'insertion du rapport en base de données."}), 500

        # 4️⃣ Récupérer le dernier rapport généré
        cur.execute("""
            SELECT id_rapport, chantier_id, date_rapport, description, genere_par
            FROM rapport
            WHERE genere_par = %s
            ORDER BY date_rapport DESC
            LIMIT 1
        """, (genere_par,))
        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"error": "Impossible de récupérer le rapport généré."}), 404

        columns = ['ID_RAPPORT', 'CHANTIER_ID', 'DATE_RAPPORT', 'DESCRIPTION', 'GENERE_PAR']
        rapport = dict(zip(columns, row))

        return jsonify({"message": "Rapport généré avec succès", "rapport": rapport}), 201

    except Exception as e:
        # 5️⃣ Erreur générique serveur
        return jsonify({"error": "Erreur serveur : " + str(e)}), 500
