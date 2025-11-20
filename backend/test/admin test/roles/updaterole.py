import requests
import json

def test_update_role(user_id, new_role):
    url = f'http://localhost:5000/admin/role/{user_id}'
    payload = {'role': new_role}
    headers = {'Content-Type': 'application/json'}

    response = requests.put(url, data=json.dumps(payload), headers=headers)

    print('Status Code:', response.status_code)
    try:
        print('Response JSON:', response.json())
    except Exception:
        print('Response Text:', response.text)

if __name__ == "__main__":
    # Remplace user_id et new_role par des valeurs valides de ta base
    test_update_role(user_id=1, new_role='Responsable')
