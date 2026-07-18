import os
from functools import wraps

import jwt
from flask import g, jsonify, request

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")


def _decode_token():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        return jwt.decode(header[7:], JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = _decode_token()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        g.user = user
        return f(*args, **kwargs)

    return wrapper


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = getattr(g, "user", None)
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return wrapper


def optional_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        g.user = _decode_token()
        return f(*args, **kwargs)

    return wrapper


def create_token(user):
    payload = {
        "id": user["id"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "role": user["role"],
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
