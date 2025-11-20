import requests

# URL de ton endpoint Flask
url = "http://127.0.0.1:5000/chef/taches"

# Cas 1 : ouvriers affectés correctement au chantier
payload_valid = {
    "titre": "Réparation plomberie",
    "description": "Réparer les fuites dans le bâtiment A",
    "date_debut": "2025-08-20",
    "date_fin": "2025-08-25",
    "chantier_id": "CH0005",   # ID du chantier existant
    "id_ouvrier": 1     # ID de l'ouvrier affecté au chantier et actif
}

# Cas 2 : ouvrier non affecté ou inactif
payload_invalid = {
    "titre": "Peinture murs",
    "description": "Peindre les murs du hall",
    "date_debut": "2025-08-21",
    "date_fin": "2025-08-23",
    "chantier_id": "CH0005",
    "id_ouvrier": 3  # ID d'ouvrier non affecté ou inactif
}

headers = {
    "Content-Type": "application/json"
}

# Test du cas valide
response_valid = requests.post(url, json=payload_valid, headers=headers)
print("=== Cas valide ===")
print("Status Code:", response_valid.status_code)
print("Response JSON:", response_valid.json())

# Test du cas invalide
response_invalid = requests.post(url, json=payload_invalid, headers=headers)
print("\n=== Cas invalide ===")
print("Status Code:", response_invalid.status_code)
print("Response JSON:", response_invalid.json())
