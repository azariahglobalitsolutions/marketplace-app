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

const CATEGORIES = {
  events: {
    label: "Habesha Event & Activities",
    heroTitle: "What's Happening Each Day",
    heroSubtitle: "Discover Habesha cultural events, concerts, and community gatherings across the United States — organized by day.",
    empty: "No events found",
  },
  restaurants: {
    label: "Restaurants and Lounge",
    heroTitle: "Habesha Restaurants & Lounges",
    heroSubtitle: "Find authentic Ethiopian and Eritrean dining, coffee ceremonies, and lounge experiences near you.",
    empty: "No restaurants found",
  },
  health: {
    label: "Health and Wellness",
    heroTitle: "Health & Wellness",
    heroSubtitle: "Connect with clinics, counselors, and wellness providers serving the Habesha community.",
    empty: "No health listings found",
  },
  education: {
    label: "Education and Training",
    heroTitle: "Education & Training",
    heroSubtitle: "Language schools, tutoring, tech training, and professional development for our community.",
    empty: "No education listings found",
  },
  communities: {
    label: "Communities and Networking",
    heroTitle: "Communities & Networking",
    heroSubtitle: "Professional networks, support groups, and community organizations across the USA.",
    empty: "No community listings found",
  },
};

let selectedState = localStorage.getItem("selectedState") || "";
let activeCategory = localStorage.getItem("activeCategory") || "events";

function formatDate(dateStr) {
  if (!dateStr || dateStr === "Unscheduled") return dateStr;
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function renderListingCard(listing) {
  const contact = auth.isLoggedIn()
    ? `<div class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
         <p class="font-medium text-gray-800">Contact</p>
         ${listing.contact_email ? `<p>Email: <a href="mailto:${listing.contact_email}" class="text-amber-700">${listing.contact_email}</a></p>` : ""}
         ${listing.contact_phone ? `<p>Phone: <a href="tel:${listing.contact_phone_tel || listing.contact_phone}" class="text-amber-700">${listing.contact_phone}</a></p>` : ""}
       </div>`
    : `<p class="mt-3 text-sm text-amber-700"><a href="/login.html" class="underline">Sign in</a> to view contact details</p>`;

  const timeBadge = listing.start_time
    ? `<span class="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">${formatTime(listing.start_time)}${listing.end_time ? ` – ${formatTime(listing.end_time)}` : ""}</span>`
    : "";

  const imageBlock = listing.image_url
    ? `<img src="${listing.image_url}" alt="${listing.title}" class="w-full h-40 object-cover rounded-lg mb-3">`
    : "";

  const logoBlock = listing.logo_url
    ? `<img src="${listing.logo_url}" alt="Logo" class="h-10 w-auto object-contain mb-2">`
    : "";

  const attachmentBlock = listing.attachment_url
    ? `<a href="${listing.attachment_url}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline mt-2">📎 ${listing.attachment_name || "View attachment"}</a>`
    : "";

  return `
    <article class="glass-panel rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      ${imageBlock}
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          ${logoBlock}
          <h3 class="text-lg font-bold text-gray-900">${listing.title}</h3>
          <p class="text-sm text-amber-700 font-medium">${listing.city}, ${listing.state}</p>
        </div>
        ${timeBadge}
      </div>
      ${listing.venue ? `<p class="text-sm text-gray-500 mt-1">📍 ${listing.venue}</p>` : ""}
      <p class="text-gray-600 mt-3 text-sm leading-relaxed">${listing.description}</p>
      ${attachmentBlock}
      ${contact}
    </article>
  `;
}

function renderListings(grouped) {
  const container = document.getElementById("listings-container");
  const meta = CATEGORIES[activeCategory];
  const keys = Object.keys(grouped);

  if (keys.length === 0 || (keys.length === 1 && grouped[keys[0]]?.length === 0)) {
    container.innerHTML = `
      <div class="text-center py-16 glass-panel rounded-xl">
        <p class="text-xl text-gray-500">${meta.empty}${selectedState ? ` in ${selectedState}` : ""}.</p>
        <p class="text-gray-400 mt-2">Check back soon or try another state.</p>
      </div>`;
    return;
  }

  if (activeCategory === "events") {
    const dates = keys.filter((k) => grouped[k]?.length).sort();
    container.innerHTML = dates.map((date) => `
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow">
          <span class="w-2 h-8 bg-amber-500 rounded-full"></span>
          ${formatDate(date)}
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          ${grouped[date].map(renderListingCard).join("")}
        </div>
      </section>
    `).join("");
  } else {
    const items = grouped.all || [];
    container.innerHTML = `
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${items.map(renderListingCard).join("")}
      </div>`;
  }
}

async function loadListings() {
  const container = document.getElementById("listings-container");
  container.innerHTML = `<p class="text-center text-gray-300 py-12">Loading listings...</p>`;

  try {
    const params = new URLSearchParams({ category: activeCategory });
    if (selectedState) params.set("state", selectedState);

    const data = await api.get(`/api/listings?${params}`);
    renderListings(data.grouped);
    document.getElementById("listing-count").textContent = data.listings.length;
    document.getElementById("filter-label").textContent = selectedState || "All States";
  } catch (err) {
    container.innerHTML = `<p class="text-center text-red-400 py-12">${err.message}</p>`;
  }
}

function updateHero() {
  const meta = CATEGORIES[activeCategory];
  document.getElementById("hero-title").textContent = meta.heroTitle;
  document.getElementById("hero-subtitle").textContent = meta.heroSubtitle;
}

function setupCategoryTabs() {
  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === activeCategory);
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category;
      localStorage.setItem("activeCategory", activeCategory);
      document.querySelectorAll(".category-tab").forEach((t) =>
        t.classList.toggle("active", t.dataset.category === activeCategory)
      );
      updateHero();
      updateCreateForm();
      loadListings();
    });
  });
}

