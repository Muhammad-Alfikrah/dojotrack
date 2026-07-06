if (!isLoggedIn()) window.location.href = "login.html";

let allMembers = [];

async function loadMembers() {
  const data = await getMembers("?limit=100");
  allMembers = data.members || [];
  renderMembers(allMembers);

  gsap.from(".dash-table tr", {
    y: 10, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out"
  });
}

function renderMembers(members) {
  const tbody = document.getElementById("member-tbody");
  if (members.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-loading">Belum ada member</td></tr>`;
    return;
  }

  tbody.innerHTML = members.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.email || "—"}</td>
      <td>${m.phone || "—"}</td>
      <td><span class="belt-pill ${m.belt_level}">${m.belt_level}</span></td>
      <td>${m.join_date}</td>
      <td><span class="status-active">● Aktif</span></td>
      <td>
        <button class="action-btn" onclick="deleteMember(${m.id}, '${m.name}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

function filterMembers() {
  const search = document.getElementById("search-input").value.toLowerCase();
  const belt = document.getElementById("belt-filter").value;

  const filtered = allMembers.filter(m => {
    const matchName = m.name.toLowerCase().includes(search);
    const matchBelt = belt ? m.belt_level === belt : true;
    return matchName && matchBelt;
  });

  renderMembers(filtered);
}

function openModal() {
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
  document.getElementById("m-join").value = new Date().toISOString().split("T")[0];
  gsap.from("#modal", { y: -20, opacity: 0, duration: 0.3, ease: "power2.out" });
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-error").style.display = "none";
}

async function submitMember() {
  const name = document.getElementById("m-name").value.trim();
  const email = document.getElementById("m-email").value.trim();
  const phone = document.getElementById("m-phone").value.trim();
  const belt_level = document.getElementById("m-belt").value;
  const join_date = document.getElementById("m-join").value;
  const address = document.getElementById("m-address").value.trim();

  if (!name || !join_date) {
    showModalError("Nama dan tanggal bergabung wajib diisi!");
    return;
  }

  const body = { name, belt_level, join_date };
  if (email) body.email = email;
  if (phone) body.phone = phone;
  if (address) body.address = address;

  const res = await apiFetch("/members/", {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (res.ok) {
    closeModal();
    loadMembers();
  } else {
    const data = await res.json();
    showModalError(data.detail || "Gagal tambah member");
  }
}

async function deleteMember(id, name) {
  if (!confirm(`Hapus member "${name}"?`)) return;

  const res = await apiFetch(`/members/${id}`, { method: "DELETE" });
  if (res.ok) {
    loadMembers();
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

loadMembers();