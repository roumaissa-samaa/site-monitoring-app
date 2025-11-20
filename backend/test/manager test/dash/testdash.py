import requests

url = 'http://localhost:5000/manager/dashboard'
response = requests.get(url)

print('Status:', response.status_code)
print('JSON:', response.json())
