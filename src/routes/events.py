from flask import Blueprint, g, jsonify, request

from src.config.db import CATEGORIES, query_all, query_get, query_run
from src.middleware.auth import authenticate, optional_auth

events_bp = Blueprint("events", __name__)

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
        "category": row.get("category", "events"),
        "title": row["title"],
        "description": row["description"],
        "state": row["state"],
        "city": row["city"],
        "venue": row["venue"],
        "event_date": row.get("event_date"),
        "start_time": row.get("start_time"),
        "end_time": row.get("end_time"),
        "status": row["status"],
        "created_at": row["created_at"],
    }
    if include_contact:
        listing["contact_email"] = row.get("contact_email")
        listing["contact_phone"] = row.get("contact_phone")
    return listing


@events_bp.get("/states")
def states():
    return jsonify({"states": US_STATES})


@events_bp.get("/", strict_slashes=False)
@optional_auth
def list_events():
    """Backward-compatible alias — returns events category only."""
    state = request.args.get("state")
    is_authed = g.user is not None
    params = ["events"]
    sql = "SELECT * FROM listings WHERE status = 'approved' AND category = ?"

    if state:
        sql += " AND state = ?"
        params.append(state)

    sql += " ORDER BY event_date ASC, start_time ASC"
    rows = query_all(sql, tuple(params))
    events = [format_listing(row, is_authed) for row in rows]

    grouped = {}
    for event in events:
        grouped.setdefault(event["event_date"] or "Unscheduled", []).append(event)

    return jsonify({"events": events, "grouped": grouped, "state": state})


@events_bp.post("/", strict_slashes=False)
@authenticate
def create_event():
    data = request.get_json(silent=True) or {}
    data["category"] = "events"
    from src.routes.listings import create_listing
    with request.environ.copy():
        pass
    return _create_from_data(data)


def _create_from_data(data):
    title = data.get("title")
    description = data.get("description")
    state = data.get("state")
    city = data.get("city")
    venue = data.get("venue")
    event_date = data.get("event_date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    contact_email = data.get("contact_email") or g.user.get("email")
    contact_phone = data.get("contact_phone") or g.user.get("phone")

    if not all([title, description, state, city, event_date]):
        return jsonify({"error": "Title, description, state, city, and event date are required"}), 400

    if state not in US_STATES:
        return jsonify({"error": "Invalid US state"}), 400

    listing_id = query_run(
        """INSERT INTO listings (
          category, title, description, state, city, venue, event_date,
          start_time, end_time, organizer_id, contact_email, contact_phone, status
        ) VALUES ('events', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
        (
            title, description, state, city, venue, event_date,
            start_time, end_time, g.user["id"], contact_email, contact_phone,
        ),
    )

    listing = query_get("SELECT * FROM listings WHERE id = ?", (listing_id,))
    return jsonify({
        "message": "Event submitted for admin approval",
        "event": format_listing(listing, True),
    }), 201
