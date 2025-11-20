from flask import Blueprint, request, jsonify
from database import get_db

auth_blueprint = Blueprint("auth", __name__)

@auth_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Requête invalide, JSON requis"}), 400

    identifiant = data.get("identifiant")
    mot_de_passe = data.get("mot_de_passe")

    # Vérification des champs
    if not identifiant or not mot_de_passe:
        return jsonify({"error": "Identifiant et mot de passe requis"}), 400

    try:
        identifiant = int(identifiant)  # force entier (ID numérique)
    except ValueError:
        return jsonify({"error": "Identifiant doit être un entier"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()

        # On récupère le mot de passe stocké
        query = """
            SELECT MOT_DE_PASSE, ROLE, archived 
            FROM UTILISATEUR 
            WHERE ID_UTILISATEUR = %s
        """
        cur.execute(query, (identifiant,))
        user = cur.fetchone()
        cur.close()

        if not user:
            return jsonify({"error": "Identifiant ou mot de passe incorrect"}), 401

        mot_de_passe_db, role, archived = user

        # Vérification du mot de passe (sans hash)
        if mot_de_passe_db != mot_de_passe:
            return jsonify({"error": "Identifiant ou mot de passe incorrect"}), 401

        if archived:
            return jsonify({"error": "Compte utilisateur supprimé"}), 403

        return jsonify({
            "message": "Connexion réussie",
            "role": role,
            "id": identifiant
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500
