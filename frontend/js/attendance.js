if (!isLoggedIn()) window.location.href = "login.html";

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();
let members = [];

async function init() {
  // Load members untuk dropdown
  const data = await getMembers("?limit=100");
  members = data.members || [];

  // Isi dropdown filter dan modal
  const filterSelect = document.getElementById("filter-member");
  const modalSelect = document.getElementById("a-member");

  members.forEach(m => {
    filterSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
    modalSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
  });

  // Set tanggal default hari ini
  const today = now.toISOString().split("T")[0];
  document.getElementById("filter-date").value = today;
  document.getElementById("a-date").value = today;

  // Load rekap dan absensi
  loadRekap();
  loadAttendance();
}

async function loadRekap() {
  try {
    const res = await apiFetch(`/attendance/summary?month=${month}&year=${year}`);
    const data = await res.json();

    const grid = document.getElementById("rekap-grid");
    const totalHadir = data.reduce((sum, m) => sum + m.total_hadir, 0);
    const totalAbsen = data.reduce((sum, m) => sum + m.total_absen, 0);

    grid.innerHTML = `
      <div class="stat-card">
        <p class="stat-label">Total Hadir</p>
        <p class="stat-value">${totalHadir}</p>
        <p class="stat-sub">sesi latihan</p>
      </div>
      <div class="stat-card stat-card-red">
        <p class="stat-label">Total Absen</p>
        <p class="stat-value" style="color:#e63946">${totalAbsen}</p>
        <p class="stat-sub">tidak hadir</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Member Aktif</p>
        <p class="stat-value">${data.length}</p>
        <p class="stat-sub">terdaftar</p>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

async function loadAttendance() {
  const date = document.getElementById("filter-date").value;
  const memberId = document.getElementById("filter-member").value;

  let params = "?";
  if (date) params += `date_from=${date}&date_to=${date}&`;
  if (memberId) params += `member_id=${memberId}&`;

  try {
    const res = await apiFetch(`/attendance/${params}`);
    const data = await res.json();

    const tbody = document.getElementById("attendance-tbody");

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="table-loading">Belum ada data absensi</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(a => {
      const member = members.find(m => m.id === a.member_id);
      return `
        <tr>
          <td>${member ? member.name : "—"}</td>
          <td>${a.date}</td>
          <td>${a.schedule_id ? `Jadwal #${a.schedule_id}` : "—"}</td>
          <td>${a.is_present
            ? '<span class="status-active">● Hadir</span>'
            : '<span style="color:#e63946;font-size:11px">● Tidak Hadir</span>'
          }</td>
          <td>${a.notes || "—"}</td>
        </tr>
      `;
    }).join("");

    gsap.from("#attendance-tbody tr", {
      y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out"
    });

  } catch (err) {
    console.error(err);
  }
}

function openModal() {
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
  gsap.from("#modal", { y: -20, opacity: 0, duration: 0.3, ease: "power2.out" });
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-error").style.display = "none";
}

async function submitAttendance() {
  const member_id = parseInt(document.getElementById("a-member").value);
  const date = document.getElementById("a-date").value;
  const is_present = document.getElementById("a-status").value === "true";
  const notes = document.getElementById("a-notes").value.trim();

  if (!member_id || !date) {
    showModalError("Member dan tanggal wajib diisi!");
    return;
  }

  const body = { member_id, date, is_present };
  if (notes) body.notes = notes;

  const res = await apiFetch("/attendance/", {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (res.ok) {
    closeModal();
    loadAttendance();
    loadRekap();
  } else {
    const data = await res.json();
    showModalError(data.detail || "Gagal catat absensi");
  }
}

function showModalError(msg) {
  const el = document.getElementById("modal-error");
  el.textContent = msg;
  el.style.display = "block";
}

gsap.from(".main-content", {
  opacity: 0, y: 20, duration: 0.6, ease: "power2.out"
});

init();