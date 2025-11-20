import requests

BASE_URL = "http://127.0.0.1:5000/chef/alertes"

# ----------- Test GET (Lister les alertes) -----------
params_get = {
    "chef_chantier_id": 7  # ID du chef de chantier à tester
}

response_get = requests.get(BASE_URL, params=params_get)

print("GET Status Code:", response_get.status_code)
print("GET Response JSON:", response_get.json())
