import requests

# L’ID du chantier à archiver (doit exister dans ta BDD)
chantier_id = 'CH0002'  

# URL de ton API Flask
url = f"http://127.0.0.1:5000/chantier/{chantier_id}/archive"

# Envoi de la requête PUT
response = requests.put(url)

# Affichage des résultats
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
