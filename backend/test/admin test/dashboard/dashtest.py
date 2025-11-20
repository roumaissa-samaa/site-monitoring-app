import requests

url = "http://localhost:5000/admin/dashboard"
response = requests.get(url)

print("Status:", response.status_code)
print("JSON:", response.json())
