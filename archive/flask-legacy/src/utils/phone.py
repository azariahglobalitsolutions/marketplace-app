import re

COUNTRY_DIAL_CODES = {
    "US": "1",
    "CA": "1",
    "ET": "251",
    "ER": "291",
    "GB": "44",
    "DE": "49",
    "SE": "46",
    "AE": "971",
    "SA": "966",
}

DEFAULT_COUNTRY = "US"


def _digits_only(value):
    return re.sub(r"\D", "", value or "")


def normalize_phone(phone, country=DEFAULT_COUNTRY):
    """Store phone in E.164 format (+12404442668)."""
    if not phone:
        return None

    country = (country or DEFAULT_COUNTRY).upper()
    dial = COUNTRY_DIAL_CODES.get(country, "")
    digits = _digits_only(phone.strip())

    if not digits:
        return None

    if phone.strip().startswith("+"):
        return f"+{digits}"

    if country in ("US", "CA"):
        if len(digits) == 11 and digits.startswith("1"):
            return f"+{digits}"
        if len(digits) == 10:
            return f"+1{digits}"

    if dial and digits.startswith(dial):
        return f"+{digits}"

    if dial:
        return f"+{dial}{digits}"

    return f"+{digits}"


def format_phone_display(phone, country=DEFAULT_COUNTRY):
    """Format phone for display. US/CA: +1 240-444-2668."""
    if not phone:
        return None

    country = (country or DEFAULT_COUNTRY).upper()
    digits = _digits_only(phone)

    if country in ("US", "CA"):
        if len(digits) == 11 and digits.startswith("1"):
            national = digits[1:]
        elif len(digits) == 10:
            national = digits
        else:
            return phone if str(phone).startswith("+") else f"+{digits}"

        if len(national) == 10:
            return f"+1 {national[:3]}-{national[3:6]}-{national[6:]}"
        return f"+1 {national}"

    dial = COUNTRY_DIAL_CODES.get(country, "")
    if dial and digits.startswith(dial):
        rest = digits[len(dial):]
        return f"+{dial} {rest}"

    if str(phone).startswith("+"):
        return phone

    return f"+{digits}"


def phone_to_tel_link(phone, country=DEFAULT_COUNTRY):
    return normalize_phone(phone, country) or phone
