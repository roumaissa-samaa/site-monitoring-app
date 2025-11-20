import requests
import json

def test_update_chantier(id, etat=None, responsable_id=None, chef_chantier_id=None):
    url = f'http://localhost:5000/chantier/{id}'
    
    payload = {}
    if etat is not None:
        payload['etat'] = etat
    if responsable_id is not None:
        payload['responsable_id'] = responsable_id
    if chef_chantier_id is not None:
        payload['chef_chantier_id'] = chef_chantier_id

    if not payload:
        print("Erreur : au moins un champ doit être fourni pour la mise à jour.")
        return

    headers = {'Content-Type': 'application/json'}

    response = requests.put(url, data=json.dumps(payload), headers=headers)

    print('Status Code:', response.status_code)
    try:
        print('Response JSON:', response.json())
    except Exception:
        print('Response Text:', response.text)

if __name__ == "__main__":
    test_update_chantier(
    id='CH0003',
    etat='En cours',
)

