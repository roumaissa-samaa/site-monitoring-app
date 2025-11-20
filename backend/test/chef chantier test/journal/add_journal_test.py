import requests
from datetime import date

url = "http://127.0.0.1:5000/chef/journal"

# Exemple de données pour créer une entrée de journal
payload = {
    "chantier_id": "CH0001",       # ID du chantier existant
    "date_entree": str(date.today()),  # Date d'entrée (YYYY-MM-DD)
    "description": "Inspection des fondations terminée"
}

response = requests.post(url, json=payload)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
