# app.py ou login.py
from flask import Flask, request, jsonify
import jwt
from datetime import datetime, timedelta
from database import get_db

app = Flask(__name__)
SECRET_KEY = "kfj39fjr8f9JDF9fj39fjR8fj39fjR3jf9FJ39f"  # change-la pour un secret fort

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    identifiant = data.get("identifiant")
    mot_de_passe = data.get("mot_de_passe")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT ID_CHEF, MOT_DE_PASSE FROM CHEF WHERE ID_CHEF=%s", (identifiant,))
    row = cur.fetchone()

    if not row or row[1] != mot_de_passe:
        return jsonify({"error": "Identifiants invalides"}), 401

    user_id = row[0]

    # Générer le token JWT
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=2)  # valable 2h
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token})
