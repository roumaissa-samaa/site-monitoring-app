import requests

url = 'http://localhost:5000/manager/chantier'

try:
    response = requests.get(url)
    print("Status:", response.status_code)
    if response.status_code == 200:
        chantiers = response.json()
        print("Chantiers reçus:")
        for chantier in chantiers:
            print(f"- {chantier['nom']} (ID: {chantier['id']}) - Etat: {chantier['etat']}")
    else:
        print("Erreur:", response.text)
except Exception as e:
    print("Erreur lors de la requête:", str(e))
