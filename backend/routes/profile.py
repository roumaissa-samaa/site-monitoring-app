from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash, generate_password_hash
import psycopg2.extras
from database import get_db

user_bp = Blueprint('user', __name__, url_prefix='/user')

# -----------------------
# Récupérer profil
# -----------------------
@user_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Récupérer les informations du profil utilisateur"""
    try:
        db = get_db()
        cursor = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT id_utilisateur, nom, prenom, email, role 
            FROM utilisateur 
            WHERE id_utilisateur = %s AND archived = FALSE
        """, (user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        
        if not user:
            return jsonify({'error': 'Utilisateur introuvable'}), 404
        
        return jsonify({
            'id': user['id_utilisateur'],
            'nom': user['nom'],
            'prenom': user['prenom'],
            'email': user['email'],
            'role': user['role']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# -----------------------
# Mettre à jour profil
# -----------------------
@user_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_user_profile(user_id):
    """Mettre à jour les informations du profil utilisateur"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        required_fields = ['nom', 'prenom', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Vérifier si l'email existe déjà pour un autre utilisateur
        cursor.execute("""
            SELECT id_utilisateur FROM utilisateur 
            WHERE email = %s AND id_utilisateur != %s AND archived = FALSE
        """, (data['email'], user_id))
        
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Cet email est déjà utilisé par un autre utilisateur'}), 400
        
        # Mise à jour
        cursor.execute("""
            UPDATE utilisateur 
            SET nom = %s, prenom = %s, email = %s
            WHERE id_utilisateur = %s AND archived = FALSE
        """, (data['nom'], data['prenom'], data['email'], user_id))
        
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({'error': 'Utilisateur introuvable'}), 404
        
        db.commit()
        cursor.close()
        
        return jsonify({'message': 'Profil mis à jour avec succès'}), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

# -----------------------
# Changer mot de passe
# -----------------------
@user_bp.route('/change-password/<int:user_id>', methods=['POST'])
def change_password(user_id):
    """Changer le mot de passe utilisateur (haché)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        if not all([current_password, new_password, confirm_password]):
            return jsonify({'error': 'Tous les champs sont requis'}), 400
        
        if new_password != confirm_password:
            return jsonify({'error': 'Les nouveaux mots de passe ne correspondent pas'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Le nouveau mot de passe doit contenir au moins 6 caractères'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Récupérer le hash actuel
        cursor.execute("""
            SELECT mot_de_passe FROM utilisateur 
            WHERE id_utilisateur = %s AND archived = FALSE
        """, (user_id,))
        
        user = cursor.fetchone()
        if not user:
            cursor.close()
            return jsonify({'error': 'Utilisateur introuvable'}), 404
        
        stored_password_hash = user[0]
        
        # Vérifier l'ancien mot de passe
        if not check_password_hash(stored_password_hash, current_password):
            cursor.close()
            return jsonify({'error': 'Mot de passe actuel incorrect'}), 400
        
        # Générer le hash du nouveau mot de passe
        new_password_hash = generate_password_hash(new_password)
        
        # Mise à jour
        cursor.execute("""
            UPDATE utilisateur 
            SET mot_de_passe = %s
            WHERE id_utilisateur = %s AND archived = FALSE
        """, (new_password_hash, user_id))
        
        db.commit()
        cursor.close()
        
        return jsonify({'message': 'Mot de passe modifié avec succès'}), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500
