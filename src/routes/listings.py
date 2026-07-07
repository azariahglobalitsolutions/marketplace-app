from flask import Blueprint, g, jsonify, request

from src.config.db import CATEGORIES, query_all, query_get, query_run
from src.middleware.auth import authenticate, optional_auth
from src.utils.uploads import ALLOWED_ATTACHMENTS, ALLOWED_IMAGES, save_upload

listings_bp = Blueprint("listings", __name__)

US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming",
]


def format_listing(row, include_contact=False):
    listing = {
        "id": row["id"],
        "category": row["category"],
        "title": row["title"],
        "description": row["description"],
        "state": row["state"],
        "city": row["city"],
        "venue": row["venue"],
        "event_date": row["event_date"],
        "start_time": row["start_time"],
        "end_time": row["end_time"],
        "image_url": row.get("image_url"),
        "logo_url": row.get("logo_url"),
        "attachment_url": row.get("attachment_url"),
        "attachment_name": row.get("attachment_name"),
        "status": row["status"],
        "created_at": row["created_at"],
    }
    if include_contact:
        listing["contact_email"] = row.get("contact_email")
        listing["contact_phone"] = row.get("contact_phone")
    return listing


def _parse_form_data():
    if request.content_type and "multipart/form-data" in request.content_type:
        return request.form.to_dict()
    return request.get_json(silent=True) or {}


@listings_bp.get("/categories")
def categories():
    return jsonify({
        "categories": [{"id": k, "label": v} for k, v in CATEGORIES.items()],
    })


@listings_bp.get("/states")
def states():
    return jsonify({"states": US_STATES})


@listings_bp.get("/", strict_slashes=False)
@optional_auth
def list_listings():
    category = request.args.get("category", "events")
    state = request.args.get("state")

    if category not in CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    is_authed = g.user is not None
    params = [category]
    sql = "SELECT * FROM listings WHERE status = 'approved' AND category = ?"

    if state:
        sql += " AND state = ?"
        params.append(state)

    if category == "events":
        sql += " ORDER BY event_date ASC, start_time ASC"
    else:
        sql += " ORDER BY title ASC"

    rows = query_all(sql, tuple(params))
    listings = [format_listing(row, is_authed) for row in rows]

    grouped = {}
    if category == "events":
        for item in listings:
            key = item["event_date"] or "Unscheduled"
            grouped.setdefault(key, []).append(item)
    else:
        grouped = {"all": listings}

    return jsonify({
        "listings": listings,
        "grouped": grouped,
        "category": category,
        "state": state,
    })


@listings_bp.get("/my")
@authenticate
def my_listings():
    rows = query_all(
        "SELECT * FROM listings WHERE organizer_id = ? ORDER BY created_at DESC",
        (g.user["id"],),
    )
    return jsonify({"listings": [format_listing(row, True) for row in rows]})


@listings_bp.get("/<int:listing_id>")
@optional_auth
def get_listing(listing_id):
    row = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    if not row:
        return jsonify({"error": "Listing not found"}), 404

    user = g.user
    if row["status"] != "approved" and (
        not user or (user["id"] != row["organizer_id"] and user.get("role") != "admin")
    ):
        return jsonify({"error": "Listing not found"}), 404

    return jsonify({"listing": format_listing(row, bool(user))})


@listings_bp.post("/", strict_slashes=False)
@authenticate
def create_listing():
    data = _parse_form_data()
    category = data.get("category", "events")
    title = data.get("title")
    description = data.get("description")
    state = data.get("state")
    city = data.get("city")
    venue = data.get("venue")
    event_date = data.get("event_date") or None
    start_time = data.get("start_time") or None
    end_time = data.get("end_time") or None
    contact_email = data.get("contact_email") or g.user.get("email")
    contact_phone = data.get("contact_phone") or g.user.get("phone")

    if category not in CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    if not all([title, description, state, city]):
        return jsonify({"error": "Title, description, state, and city are required"}), 400

    if category == "events" and not event_date:
        return jsonify({"error": "Event date is required for events"}), 400

    if state not in US_STATES:
        return jsonify({"error": "Invalid US state"}), 400

    try:
        image_url, _ = save_upload(request.files.get("picture"), ALLOWED_IMAGES, "picture")
        logo_url, _ = save_upload(request.files.get("logo"), ALLOWED_IMAGES, "logo")
        attachment_url, attachment_name = save_upload(
            request.files.get("attachment"), ALLOWED_ATTACHMENTS, "attachment"
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    listing_id = query_run(
        """INSERT INTO listings (
          category, title, description, state, city, venue, event_date,
          start_time, end_time, organizer_id, contact_email, contact_phone,
          image_url, logo_url, attachment_url, attachment_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
        (
            category, title, description, state, city, venue, event_date,
            start_time, end_time, g.user["id"], contact_email, contact_phone,
            image_url, logo_url, attachment_url, attachment_name,
        ),
    )

    listing = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    return jsonify({
        "message": "Listing submitted for admin approval",
        "listing": format_listing(listing, True),
    }), 201
