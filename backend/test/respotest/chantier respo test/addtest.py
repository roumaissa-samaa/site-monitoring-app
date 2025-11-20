import requests
from datetime import date

url = "http://127.0.0.1:5000/chantier"

data = {
    "nom": "Nouveau Chantier",
    "description": "Travaux de construction",
    "localisation": "Casablanca",
    "etat": "En cours",
    "date_debut": str(date.today()),
    "date_fin_estimee": str(date.today()),
    "responsable_id": 3,   # ID numérique existant
    "chef_chantier_id": 7, # ID numérique existant
    "budget": 100000,
    "ouvriers": [1, 2]     # IDs numériques existants
}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response text:", response.text)
except Exception as e:
    print("Erreur lors de la requête:", e)
