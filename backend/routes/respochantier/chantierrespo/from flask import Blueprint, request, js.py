from flask import Blueprint, request, jsonify
import psycopg2
from flask import g
DB_CONFIG = {
    "host": "localhost",
    "database": "gestion_chantier",
    "user": "postgres",
    "password": "roumaissa"
}


def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(**DB_CONFIG)
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_app(app):
    app.teardown_appcontext(close_db)


def get_chefs_disponibles():
    """Récupère les chefs de chantier disponibles (non assignés à un chantier actif)"""
    conn = get_db()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT u.ID_UTILISATEUR, u.NOM, u.PRENOM
            FROM UTILISATEUR u
            LEFT JOIN CHANTIER c
              ON u.ID_UTILISATEUR = c.CHEF_CHANTIER_ID
              AND c.ETAT != 'Terminé'
            WHERE u.ROLE = 'Chef Chantier'
              AND c.CHEF_CHANTIER_ID IS NULL
            ORDER BY u.NOM, u.PRENOM
        """)
        
        chefs = cur.fetchall()
        chefs_list = []
        for chef in chefs:
            chefs_list.append({
                'id': chef[0],
                'nom': chef[1],
                'prenom': chef[2],
                'nom_complet': f"{chef[2]} {chef[1]}"
            })
        
        return jsonify({
            'success': True,
            'chefs': chefs_list
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()