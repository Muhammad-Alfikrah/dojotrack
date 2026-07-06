if (!isLoggedIn()) window.location.href = "login.html";

const now = new Date();
let members = [];

const bulanNames = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

async function init() {
  const data = await getMembers("?limit=100");
  members = data.members || [];

  const modalSelect = document.getElementById("p-member");
  members.forEach(m => {
    modalSelect.innerHTML += `<option value="${m.id}">${m.name}</option>`;
  });

  // Set bulan dan tahun sekarang
  document.getElementById("filter-month").value = now.getMonth() + 1;
  document.getElementById("filter-year").value = now.getFullYear();
  document.getElementById("p-month").value = now.getMonth() + 1;
  document.getElementById("p-year").value = now.getFullYear();

  loadPayments();
}

async function loadPayments() {
  const month = document.getElementById("filter-month").value;
  const year = document.getElementById("filter-year").value;
  const status = document.getElementById("filter-status").value;

  let params = `?month=${month}&year=${year}`;
  if (status) params += `&status=${status}`;

  try {
    const res = await apiFetch(`/payments/${params}`);
    const data = await res.json();

    // Stats
    const lunas = data.filter(p => p.status === "lunas").length;
    const nunggak = data.filter(p => p.status === "nunggak").length;
    const pending = data.filter(p => p.status === "pending").length;
    const totalNominal = data
      .filter(p => p.status === "lunas")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    document.getElementById("payment-stats").innerHTML = `
      <div class="stat-card">
        <p class="stat-label">Lunas</p>
        <p class="stat-value">${lunas}</p>
        <p class="stat-sub">sudah bayar</p>
      </div>
      <div class="stat-card stat-card-red">
        <p class="stat-label">Nunggak</p>
        <p class="stat-value" style="color:#e63946">${nunggak}</p>
        <p class="stat-sub">belum bayar</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Pending</p>
        <p class="stat-value">${pending}</p>
        <p class="stat-sub">menunggu</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Terkumpul</p>
        <p class="stat-value" style="font-size:28px">
          Rp ${totalNominal.toLocaleString("id-ID")}
        </p>
        <p class="stat-sub">bulan ini</p>
      </div>
    `;

    // Tabel
    const tbody = document.getElementById("payment-tbody");

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-loading">Belum ada data iuran</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(p => {
      const member = members.find(m => m.id === p.member_id);
      const statusClass = p.status === "lunas"
        ? "color:#4caf50"
        : p.status === "nunggak"
        ? "color:#e63946"
        : "color:rgba(255,255,255,0.4)";

      return `
        <tr>
          <td>${member ? member.name : "—"}</td>
          <td>${bulanNames[p.month]} ${p.year}</td>
          <td>Rp ${parseFloat(p.amount).toLocaleString("id-ID")}</td>
          <td>
            <span style="font-size:11px;letter-spacing:1px;${statusClass}">
              ${p.status.toUpperCase()}
            </span>
          </td>
          <td>${p.paid_at ? p.paid_at.split("T")[0] : "—"}</td>
          <td style="display:flex;gap:6px">
            ${p.status !== "lunas" ? `
              <button class="action-btn" onclick="markLunas(${p.id})">Lunas</button>
            ` : ""}
            ${p.status === "pending" ? `
              <button class="action-btn" onclick="markNunggak(${p.id})">Nunggak</button>
            ` : ""}
          </td>
        </tr>
      `;
    }).join("");

    gsap.from("#payment-tbody tr", {
      y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out"
    });

  } catch (err) {
    console.error(err);
  }
}

async function markLunas(id) {
  const res = await apiFetch(`/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "lunas" })
  });
  if (res.ok) loadPayments();
}

async function markNunggak(id) {
  const res = await apiFetch(`/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "nunggak" })
  });
  if (res.ok) loadPayments();
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

async function submitPayment() {
  const member_id = parseInt(document.getElementById("p-member").value);
  const month = parseInt(document.getElementById("p-month").value);
  const year = parseInt(document.getElementById("p-year").value);
  const amount = parseFloat(document.getElementById("p-amount").value);
  const notes = document.getElementById("p-notes").value.trim();

  if (!member_id || !amount) {
    showModalError("Member dan nominal wajib diisi!");
    return;
  }

  const body = { member_id, month, year, amount };
  if (notes) body.notes = notes;

  const res = await apiFetch("/payments/", {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (res.ok) {
    closeModal();
    loadPayments();
  } else {
    const data = await res.json();
    showModalError(data.detail || "Gagal tambah tagihan");
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