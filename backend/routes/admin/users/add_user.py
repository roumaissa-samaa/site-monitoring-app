import random
from flask import Blueprint, request, jsonify
from database import get_db
from werkzeug.security import generate_password_hash

add_user_bp = Blueprint('add_user', __name__)

def generate_unique_matricule(cur, tries=100):
    """Génère un matricule unique à 5 chiffres"""
    for _ in range(tries):
        matricule = random.randint(10000, 99999)
        cur.execute("SELECT 1 FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (matricule,))
        if not cur.fetchone():
            return matricule
    raise Exception("Impossible de générer un matricule unique après plusieurs tentatives")

@add_user_bp.route('/admin/utilisateur', methods=['POST'])
def add_utilisateur():
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')
    role = data.get('role')

    if not all([nom, prenom, email, mot_de_passe, role]):
        return jsonify({'error': 'Tous les champs sont requis'}), 400

    mot_de_passe_hache = generate_password_hash(mot_de_passe)

    conn = get_db()
    cur = conn.cursor()
    try:
        # -------------------------
        # Thread-safe : verrouiller la table
        # -------------------------
        cur.execute("BEGIN;")
        cur.execute("LOCK TABLE UTILISATEUR IN EXCLUSIVE MODE;")  # bloque la table pour éviter doublons

        matricule = generate_unique_matricule(cur)

        cur.execute(
            "INSERT INTO UTILISATEUR (ID_UTILISATEUR, NOM, PRENOM, EMAIL, MOT_DE_PASSE, ROLE, archived) "
            "VALUES (%s, %s, %s, %s, %s, %s, false)",
            (matricule, nom, prenom, email, mot_de_passe_hache, role)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Erreur lors de l\'ajout: {str(e)}'}), 500
    finally:
        cur.close()

    return jsonify({'message': 'Utilisateur ajouté avec succès', 'id_utilisateur': matricule}), 201
