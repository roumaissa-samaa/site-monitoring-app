import requests

url = "http://127.0.0.1:5000/chantiers"

response = requests.get(url)

print("Status Code:", response.status_code)
try:
    print("Response JSON:", response.json())
except Exception:
    print("Texte brut:", response.text)
