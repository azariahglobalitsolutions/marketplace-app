from flask import Blueprint, g, jsonify, request

from src.config.db import query_all, query_get, query_run
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


def format_event(row, include_contact=False):
    event = {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "state": row["state"],
        "city": row["city"],
        "venue": row["venue"],
        "event_date": row["event_date"],
        "start_time": row["start_time"],
        "end_time": row["end_time"],
        "status": row["status"],
        "created_at": row["created_at"],
    }
    if include_contact:
        event["contact_email"] = row.get("contact_email")
        event["contact_phone"] = row.get("contact_phone")
    return event


@events_bp.get("/states")
def states():
    return jsonify({"states": US_STATES})


@events_bp.get("/", strict_slashes=False)
@optional_auth
def list_events():
    state = request.args.get("state")
    is_authed = g.user is not None
    params = []
    sql = "SELECT * FROM events WHERE status = 'approved'"

    if state:
        sql += " AND state = ?"
        params.append(state)

    sql += " ORDER BY event_date ASC, start_time ASC"
    rows = query_all(sql, tuple(params))
    events = [format_event(row, is_authed) for row in rows]

    grouped = {}
    for event in events:
        grouped.setdefault(event["event_date"], []).append(event)

    return jsonify({"events": events, "grouped": grouped, "state": state})


@events_bp.get("/my/listings")
@authenticate
def my_listings():
    rows = query_all(
        "SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC",
        (g.user["id"],),
    )
    return jsonify({"events": [format_event(row, True) for row in rows]})


@events_bp.get("/<int:event_id>")
@optional_auth
def get_event(event_id):
    row = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    if not row:
        return jsonify({"error": "Event not found"}), 404

    user = g.user
    if row["status"] != "approved" and (
        not user or (user["id"] != row["organizer_id"] and user.get("role") != "admin")
    ):
        return jsonify({"error": "Event not found"}), 404

    return jsonify({"event": format_event(row, bool(user))})


@events_bp.post("/", strict_slashes=False)
@authenticate
def create_event():
    data = request.get_json(silent=True) or {}
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

    event_id = query_run(
        """INSERT INTO events (
          title, description, state, city, venue, event_date,
          start_time, end_time, organizer_id, contact_email, contact_phone, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
        (
            title, description, state, city, venue, event_date,
            start_time, end_time, g.user["id"], contact_email, contact_phone,
        ),
    )

    event = query_get("SELECT * FROM events WHERE id = ?", (event_id,))
    return jsonify({
        "message": "Event submitted for admin approval",
        "event": format_event(event, True),
    }), 201
