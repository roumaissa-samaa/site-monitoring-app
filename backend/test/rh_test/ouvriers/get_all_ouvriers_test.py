import requests

url = "http://localhost:5000/rh/ouvriers"

response = requests.get(url)

print("Status:", response.status_code)
try:
    print("JSON:", response.json())
except Exception:
    print("Texte brut:", response.text)
