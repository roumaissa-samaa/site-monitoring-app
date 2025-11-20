import requests

chantier_id = "CH0003"  # remplace par un ID réel
url = f"http://127.0.0.1:5000/responsable/chantier/{chantier_id}"

try:
    response = requests.get(url)
    print("Status Code:", response.status_code)
    print("Response text brut:", response.text)
    
    if response.status_code == 200:
        chantier = response.json()
        print("Chantier :", chantier)
except Exception as e:
    print("Erreur lors de la requête:", e)
