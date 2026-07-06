import bcrypt
from flask import Blueprint, g, jsonify, request

from src.config.db import query_get, query_run
from src.middleware.auth import authenticate, create_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not password or (not email and not phone):
        return jsonify({"error": "Email or phone and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = query_get(
        "SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)",
        (email, phone),
    )
    if existing:
        return jsonify({"error": "Account already exists with this email or phone"}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = query_run(
        "INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)",
        (email, phone, password_hash),
    )
    user = query_get("SELECT id, email, phone, role FROM users WHERE id = ?", (user_id,))
    token = create_token(user)
    return jsonify({"token": token, "user": user}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not password or (not email and not phone):
        return jsonify({"error": "Email or phone and password are required"}), 400

    user = query_get("SELECT * FROM users WHERE email = ? OR phone = ?", (email, phone))
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    public_user = {
        "id": user["id"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
    }
    token = create_token(public_user)
    return jsonify({"token": token, "user": public_user})


@auth_bp.get("/me")
@authenticate
def me():
    user = query_get("SELECT id, email, phone, role FROM users WHERE id = ?", (g.user["id"],))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user})
