// ── CEK LOGIN ─────────────────────────────────────────────
if (!isLoggedIn()) {
  window.location.href = "login.html";
}

// ── LOAD DATA ─────────────────────────────────────────────
const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

async function loadDashboard() {
  try {
    // Load members
    const memberData = await getMembers("?limit=5");
    const members = memberData.members || [];
    const total = memberData.total || 0;

    document.getElementById("stat-members").textContent = total;

    // Render tabel member
    const tbody = document.getElementById("member-tbody");
    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-loading">Belum ada member</td></tr>`;
    } else {
      tbody.innerHTML = members.map(m => `
        <tr>
          <td>${m.name}</td>
          <td><span class="belt-pill ${m.belt_level}">${m.belt_level}</span></td>
          <td>${m.join_date}</td>
          <td><span class="status-active">● Aktif</span></td>
        </tr>
      `).join("");
    }

    // Load jadwal
    const schedules = await getSchedules();
    document.getElementById("stat-schedule").textContent = schedules.length;

    const scheduleList = document.getElementById("schedule-list");
    if (schedules.length === 0) {
      scheduleList.innerHTML = `<p class="table-loading">Belum ada jadwal</p>`;
    } else {
      scheduleList.innerHTML = schedules.map(s => `
        <div class="schedule-item">
          <span class="schedule-day">${s.day}</span>
          <span class="schedule-time">${s.start_time} — ${s.end_time}</span>
          <span class="schedule-info">${s.instructor || "—"}<br>${s.location || "—"}</span>
        </div>
      `).join("");
    }

    // Load payment summary
    const payments = await getPaymentSummary(month, year);
    const lunas = payments.filter(p => p.status === "lunas").length;
    const nunggak = payments.filter(p => p.status !== "lunas" && p.status !== "belum_ada_tagihan").length;

    document.getElementById("stat-payments").textContent = lunas;
    document.getElementById("stat-overdue").textContent = nunggak;

  } catch (err) {
    console.error("Error load dashboard:", err);
  }
}

// ── GSAP ANIMASI ──────────────────────────────────────────
gsap.from(".sidebar", {
  x: -50, opacity: 0, duration: 0.8, ease: "power3.out"
});

gsap.from(".dash-header", {
  y: -20, opacity: 0, duration: 0.6, delay: 0.3, ease: "power2.out"
});

gsap.from(".stat-card", {
  y: 30, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.5, ease: "power2.out"
});

gsap.from(".dash-section", {
  y: 20, opacity: 0, stagger: 0.15, duration: 0.6, delay: 0.8, ease: "power2.out"
});

// Load data
loadDashboard();