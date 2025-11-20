from flask import Blueprint, jsonify
from database import get_db

alertesre_bp = Blueprint('alertesre_bp', __name__)

@alertesre_bp.route('/responsable/alertes/count', methods=['GET'])
def get_alertes_count():
    """Endpoint spécifique pour obtenir le nombre d'alertes actives"""
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*) 
            FROM alertes a
            JOIN chantier c ON a.chantier_id = c.id_chantier
            WHERE a.active = TRUE
        """)
        
        count = cursor.fetchone()[0]
        cursor.close()
        
        return jsonify({
            "success": True,
            "count": count
        })
        
    except Exception as e:
        if 'cursor' in locals():
            cursor.close()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Mise à jour de votre endpoint existant pour plus de robustesse
@alertesre_bp.route('/responsable/alertes', methods=['GET'])
def get_alertes():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT a.id, a.chantier_id, a.message, a.date_alerte, a.active,
                   c.nom AS nom_chantier
            FROM alertes a
            JOIN chantier c ON a.chantier_id = c.id_chantier
            WHERE a.active = TRUE
            ORDER BY a.date_alerte DESC
        """)
        
        alertes = cursor.fetchall()
        
        # Construire la liste des alertes sous forme de dictionnaires
        alertes_list = []
        for alerte in alertes:
            alertes_list.append({
                "id": alerte[0],
                "chantier_id": alerte[1],
                "message": alerte[2],
                "date_alerte": str(alerte[3]),
                "active": alerte[4],
                "nom_chantier": alerte[5]
            })

        cursor.close()
        
        return jsonify({
            "success": True,
            "count": len(alertes_list),
            "alertes": alertes_list
        })
        
    except Exception as e:
        if 'cursor' in locals():
            cursor.close()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500