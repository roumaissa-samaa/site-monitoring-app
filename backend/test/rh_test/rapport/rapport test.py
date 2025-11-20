import requests

# Paramètres de date pour les filtres
params = {
    'date_debut': '2025-07-01',
    'date_fin': '2025-07-10'
}


# Export CSV
url_csv = 'http://localhost:5000/rh/rapports/presence/export_csv'
try:
    r_csv = requests.get(url_csv, params=params)
    r_csv.raise_for_status()  # Lève une erreur si status != 200
    with open('rapport_presence.csv', 'wb') as f:
        f.write(r_csv.content)
    print("CSV sauvegardé avec succès.")
except requests.exceptions.RequestException as e:
    print('Erreur export CSV:', e)

# Export PDF
url_pdf = 'http://localhost:5000/rh/rapports/presence/export_pdf'
try:
    r_pdf = requests.get(url_pdf, params=params)
    r_pdf.raise_for_status()
    with open('rapport_presence.pdf', 'wb') as f:
        f.write(r_pdf.content)
    print("PDF sauvegardé avec succès.")
except requests.exceptions.RequestException as e:
    print('Erreur export PDF:', e)
