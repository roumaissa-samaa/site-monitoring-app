import requests

# Exemple d'URL, remplace par ton endpoint réel
url = "http://localhost:5000/admin/utilisateurs"

# Exemple de paramètres : archived = true ou false
params = {
    "archived": "false"  # ou "true" pour récupérer les utilisateurs archivés
}

response = requests.get(url, params=params)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
