from flask import Blueprint, request, jsonify
from database import get_db

add_ouvrier_bp = Blueprint('add_ouvrier', __name__)

@add_ouvrier_bp.route('/rh/ouvriers', methods=['POST'])
def add_ouvrier():
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    telephone = data.get('telephone')
    specialite = data.get('specialite')
    cin = data.get('cin')  # ajouter le CIN
    adresse = data.get('adresse')  # ajouter l'adresse

    if not nom or not prenom or not cin:
        return jsonify({'error': 'Nom, prénom et CIN sont requis'}), 400

    conn = get_db()
    cur = conn.cursor()

    try:
        # Récupérer le dernier ID ouvrier
        cur.execute("SELECT id_ouvrier FROM ouvrier ORDER BY id_ouvrier DESC LIMIT 1")
        last_id = cur.fetchone()
        
        if last_id:
            last_num = int(last_id[0][2:])  # ignorer "OU"
            new_num = last_num + 1
        else:
            new_num = 1

        new_id = f"OU{new_num:03d}"

        # Insérer l’ouvrier
        cur.execute("""
            INSERT INTO ouvrier (id_ouvrier, nom, prenom, cin, telephone, specialite, adresse)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (new_id, nom, prenom, cin, telephone, specialite, adresse))

        conn.commit()
        return jsonify({'message': 'Ouvrier ajouté', 'id': new_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
