const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

let selectedState = localStorage.getItem("selectedState") || "";

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

function renderEventCard(event) {
  const contact = auth.isLoggedIn()
    ? `<div class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
         <p class="font-medium text-gray-800">Organizer Contact</p>
         ${event.contact_email ? `<p>Email: <a href="mailto:${event.contact_email}" class="text-amber-700">${event.contact_email}</a></p>` : ""}
         ${event.contact_phone ? `<p>Phone: <a href="tel:${event.contact_phone}" class="text-amber-700">${event.contact_phone}</a></p>` : ""}
       </div>`
    : `<p class="mt-3 text-sm text-amber-700"><a href="/login.html" class="underline">Sign in</a> to view organizer contact details</p>`;

  return `
    <article class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-900">${event.title}</h3>
          <p class="text-sm text-amber-700 font-medium">${event.city}, ${event.state}</p>
        </div>
        <span class="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">
          ${formatTime(event.start_time)}${event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
        </span>
      </div>
      ${event.venue ? `<p class="text-sm text-gray-500 mt-1">📍 ${event.venue}</p>` : ""}
      <p class="text-gray-600 mt-3 text-sm leading-relaxed">${event.description}</p>
      ${contact}
    </article>
  `;
}

function renderEvents(grouped) {
  const container = document.getElementById("events-container");
  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-xl text-gray-500">No events found${selectedState ? ` in ${selectedState}` : ""}.</p>
        <p class="text-gray-400 mt-2">Check back soon or try another state.</p>
      </div>`;
    return;
  }

  container.innerHTML = dates.map((date) => `
    <section class="mb-10">
      <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span class="w-2 h-8 bg-amber-500 rounded-full"></span>
        ${formatDate(date)}
      </h2>
      <div class="grid gap-4 md:grid-cols-2">
        ${grouped[date].map(renderEventCard).join("")}
      </div>
    </section>
  `).join("");
}

async function loadEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = `<p class="text-center text-gray-400 py-12">Loading events...</p>`;

  try {
    const query = selectedState ? `?state=${encodeURIComponent(selectedState)}` : "";
    const data = await api.get(`/api/events${query}`);
    renderEvents(data.grouped);
    document.getElementById("event-count").textContent = data.events.length;
    document.getElementById("filter-label").textContent = selectedState || "All States";
  } catch (err) {
    container.innerHTML = `<p class="text-center text-red-500 py-12">${err.message}</p>`;
  }
}

function setupStateFilter() {
  const select = document.getElementById("state-filter");
  select.innerHTML = `<option value="">All States</option>` +
    US_STATES.map((s) => `<option value="${s}" ${s === selectedState ? "selected" : ""}>${s}</option>`).join("");

  select.addEventListener("change", (e) => {
    selectedState = e.target.value;
    if (selectedState) {
      localStorage.setItem("selectedState", selectedState);
    } else {
      localStorage.removeItem("selectedState");
    }
    loadEvents();
  });
}

function setupCreateForm() {
  const form = document.getElementById("create-event-form");
  const panel = document.getElementById("create-panel");
  const toggle = document.getElementById("toggle-create");
  const message = document.getElementById("create-message");

  if (!auth.isLoggedIn()) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  toggle?.addEventListener("click", () => form.classList.toggle("hidden"));

  const stateSelect = form.querySelector('[name="state"]');
  stateSelect.innerHTML = US_STATES.map((s) => `<option value="${s}">${s}</option>`).join("");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.className = "text-sm mt-3";
    message.textContent = "Submitting...";

    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const data = await api.post("/api/events", body);
      message.className = "text-sm mt-3 text-green-600";
      message.textContent = data.message;
      form.reset();
    } catch (err) {
      message.className = "text-sm mt-3 text-red-600";
      message.textContent = err.message;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupStateFilter();
  loadEvents();
  setupCreateForm();
});
