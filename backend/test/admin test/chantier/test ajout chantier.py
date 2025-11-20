import requests

url = "http://127.0.0.1:5000/chantier"

payload = {
    "nom": "Chantier Test",
    "description": "Construction d'un immeuble résidentiel",
    "localisation": "Casablanca",
    "etat": "En cours",  # Doit correspondre à une valeur de ton enum etat_chantier
    "date_debut": "2025-08-10",
    "date_fin_estimee": "2025-12-20",
    "responsable_id": 3,      # ID existant dans UTILISATEUR
    "chef_chantier_id": 5,    # ID existant dans UTILISATEUR
    "budget": 150000,
    "ouvriers": [1, 2, 3]
}

response = requests.post(url, json=payload)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
