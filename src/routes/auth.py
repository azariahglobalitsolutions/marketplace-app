import bcrypt
from flask import Blueprint, g, jsonify, request

from src.config.db import query_get, query_run
from src.middleware.auth import authenticate, create_token
from src.utils.phone import format_phone_display, normalize_phone

auth_bp = Blueprint("auth", __name__)


def _public_user(user):
    country = user.get("phone_country") or "US"
    return {
        "id": user["id"],
        "email": user.get("email"),
        "phone": format_phone_display(user.get("phone"), country) if user.get("phone") else None,
        "phone_country": country,
        "role": user["role"],
    }


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    phone = data.get("phone")
    phone_country = data.get("phone_country") or "US"
    password = data.get("password")

    if not password or (not email and not phone):
        return jsonify({"error": "Email or phone and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if phone:
        phone = normalize_phone(phone, phone_country)

    existing = query_get(
        "SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)",
        (email, phone),
    )
    if existing:
        return jsonify({"error": "Account already exists with this email or phone"}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = query_run(
        "INSERT INTO users (email, phone, phone_country, password_hash) VALUES (?, ?, ?, ?)",
        (email, phone, phone_country, password_hash),
    )
    user = query_get("SELECT id, email, phone, phone_country, role FROM users WHERE id = ?", (user_id,))
    token = create_token(user)
    return jsonify({"token": token, "user": _public_user(user)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    phone = data.get("phone")
    phone_country = data.get("phone_country") or "US"
    password = data.get("password")

    if not password or (not email and not phone):
        return jsonify({"error": "Email or phone and password are required"}), 400

    if phone and not email:
        phone = normalize_phone(phone, phone_country)

    user = query_get("SELECT * FROM users WHERE email = ? OR phone = ?", (email, phone))
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(user)
    return jsonify({"token": token, "user": _public_user(user)})


@auth_bp.get("/me")
@authenticate
def me():
    user = query_get("SELECT id, email, phone, phone_country, role FROM users WHERE id = ?", (g.user["id"],))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": _public_user(user)})
