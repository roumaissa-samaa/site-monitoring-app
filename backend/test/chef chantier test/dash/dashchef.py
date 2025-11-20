import requests

# ID numérique du chef de chantier
chef_id = 7
url = "http://127.0.0.1:5000/chef/dashboard"

params = {
    "chef_id": chef_id
}

response = requests.get(url, params=params)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
