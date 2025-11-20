import requests

BASE_URL = "http://localhost:5000"  # Change if your Flask app runs elsewhere

def test_generate_report(user_id, etat=None):
    params = {'genere_par': user_id}
    if etat:
        params['etat'] = etat

    response = requests.get(f"{BASE_URL}/manager/reports/generate", params=params)

    print(f"Status code: {response.status_code}")
    try:
        data = response.json()
        print("Response JSON:")
        print(data)
    except Exception as e:
        print("Failed to parse JSON:", e)
        print("Raw response text:", response.text)

if __name__ == "__main__":
    user_id = 5  # Replace with a valid user ID from your UTILISATEUR table
    etat = None  # Or a chantier state string like 'En cours'

    test_generate_report(user_id, etat)
