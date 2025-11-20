import requests

url = "http://localhost:5000/rh/ouvriers/1"  # Ici 1 est l'ID de l'ouvrier à modifier

data = {
    "nom": "DupontModif",
    "prenom": "JeanModif",
    "telephone": "0699887766",
    "specialite": "Peintre",
    "actif": True
}

response = requests.put(url, json=data)

print("Status:", response.status_code)
try:
    print("JSON:", response.json())
except Exception:
    print("Texte brut:", response.text)
