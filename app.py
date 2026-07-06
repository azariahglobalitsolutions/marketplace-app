import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")


@app.get("/")
def home():
    return render_template(
        "index.html",
        environment=os.getenv("FLASK_ENV", "production"),
    )


@app.get("/login")
def login_page():
    return render_template("login.html")


@app.get("/health")
def health():
    return jsonify({"status": "healthy"})


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    return jsonify(
        {
            "message": "Login endpoint ready",
            "email": email,
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
