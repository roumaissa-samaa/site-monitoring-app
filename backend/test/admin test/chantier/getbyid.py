import requests

def test_get_chantier_by_id(id):
    url = f'http://localhost:5000/chantier/{id}'
    response = requests.get(url)
    
    print(f'Status code: {response.status_code}')
    try:
        data = response.json()
    except Exception as e:
        print("Erreur lors du décodage JSON:", e)
        data = response.text
    
    print('Response data:', data)

if __name__ == '__main__':
    test_get_chantier_by_id('CH0003')  # teste avec ID=1
