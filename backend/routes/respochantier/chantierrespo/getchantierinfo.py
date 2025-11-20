from flask import Blueprint, jsonify, request
from database import get_db
import traceback

chantier_detail_bp = Blueprint('chantier_detail', __name__)

@chantier_detail_bp.route('/responsable/chantier/<string:chantier_id>', methods=['GET'])
def get_chantier_details(chantier_id):
    try:
        conn = get_db()
        cur = conn.cursor()

        # Infos principales + chef et responsable
        query_chantier = """
        SELECT 
            c.ID_CHANTIER,
            c.NOM,
            c.DESCRIPTION,
            c.LOCALISATION,
            c.ETAT,
            c.DATE_DEBUT,
            c.DATE_FIN_ESTIMEE,
            c.BUDGET,
            c.RESPONSABLE_ID,
            r.NOM,
            c.CHEF_CHANTIER_ID,
            ch.NOM
        FROM CHANTIER c
        LEFT JOIN UTILISATEUR r ON c.RESPONSABLE_ID = r.ID_UTILISATEUR
        LEFT JOIN UTILISATEUR ch ON c.CHEF_CHANTIER_ID = ch.ID_UTILISATEUR
        WHERE c.ID_CHANTIER = %s
        """
        cur.execute(query_chantier, (chantier_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Chantier non trouvé"}), 404

        chantier = {
            "ID_CHANTIER": row[0],
            "NOM": row[1],
            "DESCRIPTION": row[2],
            "LOCALISATION": row[3],
            "ETAT": row[4],
            "DATE_DEBUT": str(row[5]) if row[5] else None,
            "DATE_FIN_ESTIMEE": str(row[6]) if row[6] else None,
            "BUDGET": row[7],
            "RESPONSABLE_ID": row[8],
            "nom_responsable": row[9],
            "CHEF_CHANTIER_ID": row[10],
            "nom_chef": row[11]
        }

        # Ouvriers affectés via AFFECTATION
        query_ouvriers = """
        SELECT o.ID_OUVRIER, o.NOM, o.PRENOM
        FROM AFFECTATION a
        JOIN OUVRIER o ON a.ID_OUVRIER = o.ID_OUVRIER
        WHERE a.ID_CHANTIER = %s
        """
        cur.execute(query_ouvriers, (chantier_id,))
        ouvriers_rows = cur.fetchall()
        chantier["ouvriers"] = [{"ID_OUVRIER": o[0], "NOM": o[1], "PRENOM": o[2]} for o in ouvriers_rows]

        # Journal du chantier (vide si table n'existe pas)
        try:
            query_journal = """
            SELECT id, DATE, AUTEUR_ID, description
            FROM JOURNAL_CHANTIER
            WHERE ID_CHANTIER = %s
            ORDER BY DATE DESC
            """
            cur.execute(query_journal, (chantier_id,))
            journal_rows = cur.fetchall()
            chantier["journal"] = [{"id": j[0], "DATE": str(j[1]) if j[1] else None, "AUTEUR_ID": j[2], "description": j[3]} for j in journal_rows]
        except Exception:
            chantier["journal"] = []  # Table n'existe pas, on renvoie vide

        cur.close()
        conn.close()
        return jsonify(chantier)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
