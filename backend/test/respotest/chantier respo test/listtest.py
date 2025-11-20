# list_test.py
import requests

url = "http://127.0.0.1:5000/responsable/chantiers"  # adapte l'URL à ton serveur Flask

try:
    response = requests.get(url)
    print("Status Code:", response.status_code)
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print("Erreur lors de la requête:", e)
