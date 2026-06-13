# 🥋 DojoTrack

Sistem manajemen dojo karate berbasis web — kelola anggota, jadwal latihan, absensi, dan iuran dalam satu platform.

> Proyek portofolio pribadi | Backend: Python FastAPI | Database: PostgreSQL

---

## ✨ Fitur

- 🔐 **Autentikasi** — Login admin dengan JWT token
- 👤 **Manajemen Member** — CRUD anggota dojo + riwayat kenaikan sabuk
- 🗓️ **Jadwal Latihan** — Kelola jadwal latihan per hari dan instruktur
- ✅ **Absensi** — Catat kehadiran latihan + rekap bulanan
- 💰 **Iuran** — Tracking pembayaran iuran + status lunas/nunggak

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 18 |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + Bcrypt |
| Dokumentasi API | Swagger UI (auto) |
| Frontend | HTML + CSS + JavaScript + GSAP *(coming soon)* |

---

## 📁 Struktur Project
dojotrack/

├── app/

│   ├── api/v1/endpoints/   # Route handler

│   │   ├── auth.py

│   │   ├── members.py

│   │   ├── schedules.py

│   │   ├── attendance.py

│   │   └── payments.py

│   ├── core/               # Config, database, security

│   ├── models/             # SQLAlchemy models

│   └── schemas/            # Pydantic schemas

├── requirements.txt

└── .env.example


---

## 🚀 Cara Menjalankan

### 1. Clone repo
```bash
git clone https://github.com/Muhammad-Alfikrah/dojotrack.git
cd dojotrack
```

### 2. Buat virtual environment
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup environment
```bash
cp .env.example .env
# Edit .env dan isi DATABASE_URL dan SECRET_KEY
```

### 5. Generate SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 6. Buat database PostgreSQL
```bash
psql -U postgres
CREATE DATABASE dojotrack;
\q
```

### 7. Jalankan server
```bash
uvicorn app.main:app --reload
```

### 8. Buka dokumentasi API
******

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/v1/auth/register` | Daftar admin baru |
| POST | `/api/v1/auth/login` | Login + dapat JWT token |

### Members
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/members` | Daftar semua member |
| POST | `/api/v1/members` | Tambah member baru |
| GET | `/api/v1/members/{id}` | Detail member |
| PUT | `/api/v1/members/{id}` | Update data member |
| DELETE | `/api/v1/members/{id}` | Hapus member |
| POST | `/api/v1/members/{id}/promote` | Naikkan sabuk |
| GET | `/api/v1/members/{id}/belt-history` | Riwayat sabuk |

### Schedules
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/schedules` | Daftar jadwal latihan |
| POST | `/api/v1/schedules` | Tambah jadwal |
| PUT | `/api/v1/schedules/{id}` | Update jadwal |
| DELETE | `/api/v1/schedules/{id}` | Hapus jadwal |

### Attendance
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/v1/attendance` | Catat absensi |
| GET | `/api/v1/attendance` | Lihat data absensi |
| GET | `/api/v1/attendance/summary` | Rekap absensi bulanan |

### Payments
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/v1/payments` | Buat tagihan iuran |
| GET | `/api/v1/payments` | Lihat data pembayaran |
| PATCH | `/api/v1/payments/{id}` | Update status bayar |
| GET | `/api/v1/payments/summary` | Rekap iuran bulanan |

---

## 👨‍💻 Author

**Muhammad Alfikrah**
Mahasiswa IT + Atlet Karate 🥋

---

## 📌 Roadmap

- [x] Backend API (FastAPI + PostgreSQL)
- [ ] Frontend animasi (HTML + GSAP ScrollTrigger)
- [ ] Deploy ke Railway + Vercel