from flask import Flask, request, jsonify
import psycopg2
import datetime
import numpy as np
import face_recognition
import cv2
import os
import base64
from io import BytesIO
from PIL import Image

# --- Connexion PostgreSQL ---
DB_CONFIG = {
    "host": "localhost",
    "database": "gestion_chantier",
    "user": "postgres",
    "password": "roumaissa"
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

# --- Traiter image depuis le frontend ---
def process_image_from_path(image_path):
    """Process image from file path and extract face encoding"""
    try:
        # Lire l'image
        image = face_recognition.load_image_file(image_path)
        
        # Détecter les visages
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return None, "Aucun visage détecté dans l'image"
        
        # Obtenir l'encoding du premier visage trouvé
        face_encodings = face_recognition.face_encodings(image, face_locations)
        if not face_encodings:
            return None, "Impossible d'extraire l'encoding du visage"
        
        return face_encodings[0], "Visage détecté avec succès"
    
    except Exception as e:
        return None, f"Erreur lors du traitement de l'image: {str(e)}"

# --- Comparer visage ---
def comparer_visage(known_encodings, face_to_check, tolerance=0.5):
    """Compare face encoding with known faces"""
    if len(known_encodings) == 0:
        return None
    
    distances = face_recognition.face_distance(known_encodings, face_to_check)
    best_match = np.argmin(distances)
    
    if distances[best_match] < tolerance:
        return best_match, distances[best_match]
    return None, None

# --- Flask App ---
app = Flask(__name__)

# --- 1️⃣ Enregistrer le visage d'un ouvrier ---
@app.route("/register_face", methods=["POST"])
@app.route("/register_face", methods=["POST"])
def register_face():
    data = request.json
    ouvrier_id = data.get("ID_OUVRIER")
    nom = data.get("NOM", "")

    if not ouvrier_id:
        return jsonify({"error": "ID_OUVRIER requis"}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        # Vérifier si l'ouvrier existe
        cursor.execute("SELECT * FROM OUVRIER WHERE ID_OUVRIER=%s", (ouvrier_id,))
        emp = cursor.fetchone()
        if not emp:
            print(f"[DEBUG] Ouvrier {ouvrier_id} non trouvé dans la base.")
            return jsonify({"error": "Ouvrier non trouvé"}), 404
        print(f"[DEBUG] Ouvrier {ouvrier_id} trouvé.")

        # Vérifier si ce ouvrier a déjà un visage enregistré
        cursor.execute("SELECT * FROM faces WHERE ID_OUVRIER=%s", (ouvrier_id,))
        face_exist = cursor.fetchone()
        if face_exist:
            print(f"[DEBUG] Ouvrier {ouvrier_id} a déjà un visage enregistré.")
            return jsonify({"error": "Ce ouvrier a déjà un visage enregistré"}), 400

        # Chercher l'image temporaire créée par le frontend
        temp_image_path = f"temp_registration_{ouvrier_id}.jpg"
        print(f"[DEBUG] Vérification de l'image temporaire: {temp_image_path}")
        if not os.path.exists(temp_image_path):
            print(f"[DEBUG] Image temporaire non trouvée pour {ouvrier_id}")
            return jsonify({"error": "Image de visage non trouvée"}), 400

        # Traiter l'image
        encoding, message = process_image_from_path(temp_image_path)
        print(f"[DEBUG] Face detection message: {message}")
        if encoding is None:
            return jsonify({"error": message}), 400

        # Vérifier si ce visage correspond déjà à un autre ouvrier
        cursor.execute("SELECT ID_OUVRIER, face_encoding FROM faces")
        all_faces = cursor.fetchall()

        for f in all_faces:
            existing_encoding = np.frombuffer(f[1], dtype=np.float64)
            match_index, distance = comparer_visage([existing_encoding], encoding)
            if match_index is not None:
                print(f"[DEBUG] Visage similaire déjà enregistré pour {f[0]} avec distance {distance:.4f}")
                return jsonify({
                    "error": f"Ce visage est déjà enregistré pour l'ouvrier {f[0]} (similarité: {1-distance:.2%})"
                }), 400

        # Enregistrer dans la table faces
        cursor.execute(
            "INSERT INTO faces (ID_OUVRIER, face_encoding) VALUES (%s, %s)",
            (ouvrier_id, encoding.tobytes())
        )
        conn.commit()
        print(f"[DEBUG] Visage de l'ouvrier {ouvrier_id} enregistré avec succès.")

        # Nettoyer l'image temporaire
        try:
            os.remove(temp_image_path)
        except Exception as e:
            print(f"[DEBUG] Impossible de supprimer l'image temporaire: {str(e)}")

        return jsonify({
            "success": True,
            "message": f"Visage de l'ouvrier {ouvrier_id} enregistré avec succès",
            "ouvrier_id": ouvrier_id,
            "nom": nom
        })

    except Exception as e:
        conn.rollback()
        print(f"[DEBUG] Erreur lors de l'enregistrement: {str(e)}")
        return jsonify({"error": f"Erreur lors de l'enregistrement: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

# --- 2️⃣ Pointage automatique avec intervalle minimal de 2h ---
@app.route("/pointage", methods=["GET"])
def pointage():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Récupérer tous les visages enregistrés
        cursor.execute("SELECT face_id, ID_OUVRIER, face_encoding FROM faces")
        faces = cursor.fetchall()
        if not faces:
            return jsonify({"error": "Aucun visage enregistré dans le système"}), 400

        # Chercher l'image temporaire créée par le frontend
        temp_image_path = "temp_verification.jpg"
        if not os.path.exists(temp_image_path):
            return jsonify({"error": "Image de vérification non trouvée. Assurez-vous que la caméra a capturé une image."}), 400

        # Traiter l'image de vérification
        face_encoding, message = process_image_from_path(temp_image_path)
        if face_encoding is None:
            return jsonify({"error": message}), 400

        # Préparer les données pour la comparaison
        face_encodings = [np.frombuffer(f[2], dtype=np.float64) for f in faces]
        ouvrier_ids = [f[1] for f in faces]

        # Comparer avec tous les visages enregistrés
        match_index, distance = comparer_visage(face_encodings, face_encoding)
        if match_index is None:
            return jsonify({
                "error": "Visage non reconnu",
                "message": "Aucune correspondance trouvée dans la base de données"
            }), 404

        ouvrier_id = ouvrier_ids[match_index]
        confidence = (1 - distance) * 100

        # Récupérer les infos de l'ouvrier
        cursor.execute("SELECT NOM, PRENOM FROM OUVRIER WHERE ID_OUVRIER=%s", (ouvrier_id,))
        ouvrier_info = cursor.fetchone()
        ouvrier_name = f"{ouvrier_info[1]} {ouvrier_info[0]}" if ouvrier_info else "Inconnu"

        # Gestion du pointage
        today = datetime.date.today()
        cursor.execute(
            "SELECT ID_POINTAGE, HEURE_ARRIVEE, HEURE_DEPART FROM POINTAGE WHERE ID_OUVRIER=%s AND DATE_POINTAGE=%s",
            (ouvrier_id, today)
        )
        presence = cursor.fetchone()

        now = datetime.datetime.now().time().replace(microsecond=0)

        if presence is None:
            # Premier scan → arrivée
            cursor.execute(
                "INSERT INTO POINTAGE (ID_OUVRIER, DATE_POINTAGE, HEURE_ARRIVEE, STATUS) VALUES (%s, %s, %s, 'Absent')",
                (ouvrier_id, today, now)
            )
            conn.commit()
            
            result = {
                "success": True,
                "action": "arrival",
                "ouvrier_id": ouvrier_id,
                "nom": ouvrier_name,
                "heure_arrivee": str(now),
                "confidence": f"{confidence:.1f}%",
                "message": f"Arrivée enregistrée à {now}",
                "note": "Statut temporaire: Absent (sera mis à jour au départ)"
            }
            
        else:
            if presence[2] is None:
                # Vérifier l'intervalle minimum de 2h
                now_datetime = datetime.datetime.combine(today, now)
                arrivee_datetime = datetime.datetime.combine(today, presence[1])
                delta = (now_datetime - arrivee_datetime).total_seconds() / 3600  # heures

                if delta < 2:
                    return jsonify({
                        "success": False,
                        "action": "too_soon",
                        "ouvrier_id": ouvrier_id,
                        "nom": ouvrier_name,
                        "heure_arrivee": str(presence[1]),
                        "message": f"Deuxième pointage trop proche du premier ({delta:.1f}h). Attendez au moins 2 heures.",
                    }), 400

                # Deuxième scan → départ
                cursor.execute(
                    "UPDATE POINTAGE SET HEURE_DEPART=%s, STATUS='Present' WHERE ID_POINTAGE=%s",
                    (now, presence[0])
                )
                conn.commit()

                result = {
                    "success": True,
                    "action": "departure", 
                    "ouvrier_id": ouvrier_id,
                    "nom": ouvrier_name,
                    "heure_arrivee": str(presence[1]),
                    "heure_depart": str(now),
                    "confidence": f"{confidence:.1f}%",
                    "message": f"Départ enregistré à {now}",
                    "note": "Statut mis à jour: Present"
                }
            else:
                result = {
                    "success": True,
                    "action": "already_complete",
                    "ouvrier_id": ouvrier_id,
                    "nom": ouvrier_name,
                    "heure_arrivee": str(presence[1]),
                    "heure_depart": str(presence[2]),
                    "confidence": f"{confidence:.1f}%",
                    "message": "Pointage déjà complet pour aujourd'hui"
                }

        # Nettoyer l'image temporaire
        try:
            os.remove(temp_image_path)
        except:
            pass
            
        return jsonify(result)
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur lors du pointage: {str(e)}"}), 500
        
    finally:
        cursor.close()
        conn.close()

# --- 3️⃣ Obtenir la liste des ouvriers ---
@app.route("/ouvriers", methods=["GET"])
def get_ouvriers():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT ID_OUVRIER, NOM, PRENOM FROM OUVRIER ORDER BY NOM, PRENOM")
        ouvriers = cursor.fetchall()
        
        result = []
        for o in ouvriers:
            result.append({
                "id": o[0],
                "nom": o[1], 
                "prenom": o[2],
                "nom_complet": f"{o[2]} {o[1]}"
            })
            
        return jsonify({"ouvriers": result})
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la récupération des ouvriers: {str(e)}"}), 500
        
    finally:
        cursor.close()
        conn.close()

# --- 4️⃣ Vérifier l'existence d'un ouvrier ---
@app.route("/check_ouvrier/<ouvrier_id>", methods=["GET"])
def check_ouvrier(ouvrier_id):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT ID_OUVRIER, NOM, PRENOM FROM OUVRIER WHERE ID_OUVRIER=%s", (ouvrier_id,))
        ouvrier = cursor.fetchone()
        
        if ouvrier:
            # Vérifier s'il a déjà un visage enregistré
            cursor.execute("SELECT COUNT(*) FROM faces WHERE ID_OUVRIER=%s", (ouvrier_id,))
            has_face = cursor.fetchone()[0] > 0
            
            return jsonify({
                "exists": True,
                "id": ouvrier[0],
                "nom": ouvrier[1],
                "prenom": ouvrier[2],
                "nom_complet": f"{ouvrier[2]} {ouvrier[1]}",
                "has_face": has_face
            })
        else:
            return jsonify({"exists": False})
            
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la vérification: {str(e)}"}), 500
        
    finally:
        cursor.close()
        conn.close()

# --- 5️⃣ Statistiques de pointage ---
@app.route("/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        today = datetime.date.today()
        
        # Présents aujourd'hui
        cursor.execute("SELECT COUNT(*) FROM POINTAGE WHERE DATE_POINTAGE=%s AND STATUS='Present'", (today,))
        presents = cursor.fetchone()[0]
        
        # Absents aujourd'hui
        cursor.execute("SELECT COUNT(*) FROM POINTAGE WHERE DATE_POINTAGE=%s AND STATUS='Absent'", (today,))
        absents = cursor.fetchone()[0]
        
        # En cours (arrivés mais pas encore partis)
        cursor.execute("SELECT COUNT(*) FROM POINTAGE WHERE DATE_POINTAGE=%s AND HEURE_ARRIVEE IS NOT NULL AND HEURE_DEPART IS NULL", (today,))
        en_cours = cursor.fetchone()[0]
        
        # Total ouvriers
        cursor.execute("SELECT COUNT(*) FROM OUVRIER")
        total_ouvriers = cursor.fetchone()[0]
        
        # Visages enregistrés
        cursor.execute("SELECT COUNT(*) FROM faces")
        faces_registered = cursor.fetchone()[0]
        
        return jsonify({
            "today": str(today),
            "presents": presents,
            "absents": absents,
            "en_cours": en_cours,
            "total_ouvriers": total_ouvriers,
            "faces_registered": faces_registered,
            "coverage": f"{(faces_registered/total_ouvriers*100):.1f}%" if total_ouvriers > 0 else "0%"
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur lors du calcul des statistiques: {str(e)}"}), 500
        
    finally:
        cursor.close()
        conn.close()

# --- 6️⃣ Compléter absences à minuit ---
def completer_absences():
    conn = get_db()
    cursor = conn.cursor()
    today = datetime.date.today()
    
    try:
        # Récupérer tous les ouvriers
        cursor.execute("SELECT ID_OUVRIER FROM OUVRIER")
        ouvriers = [o[0] for o in cursor.fetchall()]

        # Récupérer ceux qui ont scanné
        cursor.execute("SELECT ID_OUVRIER, HEURE_ARRIVEE, HEURE_DEPART FROM POINTAGE WHERE DATE_POINTAGE=%s", (today,))
        pointages = cursor.fetchall()
        
        scanned_ids = set()
        for p in pointages:
            if p[1] and p[2]:
                scanned_ids.add(p[0])
            else:
                # Si pas de départ → statut Absent
                cursor.execute("UPDATE POINTAGE SET STATUS='Absent' WHERE ID_OUVRIER=%s AND DATE_POINTAGE=%s", (p[0], today))

        # Ceux qui n'ont pas scanné du tout
        absents = set(ouvriers) - scanned_ids
        for o in absents:
            cursor.execute(
                "INSERT INTO POINTAGE (ID_OUVRIER, DATE_POINTAGE, STATUS) VALUES (%s, %s, 'Absent')",
                (o, today)
            )

        conn.commit()
        print(f"Absences complétées pour {len(absents)} ouvriers")
        
    except Exception as e:
        print(f"Erreur lors de la complétion des absences: {str(e)}")
        conn.rollback()
        
    finally:
        cursor.close()
        conn.close()


# --- Route de test ---
@app.route("/test", methods=["GET"])
def test():
    return jsonify({
        "message": "Backend de reconnaissance faciale fonctionnel",
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoints": [
            "POST /register_face",
            "GET /pointage", 
            "GET /ouvriers",
            "GET /check_ouvrier/<id>",
            "GET /stats"
        ]
    })

# --- Lancer l'application ---
if __name__ == "__main__":
    print("🚀 Démarrage du backend de reconnaissance faciale...")
    print("📡 Serveur disponible sur http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
