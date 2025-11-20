from flask import Blueprint, request, jsonify, Response
from database import get_db
import csv
from io import StringIO, BytesIO
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

rapport_bp = Blueprint('rapport', __name__)

@rapport_bp.route('/responsable/chantier/<string:chantier_id>/generer_rapport', methods=['POST'])
def generer_rapport(chantier_id):
    """
    Reçoit JSON :
    {
        "description": "Rapport sur l'avancement",
        "genere_par": 1,  # ID de l'utilisateur
        "format": "csv" ou "pdf"
    }
    """
    data = request.get_json()
    description = data.get('description')
    genere_par = data.get('genere_par')
    format_rapport = data.get('format', 'csv').lower()

    conn = get_db()
    cur = conn.cursor()

    # Stocker le rapport dans la base
    insert_query = """
    INSERT INTO RAPPORT (CHANTIER_ID, DATE_RAPPORT, DESCRIPTION, GENERE_PAR)
    VALUES (%s, %s, %s, %s)
    RETURNING ID_RAPPORT
    """
    today = date.today()
    cur.execute(insert_query, (chantier_id, today, description, genere_par))
    rapport_id = cur.fetchone()[0]
    conn.commit()

    # Récupérer les affectations
    csv_query = """
    SELECT o.NOM, o.PRENOM, a.DATE_AFFECTATION
    FROM AFFECTATION a
    JOIN OUVRIER o ON a.ID_OUVRIER = o.ID_OUVRIER
    WHERE a.ID_CHANTIER = %s
    ORDER BY a.DATE_AFFECTATION
    """
    cur.execute(csv_query, (chantier_id,))
    affectations = cur.fetchall()

    if format_rapport == 'pdf':
        # Générer PDF
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle(f"Rapport Chantier {chantier_id}")
        pdf.setFont("Helvetica", 12)
        y = 800
        pdf.drawString(50, y, f"Rapport Chantier {chantier_id} - {today}")
        y -= 30
        pdf.drawString(50, y, f"Description: {description}")
        y -= 30
        pdf.drawString(50, y, "Nom Ouvrier | Prénom Ouvrier | Date Affectation")
        y -= 20
        for a in affectations:
            line = f"{a[0]} | {a[1]} | {a[2]}"
            pdf.drawString(50, y, line)
            y -= 20
            if y < 50:
                pdf.showPage()
                y = 800
        pdf.save()
        buffer.seek(0)
        return Response(
            buffer,
            mimetype='application/pdf',
            headers={"Content-disposition": f"attachment; filename=rapport_chantier_{chantier_id}.pdf"}
        )

    else:
        # Générer CSV
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Nom Ouvrier', 'Prénom Ouvrier', 'Date Affectation'])
        for a in affectations:
            writer.writerow([a[0], a[1], a[2]])
        csv_data = output.getvalue()
        output.close()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={"Content-disposition": f"attachment; filename=rapport_chantier_{chantier_id}.csv"}
        )
