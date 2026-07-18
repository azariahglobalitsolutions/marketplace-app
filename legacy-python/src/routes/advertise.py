from flask import Blueprint, jsonify, request

from src.config.db import query_run

advertise_bp = Blueprint("advertise", __name__)

TIERS = [
    {
        "id": "starter",
        "name": "Starter Spotlight",
        "price": "$49",
        "period": "per event",
        "features": ["Homepage feature for 3 days", "State filter priority", "Social share badge"],
    },
    {
        "id": "growth",
        "name": "Growth Boost",
        "price": "$129",
        "period": "per month",
        "features": ["Top of daily calendar", "Featured in newsletter", "Banner on advertise page", "Priority support"],
        "popular": True,
    },
    {
        "id": "premium",
        "name": "Premium Partner",
        "price": "$299",
        "period": "per month",
        "features": ["Nationwide homepage hero", "Dedicated account manager", "Custom landing page", "Analytics dashboard"],
    },
]


@advertise_bp.get("/tiers")
def tiers():
    return jsonify({"tiers": TIERS})


@advertise_bp.post("/inquiry")
def inquiry():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    tier = data.get("tier")
    message = data.get("message")

    if not all([name, email, tier]):
        return jsonify({"error": "Name, email, and tier are required"}), 400

    if not any(t["id"] == tier for t in TIERS):
        return jsonify({"error": "Invalid pricing tier"}), 400

    inquiry_id = query_run(
        "INSERT INTO ad_inquiries (name, email, phone, tier, message) VALUES (?, ?, ?, ?, ?)",
        (name, email, phone, tier, message),
    )

    return jsonify({
        "message": "Your advertising inquiry has been received. We will contact you shortly.",
        "inquiryId": inquiry_id,
    }), 201
