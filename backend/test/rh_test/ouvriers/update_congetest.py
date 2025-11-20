import requests

url = 'http://localhost:5000/rh/ouvriers/1/conge'  # remplace 1 par l'ID d'ouvrier que tu veux tester

data = {
    "jours_conge": 10
}

response = requests.patch(url, json=data)

print('Status:', response.status_code)
print('Réponse:', response.json())
