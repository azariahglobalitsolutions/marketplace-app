const PHONE_COUNTRIES = [
  { code: "US", label: "🇺🇸 United States (+1)", dial: "1", placeholder: "240-444-2668" },
  { code: "CA", label: "🇨🇦 Canada (+1)", dial: "1", placeholder: "416-555-0100" },
  { code: "ET", label: "🇪🇹 Ethiopia (+251)", dial: "251", placeholder: "91 123 4567" },
  { code: "ER", label: "🇪🇷 Eritrea (+291)", dial: "291", placeholder: "7 123 4567" },
  { code: "GB", label: "🇬🇧 United Kingdom (+44)", dial: "44", placeholder: "7911 123456" },
  { code: "DE", label: "🇩🇪 Germany (+49)", dial: "49", placeholder: "151 12345678" },
  { code: "SE", label: "🇸🇪 Sweden (+46)", dial: "46", placeholder: "70 123 4567" },
  { code: "AE", label: "🇦🇪 UAE (+971)", dial: "971", placeholder: "50 123 4567" },
  { code: "SA", label: "🇸🇦 Saudi Arabia (+966)", dial: "966", placeholder: "50 123 4567" },
];

function digitsOnly(value) {
  return (value || "").replace(/\D/g, "");
}

function formatPhoneDisplay(phone, country = "US") {
  if (!phone) return "";
  const digits = digitsOnly(phone);
  const c = (country || "US").toUpperCase();

  if (c === "US" || c === "CA") {
    let national = digits;
    if (digits.length === 11 && digits.startsWith("1")) national = digits.slice(1);
    if (national.length === 10) {
      return `+1 ${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`;
    }
    return phone.startsWith("+") ? phone : `+1 ${national}`;
  }

  const entry = PHONE_COUNTRIES.find((x) => x.code === c);
  if (entry && digits.startsWith(entry.dial)) {
    return `+${entry.dial} ${digits.slice(entry.dial.length)}`;
  }

  return phone.startsWith("+") ? phone : `+${digits}`;
}

function phoneToTelLink(phone, country = "US") {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  if (phone.trim().startsWith("+")) return `+${digits}`;

  const c = (country || "US").toUpperCase();
  if (c === "US" || c === "CA") {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  }

  const entry = PHONE_COUNTRIES.find((x) => x.code === c);
  if (entry) {
    if (digits.startsWith(entry.dial)) return `+${digits}`;
    return `+${entry.dial}${digits}`;
  }

  return `+${digits}`;
}

function buildCountrySelect(name, selected = "US") {
  return `
    <select name="${name}" class="phone-country-select border rounded-lg px-2 py-2 text-sm w-36">
      ${PHONE_COUNTRIES.map((c) =>
        `<option value="${c.code}" ${c.code === selected ? "selected" : ""}>${c.label}</option>`
      ).join("")}
    </select>`;
}

function bindPhoneCountryPlaceholder(countrySelect, phoneInput) {
  const update = () => {
    const entry = PHONE_COUNTRIES.find((c) => c.code === countrySelect.value);
    if (entry) phoneInput.placeholder = entry.placeholder;
  };
  countrySelect.addEventListener("change", update);
  update();
}

window.phoneUtils = {
  PHONE_COUNTRIES,
  formatPhoneDisplay,
  phoneToTelLink,
  buildCountrySelect,
  bindPhoneCountryPlaceholder,
};
