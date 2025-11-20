from flask import Blueprint, request, send_file, jsonify
from database import get_db
import io
import pandas as pd
from fpdf import FPDF

manager_report_bp = Blueprint('manager_report', __name__, url_prefix='/manager/reports')
@manager_report_bp.route('/export', methods=['GET'])
def export_report():
    try:
        genere_par = request.args.get('genere_par', type=int)
        format_type = request.args.get('format', 'csv').lower()

        if not genere_par:
            return jsonify({"error": "Paramètre 'genere_par' obligatoire"}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT ID_RAPPORT, CHANTIER_ID, DATE_RAPPORT, DESCRIPTION, GENERE_PAR
            FROM RAPPORT
            WHERE GENERE_PAR = %s
            ORDER BY DATE_RAPPORT DESC
            """,
            (genere_par,)
        )
        data = cur.fetchall()
        cur.close()

        if not data:
            return jsonify({"error": "Aucun rapport trouvé pour cet utilisateur"}), 404

        df = pd.DataFrame(data, columns=['ID Rapport', 'Chantier ID', 'Date Rapport', 'Description', 'Généré par'])

        if format_type == 'csv':
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name='rapports_utilisateur.csv'
            )

        elif format_type == 'pdf':
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, f'Rapports générés par ID {genere_par}', 0, 1, 'C')
            pdf.ln(10)

            pdf.set_font('Arial', '', 10)
            col_widths = [25, 35, 30, 60, 25]
            headers = ['ID Rapport', 'Chantier ID', 'Date Rapport', 'Description', 'Généré par']

            for i, header in enumerate(headers):
                pdf.cell(col_widths[i], 10, header, border=1)
            pdf.ln()

            for row in data:
                for i, item in enumerate(row):
                    text = str(item)
                    if hasattr(item, 'isoformat'):
                        text = item.isoformat()
                    pdf.cell(col_widths[i], 10, text, border=1)
                pdf.ln()

            pdf_output = io.BytesIO(pdf.output(dest='S').encode('latin1'))
            pdf_output.seek(0)
            return send_file(
                pdf_output,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='rapports_utilisateur.pdf'
            )

        else:
            return jsonify({'error': 'Format non supporté. Choisir csv ou pdf.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500