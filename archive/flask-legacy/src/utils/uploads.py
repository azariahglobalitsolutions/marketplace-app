import os
import uuid
from pathlib import Path

from werkzeug.utils import secure_filename

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "public" / "uploads"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_IMAGES = {"jpg", "jpeg", "png", "gif", "webp"}
ALLOWED_ATTACHMENTS = ALLOWED_IMAGES | {"pdf", "doc", "docx"}


def ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _extension(filename):
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()


def save_upload(file, allowed_extensions, prefix="file"):
    if not file or not file.filename:
        return None, None

    ext = _extension(file.filename)
    if ext not in allowed_extensions:
        raise ValueError(f"File type .{ext} is not allowed")

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        raise ValueError("File must be 5 MB or smaller")

    ensure_upload_dir()
    safe_name = secure_filename(file.filename)
    stored_name = f"{prefix}_{uuid.uuid4().hex[:12]}_{safe_name}"
    path = UPLOAD_DIR / stored_name
    file.save(path)

    return f"/uploads/{stored_name}", safe_name
