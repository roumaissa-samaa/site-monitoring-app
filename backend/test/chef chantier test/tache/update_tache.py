import requests

# ID de la tâche à mettre à jour
id_tache = 1
url = f"http://127.0.0.1:5000/chef/tache/{id_tache}"

# JSON pour mise à jour de la tâche + ajout/suppression d'ouvriers
payload = {
    "titre": "Mise à jour plomberie",
    "description": "Réparer les fuites dans le bâtiment A",
    "date_debut": "2025-08-20",
    "date_fin": "2025-08-25",
    "etat": "En cours",
    "ajouter_ouvriers":[1, 2],
    "supprimer_ouvriers": [3]        # Ouvrier à terminer
}

headers = {
    "Content-Type": "application/json"
}

response = requests.put(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