function setupStateFilter() {
  const select = document.getElementById("state-filter");
  select.innerHTML = `<option value="">All States</option>` +
    US_STATES.map((s) => `<option value="${s}" ${s === selectedState ? "selected" : ""}>${s}</option>`).join("");

  select.addEventListener("change", (e) => {
    selectedState = e.target.value;
    if (selectedState) localStorage.setItem("selectedState", selectedState);
    else localStorage.removeItem("selectedState");
    loadListings();
  });
}

function updateCreateForm() {
  const dateFields = document.getElementById("event-date-fields");
  const dateInput = document.querySelector('[name="event_date"]');
  const isEvent = activeCategory === "events";

  dateFields.classList.toggle("hidden", !isEvent);
  dateInput.required = isEvent;

  document.getElementById("create-heading").textContent =
    `Post a New ${CATEGORIES[activeCategory].label} Listing`;
}

function setupFilePreviews() {
  const pictureInput = document.querySelector('[name="picture"]');
  const logoInput = document.querySelector('[name="logo"]');
  const attachmentInput = document.querySelector('[name="attachment"]');

  pictureInput?.addEventListener("change", (e) => {
    const preview = document.getElementById("preview-picture");
    const file = e.target.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  });

  logoInput?.addEventListener("change", (e) => {
    const preview = document.getElementById("preview-logo");
    const file = e.target.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  });

  attachmentInput?.addEventListener("change", (e) => {
    const preview = document.getElementById("preview-attachment");
    const file = e.target.files[0];
    if (file) {
      preview.textContent = `Selected: ${file.name}`;
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  });
}

function setupCreateForm() {
  const form = document.getElementById("create-listing-form");
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

  const countryContainer = document.getElementById("contact-phone-country");
  if (countryContainer) {
    countryContainer.innerHTML = phoneUtils.buildCountrySelect("contact_phone_country", "US");
    const countrySelect = form.querySelector('[name="contact_phone_country"]');
    const phoneInput = form.querySelector('[name="contact_phone"]');
    phoneUtils.bindPhoneCountryPlaceholder(countrySelect, phoneInput);
  }

  updateCreateForm();
  setupFilePreviews();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.className = "text-sm mt-3";
    message.textContent = "Submitting...";

    const formData = new FormData(form);
    formData.set("category", activeCategory);

    try {
      const data = await api.postForm("/api/listings", formData);
      message.className = "text-sm mt-3 text-green-600";
      message.textContent = data.message;
      form.reset();
      document.getElementById("preview-picture").classList.add("hidden");
      document.getElementById("preview-logo").classList.add("hidden");
      document.getElementById("preview-attachment").classList.add("hidden");
    } catch (err) {
      message.className = "text-sm mt-3 text-red-600";
      message.textContent = err.message;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCategoryTabs();
  setupStateFilter();
  updateHero();
  loadListings();
  setupCreateForm();
});
