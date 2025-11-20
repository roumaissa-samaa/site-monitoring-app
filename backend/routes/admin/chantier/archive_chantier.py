from flask import Blueprint, jsonify, request
from database import get_db

archive_chantier_bp = Blueprint('archive_chantier', __name__)

@archive_chantier_bp.route('/chantier/<string:id>/archive', methods=['PUT'])
def archive_chantier(id):
    """
    Archive ou désarchive un chantier.
    Pour archiver: { "archive": true }
    Pour désarchiver: { "archive": false }
    """
    conn = get_db()
    cur = conn.cursor()
    try:
        # Récupérer le statut depuis la requête, par défaut True
        data = request.get_json() or {}
        archive_status = data.get("archive", True)

        cur.execute("""
            UPDATE CHANTIER
            SET ARCHIVED=%s
            WHERE ID_CHANTIER=%s
        """, (archive_status, id))
        conn.commit()

        if cur.rowcount == 0:
            return jsonify({'error': 'Chantier non trouvé'}), 404

        action = "archivé" if archive_status else "désarchivé"
        return jsonify({'message': f'Chantier {action}'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
