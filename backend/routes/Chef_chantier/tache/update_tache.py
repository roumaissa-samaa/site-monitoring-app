from flask import Blueprint, request, jsonify
from database import get_db
from datetime import date

update_tache_bp = Blueprint('update_tache_bp', __name__)

ETAT_AUTORISES = ['À venir', 'En cours', 'Terminé']

def generate_new_id(prefix, table, id_field, conn):
    cur = conn.cursor()
    cur.execute(f"SELECT {id_field} FROM {table} ORDER BY {id_field} DESC LIMIT 1")
    last_id = cur.fetchone()
    if last_id:
        last_num = int(last_id[0][len(prefix):])
        new_num = last_num + 1
    else:
        new_num = 1
    return f"{prefix}{str(new_num).zfill(3)}"

@update_tache_bp.route('/chef/tache/<int:id_tache>', methods=['PUT'])
def update_tache(id_tache):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    fields = []
    values = []

    # Champs de la tâche
    if 'titre' in data:
        fields.append("TITRE=%s")
        values.append(data['titre'])
    if 'description' in data:
        fields.append("DESCRIPTION=%s")
        values.append(data['description'])
    if 'date_debut' in data:
        fields.append("DATE_DEBUT=%s")
        values.append(data['date_debut'])
    if 'date_fin' in data:
        fields.append("DATE_FIN=%s")
        values.append(data['date_fin'])
    if 'etat' in data:
        if data['etat'] not in ETAT_AUTORISES:
            return jsonify({"error": f"Valeur ETAT invalide, doit être parmi {ETAT_AUTORISES}"}), 400
        fields.append("ETAT=%s")
        values.append(data['etat'])

    conn = get_db()
    cur = conn.cursor()
    non_participants = []

    try:
        # Mise à jour des champs de la tâche
        if fields:
            values.append(id_tache)
            query = f"UPDATE TACHE SET {', '.join(fields)} WHERE ID_TACHE=%s"
            cur.execute(query, values)

        # Si la tâche est terminée, toutes les participations deviennent ACTIF=FALSE
        etat = data.get('etat')

        if etat:

            if etat == 'En cours':
                # Si la tâche est en cours, toutes les participations deviennent actives
                cur.execute("""
                    UPDATE PARTICIPATION_TACHE
                    SET ACTIF = TRUE
                    WHERE ID_TACHE = %s
                """, (id_tache,))
            else:
                # Si l'état est autre (À venir, Archivé...), toutes les participations deviennent inactives
                cur.execute("""
                    UPDATE PARTICIPATION_TACHE
                    SET ACTIF = FALSE
                    WHERE ID_TACHE = %s
                """, (id_tache,))


        # Ajouter des ouvriers
        if 'ajouter_ouvriers' in data:
            for id_ouvrier in data['ajouter_ouvriers']:
                cur.execute("""
                    SELECT 1
                    FROM AFFECTATION a
                    JOIN TACHE t ON t.ID_TACHE=%s
                    WHERE a.ID_OUVRIER=%s AND a.ID_CHANTIER=t.CHANTIER_ID AND a.ACTIF=TRUE
                """, (id_tache, id_ouvrier))
                if not cur.fetchone():
                    non_participants.append(id_ouvrier)
                    continue

                cur.execute("""
                    SELECT 1 FROM PARTICIPATION_TACHE
                    WHERE ID_OUVRIER=%s AND ACTIF=TRUE
                """, (id_ouvrier,))
                if cur.fetchone():
                    non_participants.append(id_ouvrier)
                    continue

                id_participation = generate_new_id("PA", "PARTICIPATION_TACHE", "ID_PARTICIPATION", conn)
                cur.execute("""
                    INSERT INTO PARTICIPATION_TACHE (ID_PARTICIPATION, ID_TACHE, ID_OUVRIER, DATE_ENTREE, ACTIF)
                    VALUES (%s, %s, %s, %s, TRUE)
                """, (id_participation, id_tache, id_ouvrier, date.today()))

        # Supprimer (terminer) des ouvriers seulement si la tâche n'est pas terminée
        if 'supprimer_ouvriers' in data and ('etat' not in data or data['etat'] != 'Terminé'):
            for id_ouvrier in data['supprimer_ouvriers']:
                cur.execute("""
                    UPDATE PARTICIPATION_TACHE
                    SET ACTIF=FALSE
                    WHERE ID_TACHE=%s AND ID_OUVRIER=%s AND ACTIF=TRUE
                """, (id_tache, id_ouvrier))

        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()

    return jsonify({
        "message": "Tâche et participations mises à jour avec succès",
        "non_participants": non_participants
    })
