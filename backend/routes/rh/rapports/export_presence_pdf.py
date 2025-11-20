from io import BytesIO
from flask import Blueprint, request, send_file
from database import get_db
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

export_pdf_bp = Blueprint('export_pdf', __name__)

@export_pdf_bp.route('/rh/rapports/presence/export_pdf', methods=['GET'])
def export_presence_pdf():
    date_debut = request.args.get('date_debut')
    date_fin = request.args.get('date_fin')

    if not date_debut or not date_fin:
        return "Les paramètres date_debut et date_fin sont requis", 400

    conn = get_db()
    cur = conn.cursor()
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

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica", 14)
    c.drawString(30, height - 50, f"Rapport de présence du {date_debut} au {date_fin}")

    c.setFont("Helvetica", 12)
    y = height - 80
    c.drawString(30, y, "ID Ouvrier")
    c.drawString(120, y, "Nom")
    c.drawString(250, y, "Prénom")
    c.drawString(380, y, "Jours de présence")
    y -= 20

    for row in rows:
        if y < 50:
            c.showPage()
            y = height - 50
        c.drawString(30, y, str(row[0]))
        c.drawString(120, y, row[1])
        c.drawString(250, y, row[2])
        c.drawString(380, y, str(row[3]))
        y -= 20

    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"rapport_presence_{date_debut}_to_{date_fin}.pdf",
        mimetype='application/pdf'
    )
