// ── API CONFIG ────────────────────────────────────────────
const API_URL = "http://127.0.0.1:8000/api/v1";

function getToken() {
  return localStorage.getItem("dojotrack_token");
}

function setToken(token) {
  localStorage.setItem("dojotrack_token", token);
}

function removeToken() {
  localStorage.removeItem("dojotrack_token");
}

function isLoggedIn() {
  return !!getToken();
}

// ── FETCH HELPER ──────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = "../pages/login.html";
    return;
  }

  return res;
}

// ── AUTH ──────────────────────────────────────────────────
async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  });
  return res;
}

function logout() {
  removeToken();
  window.location.href = "../index.html";
}

// ── MEMBERS ───────────────────────────────────────────────
async function getMembers(params = "") {
  const res = await apiFetch(`/members/${params}`);
  return res.json();
}

// ── SCHEDULES ─────────────────────────────────────────────
async function getSchedules() {
  const res = await apiFetch("/schedules/");
  return res.json();
}

// ── PAYMENTS ──────────────────────────────────────────────
async function getPaymentSummary(month, year) {
  const res = await apiFetch(`/payments/summary?month=${month}&year=${year}`);
  return res.json();
}