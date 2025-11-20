import requests

url = 'http://localhost:5000/admin/utilisateur'
payload = {
    'nom': 'Dupont',
    'prenom': 'Jean',
    'email': 'jean.dupont@example.com',
    'mot_de_passe': 'test123',
    'role': 'Admin'
}
headers = {'Content-Type': 'application/json'}

response = requests.post(url, json=payload, headers=headers)
print('Status Code:', response.status_code)
try:
    print('Response JSON:', response.json())
except Exception as e:
    print('Erreur JSONDecode:', e)
    print('Response Text:', response.text)
