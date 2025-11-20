import csv
from io import StringIO
from flask import Blueprint, request, Response
from database import get_db

export_reports_csv_bp = Blueprint('export_reports_csv', __name__, url_prefix='/rh/rapports/presence')

@export_reports_csv_bp.route('/export_csv', methods=['GET'])
def export_presence_csv():
    date_debut = request.args.get('date_debut')
    date_fin = request.args.get('date_fin')

    if not date_debut or not date_fin:
        return "Les paramètres date_debut et date_fin sont requis", 400

    conn = get_db()
    cur = conn.cursor()

    # Récupérer la présence des ouvriers entre deux dates
    query = """
        SELECT o.ID_OUVRIER, o.NOM, o.PRENOM, 
               COUNT(p.ID_POINTAGE) AS jours_presence
        FROM OUVRIER o
        LEFT JOIN POINTAGE p ON o.ID_OUVRIER = p.ID_OUVRIER
            AND p.DATE_POINTAGE BETWEEN %s AND %s
        WHERE o.ACTIF = TRUE
        GROUP BY o.ID_OUVRIER, o.NOM, o.PRENOM
        ORDER BY o.NOM, o.PRENOM
    """

    cur.execute(query, (date_debut, date_fin))
    rows = cur.fetchall()
    cur.close()

    # Créer le CSV en mémoire
    si = StringIO()
    writer = csv.writer(si)

    # Entête
    writer.writerow(["ID Ouvrier", "Nom", "Prénom", "Jours de présence"])

    # Lignes
    for row in rows:
        writer.writerow(row)

    output = si.getvalue()
    si.close()

    filename = f"rapport_presence_{date_debut}_to_{date_fin}.csv"

    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
