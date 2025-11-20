import requests

id_chantier = 'CH0003' # ID à tester
url = f'http://localhost:5000/journal/{id_chantier}'

response = requests.get(url)

print("Status:", response.status_code)
try:
    print("JSON:", response.json())
except Exception:
    print("Texte brut:", response.text)
