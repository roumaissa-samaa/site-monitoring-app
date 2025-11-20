# modiftest.py
import requests

url = "http://127.0.0.1:5000/chantierrespo/CH0001"   # remplace CH001 par un ID réel
payload = {
    "etat": "En cours",
    "responsable_id": 3,
    "chef_chantier_id": 4,
    "ouvriers": [1,2]
}

try:
    response = requests.put(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Erreur lors de la requête:", e)
