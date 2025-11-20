import requests

# URL de ton API Flask
BASE_URL = "http://localhost:5000"  # adapte si ton serveur tourne sur un autre port ou host

# ID du chantier à tester
chantier_id = "CH0001"  # remplace par un ID réel dans ta base

# Requête GET
response = requests.get(f"{BASE_URL}/responsable/chantier/{chantier_id}/affectations")

# Vérification du statut
if response.status_code == 200:
    affectations = response.json()
    print("Liste des affectations :")
    
    for a in affectations:
        # a[0] = ID_AFFECTATION, a[1] = DATE_AFFECTATION, a[2] = ID_OUVRIER, a[3] = NOM, a[4] = PRENOM
        print(f"ID Affectation: {a[0]}, Date: {a[1]}, Ouvrier: {a[3]} {a[4]} (ID: {a[2]})")
else:
    print(f"Erreur {response.status_code}: {response.text}")
