function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

function isAdmin() {
  const user = getUser();
  return user?.role === "admin";
}

function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function updateNav() {
  const navAuth = document.getElementById("nav-auth");
  if (!navAuth) return;

  const user = getUser();
  if (user) {
    navAuth.innerHTML = `
      <span class="text-sm text-gray-600 hidden sm:inline">${user.email || user.phone}</span>
      <button id="logout-btn" class="text-sm font-medium text-red-600 hover:text-red-700">Logout</button>
    `;
    document.getElementById("logout-btn")?.addEventListener("click", () => {
      clearSession();
      window.location.href = "/";
    });
  } else {
    navAuth.innerHTML = `<a href="/login.html" class="btn-primary text-sm">Sign In</a>`;
  }
}

document.addEventListener("DOMContentLoaded", updateNav);

window.auth = { getUser, isLoggedIn, isAdmin, saveSession, clearSession, updateNav };
