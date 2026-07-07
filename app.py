import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory

from src.middleware.metrics import metrics_middleware
from src.routes.admin import admin_bp
from src.routes.advertise import advertise_bp
from src.routes.auth import auth_bp
from src.routes.events import events_bp

load_dotenv()

PUBLIC_DIR = Path(__file__).resolve().parent / "public"


def create_app():
    app = Flask(__name__, static_folder=str(PUBLIC_DIR), static_url_path="")
    app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "dev-secret-key")

    metrics_middleware(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy", "service": "wube-bereha-habesha-events"})

    @app.get("/")
    def index():
        return send_from_directory(PUBLIC_DIR, "index.html")

    @app.get("/login.html")
    def login_page():
        return send_from_directory(PUBLIC_DIR, "login.html")

    @app.get("/advertise.html")
    def advertise_page():
        return send_from_directory(PUBLIC_DIR, "advertise.html")

    @app.get("/admin/moderation")
    def admin_moderation():
        return send_from_directory(PUBLIC_DIR, "admin.html")

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(advertise_bp, url_prefix="/api/advertise")

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
