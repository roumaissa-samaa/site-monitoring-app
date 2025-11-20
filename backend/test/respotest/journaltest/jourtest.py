import requests

chantier_id = "CH0001"
url = f"http://127.0.0.1:5000/responsable/chantier/{chantier_id}/journal"

response = requests.get(url)

if response.status_code == 200:
    journal = response.json()
    for entry in journal:
        print(f"ID: {entry['ID_JOURNAL']}, Date: {entry['DATE_ENTREE']}, Description: {entry['DESCRIPTION']}")
else:
    print("Erreur lors de la requête:", response.status_code)
