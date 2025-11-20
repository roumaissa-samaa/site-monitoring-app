from flask import Blueprint, request, jsonify
from database import get_db
from datetime import datetime

add_tache_bp = Blueprint('add_tache_bp', __name__)

def generate_new_id(prefix, table, id_field, conn):
    cur = conn.cursor()
    cur.execute(f"SELECT {id_field} FROM {table} ORDER BY {id_field} DESC LIMIT 1")
    last_id = cur.fetchone()
    if last_id and last_id[0]:
        last_num = int(last_id[0][len(prefix):])
        new_num = last_num + 1
    else:
        new_num = 1
    return f"{prefix}{str(new_num).zfill(3)}"


# ---------------- GET: Chantier du chef ----------------
@add_tache_bp.route('/chef/chantier', methods=['GET'])
def get_chef_chantier():
    chef_id = request.args.get('chef_id')
    
    if not chef_id:
        return jsonify({"error": "chef_id est requis"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID_CHANTIER, NOM, DESCRIPTION, ETAT, DATE_DEBUT, DATE_FIN_ESTIMEE, LOCALISATION
            FROM CHANTIER 
            WHERE CHEF_CHANTIER_ID = %s AND ARCHIVED = FALSE
            LIMIT 1
        """, (chef_id,))
        
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Aucun chantier assigné à ce chef"}), 404
        
        chantier = {
            'id_chantier': row[0],
            'nom': row[1],
            'description': row[2],
            'etat': row[3],
            'date_debut': row[4].isoformat() if row[4] else None,
            'date_fin_estimee': row[5].isoformat() if row[5] else None,
            'localisation': row[6]
        }
        
        return jsonify(chantier), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ---------------- GET: Ouvriers disponibles ----------------
@add_tache_bp.route('/chef/ouvriers-disponibles', methods=['GET'])
def get_available_ouvriers():
    chantier_id = request.args.get('chantier_id')
    
    if not chantier_id:
        return jsonify({"error": "chantier_id est requis"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT DISTINCT o.ID_OUVRIER, o.NOM, o.PRENOM, o.SPECIALITE
            FROM OUVRIER o
            JOIN AFFECTATION a ON o.ID_OUVRIER = a.ID_OUVRIER
            LEFT JOIN PARTICIPATION_TACHE pt 
                ON o.ID_OUVRIER = pt.ID_OUVRIER AND pt.ACTIF = TRUE
            WHERE a.ID_CHANTIER = %s 
              AND a.ACTIF = TRUE 
              AND o.ACTIF = TRUE
              AND pt.ID_PARTICIPATION IS NULL
            ORDER BY o.NOM, o.PRENOM
        """, (chantier_id,))
        
        ouvriers = []
        for row in cur.fetchall():
            ouvriers.append({
                'id_ouvrier': row[0],
                'nom': row[1],
                'prenom': row[2],
                'specialite': row[3]
            })
        
        return jsonify(ouvriers), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


# ---------------- POST: Ajouter une tâche ----------------
@add_tache_bp.route('/chef/taches', methods=['POST'])
def add_tache():
    data = request.get_json()

    # Validation
    required_fields = ['titre', 'chantier_id', 'ouvriers']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Le champ '{field}' est obligatoire"}), 400

    if not isinstance(data['ouvriers'], list) or len(data['ouvriers']) == 0:
        return jsonify({"error": "Au moins un ouvrier doit être sélectionné"}), 400

    # Validation des dates
    if data.get('date_debut') and data.get('date_fin'):
        try:
            date_debut = datetime.strptime(data['date_debut'], '%Y-%m-%d')
            date_fin = datetime.strptime(data['date_fin'], '%Y-%m-%d')
            if date_fin < date_debut:
                return jsonify({"error": "La date de fin doit être postérieure à la date de début"}), 400
        except ValueError:
            return jsonify({"error": "Format de date invalide"}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        # Vérifier que le chantier existe
        cur.execute("SELECT ID_CHANTIER, NOM FROM CHANTIER WHERE ID_CHANTIER=%s", (data['chantier_id'],))
        chantier = cur.fetchone()
        if not chantier:
            return jsonify({"error": "Ce chantier n'existe pas"}), 404

        # Créer la tâche
        cur.execute("""
            INSERT INTO TACHE (TITRE, DESCRIPTION, DATE_DEBUT, DATE_FIN, CHANTIER_ID, ETAT)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING ID_TACHE
        """, (
            data['titre'],
            data.get('description'),
            data.get('date_debut'),
            data.get('date_fin'),
            data['chantier_id'],
            'À venir'
        ))
        id_tache = cur.fetchone()[0]

        successful_assignments = []
        failed_assignments = []

        # Parcourir les ouvriers
        for id_ouvrier in data['ouvriers']:
            try:
                cur.execute("SAVEPOINT before_assign")

                # Vérifier affectation
                cur.execute("""
                    SELECT a.ID_AFFECTATION, o.NOM, o.PRENOM
                    FROM AFFECTATION a
                    JOIN OUVRIER o ON a.ID_OUVRIER = o.ID_OUVRIER
                    WHERE a.ID_OUVRIER=%s AND a.ID_CHANTIER=%s AND a.ACTIF=TRUE
                """, (id_ouvrier, data['chantier_id']))
                affectation = cur.fetchone()
                
                if not affectation:
                    failed_assignments.append(f"Ouvrier {id_ouvrier} non affecté au chantier")
                    cur.execute("ROLLBACK TO SAVEPOINT before_assign")
                    continue

                # Vérifier participation active
                cur.execute("""
                    SELECT ID_PARTICIPATION
                    FROM PARTICIPATION_TACHE
                    WHERE ID_OUVRIER=%s AND ACTIF=TRUE
                """, (id_ouvrier,))
                if cur.fetchone():
                    failed_assignments.append(f"{affectation[1]} {affectation[2]} a déjà une participation active")
                    cur.execute("ROLLBACK TO SAVEPOINT before_assign")
                    continue

                # Créer la participation
                id_participation = generate_new_id("PA", "PARTICIPATION_TACHE", "ID_PARTICIPATION", conn)
                cur.execute("""
                    INSERT INTO PARTICIPATION_TACHE (ID_PARTICIPATION, ID_TACHE, ID_OUVRIER, ACTIF)
                    VALUES (%s, %s, %s, TRUE)
                """, (id_participation, id_tache, id_ouvrier))
                
                successful_assignments.append(f"{affectation[1]} {affectation[2]}")

            except Exception as e:
                cur.execute("ROLLBACK TO SAVEPOINT before_assign")
                failed_assignments.append(f"Erreur pour ouvrier {id_ouvrier}: {str(e)}")

        # Si aucun ouvrier valide → rollback tâche
        if len(successful_assignments) == 0:
            cur.execute("DELETE FROM TACHE WHERE ID_TACHE = %s", (id_tache,))
            conn.commit()
            return jsonify({
                "error": "Aucun ouvrier n'a pu être assigné à la tâche",
                "details": failed_assignments
            }), 400

        conn.commit()

        message = f"Tâche '{data['titre']}' créée avec succès sur le chantier {chantier[1]}."
        if successful_assignments:
            message += f" {len(successful_assignments)} ouvrier(s) assigné(s): {', '.join(successful_assignments)}."
        if failed_assignments:
            message += f" Attention: {len(failed_assignments)} assignation(s) échouée(s)."

        return jsonify({
            "id_tache": id_tache,
            "message": message,
            "successful_assignments": successful_assignments,
            "failed_assignments": failed_assignments
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur lors de la création de la tâche: {str(e)}"}), 500
    finally:
        cur.close()
