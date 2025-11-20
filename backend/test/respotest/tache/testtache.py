import requests

BASE_URL = "http://localhost:5000"
chantier_id = "CH0001"

response = requests.get(f"{BASE_URL}/responsable/chantier/{chantier_id}/taches")

if response.status_code == 200:
    taches = response.json()
    print("Liste des tâches :")
    
    for t in taches:
        # t[0] = ID_TACHE, t[1] = TITRE, t[2] = DESCRIPTION, t[3] = DATE_DEBUT, t[4] = DATE_FIN
        print(f"ID: {t[0]}, Titre: {t[1]}, Description: {t[2]}, Début: {t[3]}, Fin: {t[4]}")
else:
    print(f"Erreur {response.status_code}: {response.text}")
