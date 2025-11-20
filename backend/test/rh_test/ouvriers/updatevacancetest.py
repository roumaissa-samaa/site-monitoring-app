import requests

url = 'http://localhost:5000/rh/ouvriers/1/vacance'  # remplace 1 par l'ID d'ouvrier que tu veux tester

data = {
    "jours_vacance": 15
}

response = requests.patch(url, json=data)

print('Status:', response.status_code)
print('Réponse:', response.json())
