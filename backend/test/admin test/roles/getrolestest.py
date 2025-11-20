import requests

def test_get_roles():
    url = 'http://localhost:5000/admin/roles'  # adapte le port si besoin
    response = requests.get(url)

    print('Status Code:', response.status_code)
    try:
        print('Response JSON:', response.json())
    except Exception:
        print('Response Text:', response.text)

if __name__ == "__main__":
    test_get_roles()
