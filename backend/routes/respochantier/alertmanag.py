# routes/responsable/update_alert_status.py
from flask import Blueprint, request, jsonify
from database import get_db

update_alert_status_bp = Blueprint('update_alert_status', __name__)

@update_alert_status_bp.route('/responsable/alertes/<int:alert_id>/status', methods=['PATCH'])
def update_alert_status(alert_id):
    data = request.get_json()
    active = data.get('active')
    
    if active is None:
        return jsonify({'error': 'Statut active requis'}), 400
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            UPDATE ALERTES 
            SET ACTIVE = %s 
            WHERE ID = %s
        """, (active, alert_id))
        
        if cur.rowcount == 0:
            return jsonify({'error': 'Alerte non trouvée'}), 404
            
        conn.commit()
        return jsonify({'message': 'Statut mis à jour avec succès'})
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()

# routes/responsable/get_all_alerts.py  
from flask import Blueprint, jsonify, request
from database import get_db

get_all_alerts_bp = Blueprint('get_all_alerts', __name__)

@get_all_alerts_bp.route('/responsable/alertes', methods=['GET'])
def get_all_alerts():
    search = request.args.get('search', '')
    
    conn = get_db()
    cur = conn.cursor()
    
    try:
        query = """
            SELECT a.ID, a.CHANTIER_ID, a.MESSAGE, a.DATE_ALERTE, a.ACTIVE, c.NOM as nom_chantier
            FROM ALERTES a
            JOIN CHANTIER c ON a.CHANTIER_ID = c.ID_CHANTIER
        """
        
        params = []
        if search:
            query += " WHERE a.MESSAGE LIKE %s OR c.NOM LIKE %s OR a.CHANTIER_ID LIKE %s"
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
            
        query += " ORDER BY a.DATE_ALERTE DESC"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        alerts = []
        for row in rows:
            alerts.append({
                "id": row[0],
                "chantier_id": row[1], 
                "message": row[2],
                "date_alerte": row[3].isoformat() if row[3] else None,
                "active": row[4],
                "nom_chantier": row[5]
            })
            
        return jsonify(alerts)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()