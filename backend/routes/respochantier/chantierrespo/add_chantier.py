from flask import Blueprint, request, jsonify
from database import get_db
from datetime import date
import traceback

add_chantier_bp = Blueprint('add_chantier', __name__)

# ----------------- POST: Ajouter un chantier -----------------
@add_chantier_bp.route('/chantier', methods=['POST'])
def add_chantier():
    try:
        data = request.get_json()
        nom = data.get('nom', '').strip()
        description = data.get('description', '').strip()
        localisation = data.get('localisation', '').strip()
        etat = data.get('etat', 'À venir').strip()
        date_debut = data.get('date_debut')
        date_fin_estimee = data.get('date_fin_estimee')
        responsable_id = data.get('responsable_id')
        chef_chantier_id = data.get('chef_chantier_id', '').strip()
        budget = data.get('budget')
        ouvriers = data.get('ouvriers', [])

        # Validation des champs obligatoires
        if not nom:
            return jsonify({'error': 'Le nom du chantier est obligatoire'}), 400
        if not localisation:
            return jsonify({'error': 'La localisation est obligatoire'}), 400
        if not responsable_id:
            return jsonify({'error': "L'ID du responsable est obligatoire"}), 400
        if not chef_chantier_id:
            return jsonify({'error': "L'ID du chef de chantier est obligatoire"}), 400

        # Conversion du budget en float
        if budget:
            try:
                budget = float(budget)
            except (ValueError, TypeError):
                return jsonify({'error': 'Le budget doit être un nombre valide'}), 400
        else:
            budget = None

        # --- Définir date_debut à aujourd'hui si non fourni ---
        if not date_debut:
            date_debut = date.today()

        conn = get_db()
        cur = conn.cursor()

        # Vérification rôle responsable
        cur.execute("SELECT ROLE::text FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (responsable_id,))
        row = cur.fetchone()
        if row is None or row[0].lower() != 'responsable':
            return jsonify({'error': "L'ID responsable n'est pas valide"}), 400

        # Vérification rôle chef chantier
        cur.execute("SELECT ROLE::text FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (chef_chantier_id,))
        row = cur.fetchone()
        if row is None or row[0].lower() != 'chef chantier':
            return jsonify({'error': "L'ID chef chantier n'est pas valide"}), 400

        # Vérifier que le chef chantier n'est pas déjà affecté à un chantier actif
        cur.execute("""
            SELECT 1 FROM CHANTIER 
            WHERE CHEF_CHANTIER_ID = %s AND ETAT != 'Terminé'
        """, (chef_chantier_id,))
        if cur.fetchone():
            return jsonify({'error': "Le chef chantier est déjà affecté à un chantier actif"}), 400

        # Génération ID chantier (CHxxx)
        cur.execute("SELECT ID_CHANTIER FROM CHANTIER ORDER BY ID_CHANTIER DESC LIMIT 1 FOR UPDATE;")
        last_id = cur.fetchone()
        new_num = 1 if last_id is None else int(last_id[0][2:]) + 1
        new_id = f"CH{new_num:03d}"  # format CH001, CH002, ...

        # Insertion chantier
        cur.execute("""
            INSERT INTO CHANTIER 
            (ID_CHANTIER, NOM, DESCRIPTION, LOCALISATION, ETAT, DATE_DEBUT, DATE_FIN_ESTIMEE, RESPONSABLE_ID, CHEF_CHANTIER_ID, BUDGET)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (new_id, nom, description if description else None, localisation, etat,
              date_debut, date_fin_estimee if date_fin_estimee else None,
              responsable_id, chef_chantier_id, budget))

        # Insertion ouvriers avec vérification ACTIF
        for o_id in ouvriers:
            if not o_id:
                continue

            # Vérifier rôle et existence
            cur.execute("SELECT ID_OUVRIER FROM OUVRIER WHERE ID_OUVRIER = %s AND ACTIF = TRUE", (o_id,))
            row = cur.fetchone()
            if row is None:
                return jsonify({'error': f"L'ouvrier {o_id} n'existe pas ou n'est pas actif"}), 400

            # Vérifier affectation active
            cur.execute("SELECT 1 FROM AFFECTATION WHERE ID_OUVRIER = %s AND ACTIF = TRUE", (o_id,))
            if cur.fetchone():
                return jsonify({'error': f"L'ouvrier {o_id} est déjà affecté à un chantier actif"}), 400

            
        # --- Insertion ouvriers avec vérification ACTIF ---
        for o_id in ouvriers:
            if not o_id:
                continue

            cur.execute("SELECT ID_OUVRIER FROM OUVRIER WHERE ID_OUVRIER = %s AND ACTIF = TRUE", (o_id,))
            row = cur.fetchone()
            if row is None:
                return jsonify({'error': f"L'ouvrier {o_id} n'existe pas ou n'est pas actif"}), 400

            cur.execute("SELECT 1 FROM AFFECTATION WHERE ID_OUVRIER = %s AND ACTIF = TRUE", (o_id,))
            if cur.fetchone():
                return jsonify({'error': f"L'ouvrier {o_id} est déjà affecté à un chantier actif"}), 400

            # --- Génération ID_AFFECTATION (AFxxx) robuste ---
            cur.execute("SELECT ID_AFFECTATION FROM AFFECTATION ORDER BY ID_AFFECTATION DESC LIMIT 1 FOR UPDATE;")
            last_aff = cur.fetchone()
            if last_aff is None:
                new_aff_num = 1
            else:
                digits = ''.join(filter(str.isdigit, last_aff[0]))
                new_aff_num = int(digits) + 1
            new_aff_id = f"AF{new_aff_num:03d}"

            # Insertion affectation
            cur.execute("""
                INSERT INTO AFFECTATION (ID_AFFECTATION, ID_OUVRIER, ID_CHANTIER, DATE_AFFECTATION, ACTIF)
                VALUES (%s, %s, %s, %s, %s)
            """, (new_aff_id, o_id, new_id, date.today(), True))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Chantier ajouté avec succès', 'id_chantier': new_id}), 201

    except Exception as e:
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            cur.close()
            conn.close()
        return jsonify({'error': str(e)}), 500

# ----------------- GET: Ouvriers disponibles -----------------
@add_chantier_bp.route('/ouvriers/disponibles', methods=['GET'])
def get_ouvriers_disponibles():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT o.ID_OUVRIER, o.NOM, o.PRENOM
            FROM OUVRIER o
            LEFT JOIN AFFECTATION a
              ON o.ID_OUVRIER = a.ID_OUVRIER AND a.ACTIF = TRUE
            WHERE o.ACTIF = TRUE
              AND a.ID_AFFECTATION IS NULL
            ORDER BY o.NOM, o.PRENOM
        """)
        
        ouvriers = [{'id': r[0], 'nom': r[1], 'prenom': r[2], 'nom_complet': f"{r[2]} {r[1]}"} for r in cur.fetchall()]
        
        cur.close()
        conn.close()
        return jsonify({'ouvriers': ouvriers}), 200
        
    except Exception as e:
        traceback.print_exc()
        if 'conn' in locals():
            cur.close()
            conn.close()
        return jsonify({'error': str(e)}), 500


# ----------------- GET: Chefs de chantier disponibles -----------------
@add_chantier_bp.route('/chefs/disponibles', methods=['GET'])
def get_chefs_disponibles():
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT u.ID_UTILISATEUR, u.NOM, u.PRENOM
            FROM UTILISATEUR u
            LEFT JOIN CHANTIER c
              ON u.ID_UTILISATEUR = c.CHEF_CHANTIER_ID
              AND c.ETAT != 'Terminé'
            WHERE LOWER(u.ROLE::text) = 'chef chantier'
              AND c.CHEF_CHANTIER_ID IS NULL
            ORDER BY u.NOM, u.PRENOM
        """)
        
        chefs = [{'id': r[0], 'nom': r[1], 'prenom': r[2], 'nom_complet': f"{r[2]} {r[1]}"} for r in cur.fetchall()]
        
        cur.close()
        conn.close()
        return jsonify({'chefs': chefs}), 200
        
    except Exception as e:
        traceback.print_exc()
        if 'conn' in locals():
            cur.close()
            conn.close()
        return jsonify({'error': str(e)}), 500
