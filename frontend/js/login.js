// Kalau sudah login, langsung ke dashboard
if (isLoggedIn()) {
  window.location.href = "dashboard.html";
}

// ── GSAP ANIMASI ──────────────────────────────────────────
gsap.from(".login-left", {
  x: -60, opacity: 0, duration: 1, ease: "power3.out"
});

gsap.from("#login-fighter", {
  y: 40, opacity: 0, duration: 1.2, delay: 0.3, ease: "power3.out"
});

gsap.to("#login-fighter", {
  y: -10, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5
});

gsap.from(".login-box", {
  x: 40, opacity: 0, duration: 0.8, delay: 0.2, ease: "power2.out"
});

// ── HANDLE LOGIN ──────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("login-btn");
  const errorEl = document.getElementById("login-error");

  // Validasi
  if (!email || !password) {
    showError("Email dan password wajib diisi!");
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.textContent = "MEMUAT...";
  errorEl.style.display = "none";

  try {
    const res = await login(email, password);
    const data = await res.json();

    if (res.ok) {
      setToken(data.access_token);

      // Animasi sukses sebelum redirect
      gsap.to(".login-box", {
        y: -10, opacity: 0, duration: 0.4, ease: "power2.in",
        onComplete: () => {
          window.location.href = "dashboard.html";
        }
      });
    } else {
      showError(data.detail || "Email atau password salah!");
      btn.disabled = false;
      btn.textContent = "MASUK";
    }
  } catch (err) {
    showError("Gagal konek ke server. Pastikan backend jalan!");
    btn.disabled = false;
    btn.textContent = "MASUK";
  }
}

function showError(msg) {
  const el = document.getElementById("login-error");
  el.textContent = msg;
  el.style.display = "block";
  gsap.from(el, { y: -10, opacity: 0, duration: 0.3 });
}

// Enter key buat login
document.addEventListener("keydown", e => {
  if (e.key === "Enter") handleLogin();
});