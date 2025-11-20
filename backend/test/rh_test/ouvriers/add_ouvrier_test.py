import requests

url = "http://localhost:5000/rh/ouvriers"  # adapte le port si nécessaire

# Données de l'ouvrier à ajouter
data = {
    "nom": "Dupont",
    "prenom": "Jean",
    "cin": "AB1234",
    "telephone": "0612345678",
    "specialite": "Électricien",
    "adresse": "123 Rue de Marrakech"
}

# Envoyer la requête POST
response = requests.post(url, json=data)

# Afficher le code HTTP et la réponse JSON
print("Status code:", response.status_code)
print("Response JSON:", response.json())
