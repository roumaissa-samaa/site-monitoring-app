import requests

# ID de l'ouvrier à archiver
ouvrier_id = 1

url = f"http://localhost:5000/rh/ouvriers/{ouvrier_id}/archive"

response = requests.patch(url)

print("Status:", response.status_code)
try:
    print("JSON:", response.json())
except Exception:
    print("Texte brut:", response.text)
