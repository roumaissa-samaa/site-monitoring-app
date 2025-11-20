from flask import Blueprint, request, jsonify
from database import get_db

get_pointages_bp = Blueprint('get_pointages', __name__)

@get_pointages_bp.route('/rh/pointages', methods=['GET'])
def get_pointages():
    id_ouvrier = request.args.get('id_ouvrier')  # facultatif
    date_pointage = request.args.get('date_pointage')  # facultatif

    conn = get_db()
    cur = conn.cursor()

    query = "SELECT ID_POINTAGE, ID_OUVRIER, DATE_POINTAGE, HEURE_ARRIVEE, HEURE_DEPART FROM POINTAGE"
    params = []

    conditions = []
    if id_ouvrier:
        conditions.append("ID_OUVRIER = %s")
        params.append(id_ouvrier)
    if date_pointage:
        conditions.append("DATE_POINTAGE = %s")
        params.append(date_pointage)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY DATE_POINTAGE DESC"

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()

    pointages = []
    for row in rows:
        pointages.append({
            'id_pointage': row[0],
            'id_ouvrier': row[1],
            'date_pointage': row[2].isoformat(),
            'heure_arrivee': str(row[3]) if row[3] else None,
            'heure_depart': str(row[4]) if row[4] else None
        })

    return jsonify(pointages)
