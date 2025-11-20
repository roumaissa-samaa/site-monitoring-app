from flask import Blueprint, request, jsonify
from database import get_db

update_chantier_respo_bp = Blueprint('update_chantier_respo', __name__)

@update_chantier_respo_bp.route('/chantierrespo/<string:id>', methods=['PUT'])
def update_chantier(id):
    """Met à jour un chantier (état et/ou chef de chantier)"""
    data = request.get_json()
    etat = data.get('etat')
    chef_chantier_id = data.get('chef_chantier_id')
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Vérifier que le chantier existe et récupérer son état actuel
        cur.execute("SELECT ETAT FROM CHANTIER WHERE ID_CHANTIER = %s", (id,))
        chantier = cur.fetchone()
        if not chantier:
            return jsonify({'error': "Chantier introuvable"}), 404
        
        etat_actuel = chantier[0]
        fields, values = [], []
        
        # Vérifier ETAT si fourni
        if etat not in (None, ""):
            if etat not in ['En cours', 'Terminé', 'À venir', 'Archivé']:
                return jsonify({'error': "Valeur de l'état invalide"}), 400
            fields.append("ETAT = %s")
            values.append(etat)
        
        # Bloquer si chantier terminé/archivé et que l’état ne change pas
        if etat_actuel in ['Terminé', 'Archivé'] and (etat in (None, "") or etat == etat_actuel):
            return jsonify({'error': "Impossible de modifier un chantier terminé ou archivé sans changer son état"}), 400
        
        # Vérifier CHEF_CHANTIER_ID si fourni
        if chef_chantier_id not in (None, ""):
            cur.execute("SELECT ROLE FROM UTILISATEUR WHERE ID_UTILISATEUR = %s", (chef_chantier_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': "L'ID chef chantier n'existe pas"}), 400
            role = row[0].lower()
            if role not in ['chef chantier', 'chef']:
                return jsonify({'error': "L'ID n'est pas un chef chantier"}), 400
            
            fields.append("CHEF_CHANTIER_ID = %s")
            values.append(chef_chantier_id)
        
        # Exécuter la mise à jour si au moins un champ valide
        if fields:
            values.append(id)
            sql = f"UPDATE CHANTIER SET {', '.join(fields)} WHERE ID_CHANTIER = %s"
            cur.execute(sql, tuple(values))
            conn.commit()
            return jsonify({'message': 'Chantier mis à jour avec succès'})
        
        return jsonify({'message': 'Aucun champ à mettre à jour'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()


@update_chantier_respo_bp.route('/ouvriers/disponibles', methods=['GET'])
def get_ouvriers_disponibles():
    """Récupère les ouvriers disponibles (sans affectation active)"""
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT o.ID_OUVRIER, o.NOM, o.PRENOM
            FROM OUVRIER o
            LEFT JOIN AFFECTATION a
              ON o.ID_OUVRIER = a.ID_OUVRIER AND a.ACTIF = TRUE
            WHERE o.ACTIF = TRUE
              AND a.ID_AFFECTATION IS NULL
            ORDER BY o.NOM, o.PRENOM
        """)
        
        ouvriers = cur.fetchall()
        ouvriers_list = []
        
        for ouvrier in ouvriers:
            ouvriers_list.append({
                'id': ouvrier[0],
                'nom': ouvrier[1],
                'prenom': ouvrier[2],
                'nom_complet': f"{ouvrier[2]} {ouvrier[1]}"
            })
        
        return jsonify({
            'success': True,
            'ouvriers': ouvriers_list
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()


@update_chantier_respo_bp.route('/chefs/disponibles', methods=['GET'])
def get_chefs_disponibles():
    """Récupère les chefs de chantier disponibles (non assignés à un chantier actif)"""
    conn = get_db()
    cur = conn.cursor()
    
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
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()


# Vérifiez ces points dans votre backend Python :

# 1. Assurez-vous que la fonction remove_ouvrier_from_chantier existe bien
@update_chantier_respo_bp.route('/chantier/<string:chantier_id>/ouvriers/<string:ouvrier_id>', methods=['DELETE'])
def remove_ouvrier_from_chantier(chantier_id, ouvrier_id):
    """Supprime un ouvrier d'un chantier en désactivant son affectation"""
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Vérifier que le chantier existe et n'est pas terminé
        cur.execute("SELECT ETAT FROM CHANTIER WHERE ID_CHANTIER = %s", (chantier_id,))
        chantier = cur.fetchone()
        if not chantier:
            return jsonify({'error': "Chantier introuvable"}), 404
        
        if chantier[0] in ['Terminé', 'Archivé']:
            return jsonify({'error': "Impossible de modifier un chantier terminé ou archivé"}), 400
        
        # Trouver l'affectation active
        cur.execute("""
            SELECT ID_AFFECTATION FROM AFFECTATION 
            WHERE ID_CHANTIER = %s AND ID_OUVRIER = %s AND ACTIF = TRUE
        """, (chantier_id, ouvrier_id))
        
        affectation = cur.fetchone()
        if not affectation:
            return jsonify({'error': "Affectation active introuvable"}), 404
        
        # Désactiver l'affectation
        cur.execute("""
            UPDATE AFFECTATION 
            SET ACTIF = FALSE 
            WHERE ID_AFFECTATION = %s
        """, (affectation[0],))
        
        conn.commit()
        return jsonify({'message': 'Ouvrier retiré du chantier avec succès'})
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()

# 2. Si vous avez d'autres requêtes avec UNSIGNED, remplacez-les toutes par INTEGER

# 3. Vérifiez que votre route est bien enregistrée dans votre app principal :
# app.register_blueprint(update_chantier_respo_bp)

@update_chantier_respo_bp.route('/chantier/<string:chantier_id>/ouvriers', methods=['POST'])
def add_ouvrier_to_chantier(chantier_id):
    """Ajoute un ouvrier à un chantier"""
    data = request.get_json()
    ouvrier_id = data.get('ouvrier_id')
    
    if not ouvrier_id:
        return jsonify({'error': "ID ouvrier requis"}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT ETAT FROM CHANTIER WHERE ID_CHANTIER = %s", (chantier_id,))
        chantier = cur.fetchone()
        if not chantier:
            return jsonify({'error': "Chantier introuvable"}), 404
        
        if chantier[0] in ['Terminé', 'Archivé']:
            return jsonify({'error': "Impossible de modifier un chantier terminé ou archivé"}), 400
        
        cur.execute("SELECT ACTIF FROM OUVRIER WHERE ID_OUVRIER = %s", (ouvrier_id,))
        ouvrier = cur.fetchone()
        if not ouvrier or not ouvrier[0]:
            return jsonify({'error': "Ouvrier introuvable ou inactif"}), 400
        
        cur.execute("""
            SELECT COUNT(*) FROM AFFECTATION 
            WHERE ID_OUVRIER = %s AND ACTIF = TRUE
        """, (ouvrier_id,))
        
        if cur.fetchone()[0] > 0:
            return jsonify({'error': "L'ouvrier est déjà affecté à un chantier"}), 400
        
        # CORRECTION: Remplacer UNSIGNED par INTEGER pour PostgreSQL
        cur.execute("SELECT COALESCE(MAX(CAST(SUBSTRING(ID_AFFECTATION, 4) AS INTEGER)), 0) + 1 FROM AFFECTATION WHERE ID_AFFECTATION LIKE 'AFF%'")
        next_id = cur.fetchone()[0]
        affectation_id = f"AFF{next_id:06d}"
        
        cur.execute("""
            INSERT INTO AFFECTATION (ID_AFFECTATION, ID_CHANTIER, ID_OUVRIER, DATE_AFFECTATION, ACTIF)
            VALUES (%s, %s, %s, CURRENT_DATE, TRUE)
        """, (affectation_id, chantier_id, ouvrier_id))
        
        conn.commit()
        return jsonify({'message': 'Ouvrier affecté au chantier avec succès'})
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()

@update_chantier_respo_bp.route('/chantier/<string:id>', methods=['DELETE'])
def archive_chantier(id):
    """Archive un chantier (suppression logique)"""
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Vérifier si le chantier existe
        cur.execute("SELECT ETAT, archived FROM CHANTIER WHERE ID_CHANTIER = %s", (id,))
        chantier = cur.fetchone()
        if not chantier:
            return jsonify({'error': "Chantier introuvable"}), 404
        
        etat, archived = chantier
        if etat == 'En cours':
            return jsonify({'error': "Impossible d'archiver un chantier en cours"}), 400
        
        if archived:
            return jsonify({'message': "Chantier déjà archivé"}), 200
        
        # Mise à jour du champ archived à TRUE
        cur.execute("UPDATE CHANTIER SET archived = TRUE WHERE ID_CHANTIER = %s", (id,))
        
        # Désactiver les affectations actives liées
        cur.execute("""
            UPDATE AFFECTATION 
            SET ACTIF = FALSE 
            WHERE ID_CHANTIER = %s AND ACTIF = TRUE
        """, (id,))
        
        conn.commit()
        return jsonify({'message': 'Chantier archivé avec succès'})
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()

@update_chantier_respo_bp.route('/chantier/<string:chantier_id>/ouvriers', methods=['GET'])
def get_chantier_ouvriers(chantier_id):
    """Récupère la liste des ouvriers affectés à un chantier"""
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT o.ID_OUVRIER, o.NOM, o.PRENOM, a.DATE_AFFECTATION
            FROM OUVRIER o
            JOIN AFFECTATION a ON o.ID_OUVRIER = a.ID_OUVRIER
            WHERE a.ID_CHANTIER = %s AND a.ACTIF = TRUE
            ORDER BY o.NOM, o.PRENOM
        """, (chantier_id,))
        
        ouvriers = cur.fetchall()
        ouvriers_list = []
        
        for ouvrier in ouvriers:
            ouvriers_list.append({
                'id': ouvrier[0],
                'nom': ouvrier[1],
                'prenom': ouvrier[2],
                'nom_complet': f"{ouvrier[2]} {ouvrier[1]}",
                'date_affectation': ouvrier[3].isoformat() if ouvrier[3] else None
            })
        
        return jsonify({
            'success': True,
            'ouvriers': ouvriers_list
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
