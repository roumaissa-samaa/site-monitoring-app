import requests

# URL de l'API (ajuste le port si nécessaire)
url = "http://localhost:5000/responsable/dashboard"

try:
    response = requests.get(url)
    if response.status_code == 200:
        dashboard_data = response.json()
        print("Données du dashboard :")
        print(dashboard_data)
    else:
        print(f"Erreur {response.status_code} : {response.text}")
except Exception as e:
    print("Erreur lors de la requête :", e)
