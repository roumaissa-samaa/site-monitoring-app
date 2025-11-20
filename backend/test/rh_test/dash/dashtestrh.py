import requests

url = 'http://localhost:5000/rh/dashboard/'

response = requests.get(url)

print("Status:", response.status_code)
try:
    print("JSON:", response.json())
except Exception as e:
    print("Erreur parsing JSON:", e)
