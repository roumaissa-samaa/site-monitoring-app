import requests

BASE_URL = "http://127.0.0.1:5000/chef/alertes"

# ----------- Test POST (Créer une alerte) -----------
payload_post = {
    "chef_chantier_id": 4,               # ID du chef de chantier
    "chantier_id": "CH0001",             # ID du chantier existant
    "message": "Problème sur la fondation, intervention urgente"
}

response_post = requests.post(BASE_URL, json=payload_post)

print("POST Status Code:", response_post.status_code)
print("POST Response JSON:", response_post.json())
