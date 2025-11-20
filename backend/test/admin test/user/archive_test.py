import requests

url = "http://localhost:5000/admin/utilisateur/6/archive"  # Remplacez 123 par un ID utilisateur existant
headers = {
    "Content-Type": "application/json"
}

response = requests.patch(url, headers=headers)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())
