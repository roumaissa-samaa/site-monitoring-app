import requests

url = "http://localhost:5000/admin/utilisateurs/6"# Adjust the ID and port accordingly

data = {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "mot_de_passe": "newpassword123",
    "role": "RH",
    "archived": True
}

response = requests.put(url, json=data)

print("Status code:", response.status_code)
print("Response JSON:", response.json())
