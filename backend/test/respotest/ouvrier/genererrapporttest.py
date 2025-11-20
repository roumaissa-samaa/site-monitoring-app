import requests
import json

BASE_URL = "http://127.0.0.1:5000"  # adapte selon ton serveur Flask

chantier_id = "CH0001"

# Test CSV
data_csv = {
    "description": "Rapport test CSV",
    "genere_par": 1,
    "format": "csv"
}

response_csv = requests.post(
    f"{BASE_URL}/responsable/chantier/{chantier_id}/generer_rapport",
    json=data_csv
)

if response_csv.status_code == 200:
    with open(f"rapport_{chantier_id}.csv", "wb") as f:
        f.write(response_csv.content)
    print("CSV généré avec succès !")
else:
    print("Erreur CSV :", response_csv.status_code, response_csv.text)

# Test PDF
data_pdf = {
    "description": "Rapport test PDF",
    "genere_par": 1,
    "format": "pdf"
}

response_pdf = requests.post(
    f"{BASE_URL}/responsable/chantier/{chantier_id}/generer_rapport",
    json=data_pdf
)

if response_pdf.status_code == 200:
    with open(f"rapport_{chantier_id}.pdf", "wb") as f:
        f.write(response_pdf.content)
    print("PDF généré avec succès !")
else:
    print("Erreur PDF :", response_pdf.status_code, response_pdf.text)
