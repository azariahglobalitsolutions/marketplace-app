from flask import Blueprint, jsonify

from src.config.db import CATEGORIES, query_all, query_get, query_run
from src.middleware.auth import authenticate, require_admin

from src.utils.phone import format_phone_display

admin_bp = Blueprint("admin", __name__)

CATEGORY_LABELS = CATEGORIES


@admin_bp.get("/pending")
@authenticate
@require_admin
def pending_listings():
    rows = query_all(
        """SELECT l.*, u.email AS organizer_email, u.phone AS organizer_phone,
                  u.phone_country AS organizer_phone_country
           FROM listings l
           JOIN users u ON u.id = l.organizer_id
           WHERE l.status = 'pending'
           ORDER BY l.created_at ASC"""
    )
    for row in rows:
        row["category_label"] = CATEGORY_LABELS.get(row["category"], row["category"])
        country = row.get("contact_phone_country") or "US"
        if row.get("contact_phone"):
            row["contact_phone_display"] = format_phone_display(row["contact_phone"], country)
        org_country = row.get("organizer_phone_country") or "US"
        if row.get("organizer_phone"):
            row["organizer_phone_display"] = format_phone_display(row["organizer_phone"], org_country)
    return jsonify({"listings": rows, "events": rows})


@admin_bp.post("/<int:listing_id>/approve")
@authenticate
@require_admin
def approve_listing(listing_id):
    listing = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    if not listing:
        return jsonify({"error": "Listing not found"}), 404

    query_run("UPDATE listings SET status = 'approved' WHERE id = ?", (listing_id,))
    updated = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    return jsonify({"message": "Listing approved", "listing": updated, "event": updated})


@admin_bp.post("/<int:listing_id>/reject")
@authenticate
@require_admin
def reject_listing(listing_id):
    listing = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    if not listing:
        return jsonify({"error": "Listing not found"}), 404

    query_run("UPDATE listings SET status = 'rejected' WHERE id = ?", (listing_id,))
    updated = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    return jsonify({"message": "Listing rejected", "listing": updated, "event": updated})


@admin_bp.get("/ad-inquiries")
@authenticate
@require_admin
def ad_inquiries():
    inquiries = query_all("SELECT * FROM ad_inquiries ORDER BY created_at DESC")
    return jsonify({"inquiries": inquiries})
