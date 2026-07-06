from flask import Blueprint, jsonify

from src.config.db import query_all, query_get, query_run
from src.middleware.auth import authenticate, require_admin

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/pending")
@authenticate
@require_admin
def pending_events():
    rows = query_all(
        """SELECT e.*, u.email AS organizer_email, u.phone AS organizer_phone
           FROM events e
           JOIN users u ON u.id = e.organizer_id
           WHERE e.status = 'pending'
           ORDER BY e.created_at ASC"""
    )
    return jsonify({"events": rows})


@admin_bp.post("/<int:event_id>/approve")
@authenticate
@require_admin
def approve_event(event_id):
    event = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    if not event:
        return jsonify({"error": "Event not found"}), 404

    query_run("UPDATE events SET status = 'approved' WHERE id = ?", (event_id,))
    updated = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    return jsonify({"message": "Event approved", "event": updated})


@admin_bp.post("/<int:event_id>/reject")
@authenticate
@require_admin
def reject_event(event_id):
    event = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    if not event:
        return jsonify({"error": "Event not found"}), 404

    query_run("UPDATE events SET status = 'rejected' WHERE id = ?", (event_id,))
    updated = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    return jsonify({"message": "Event rejected", "event": updated})


@admin_bp.get("/ad-inquiries")
@authenticate
@require_admin
def ad_inquiries():
    inquiries = query_all("SELECT * FROM ad_inquiries ORDER BY created_at DESC")
    return jsonify({"inquiries": inquiries})
