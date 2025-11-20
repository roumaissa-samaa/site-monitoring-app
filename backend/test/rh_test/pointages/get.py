import requests

# Exemple pour récupérer tous les pointages
response = requests.get('http://localhost:5000/rh/pointages')
print(response.json())

# Exemple pour récupérer les pointages d'un ouvrier précis
response = requests.get('http://localhost:5000/rh/pointages', params={'id_ouvrier': 3})
print(response.json())

# Exemple pour récupérer les pointages d'un jour donné
response = requests.get('http://localhost:5000/rh/pointages', params={'date_pointage': '2025-08-10'})
print(response.json())
