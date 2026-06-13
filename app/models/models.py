# app/models/models.py

import enum
from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, ForeignKey, Enum, Text, Numeric, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


# ── Enum (pilihan tetap) ──────────────────────────────────────────────────────

class BeltLevel(str, enum.Enum):
    putih   = "putih"
    kuning  = "kuning"
    hijau   = "hijau"
    biru    = "biru"
    coklat  = "coklat"
    hitam_1 = "hitam_1"
    hitam_2 = "hitam_2"
    hitam_3 = "hitam_3"


class PaymentStatus(str, enum.Enum):
    lunas   = "lunas"
    nunggak = "nunggak"
    pending = "pending"


# ── Tabel User (Admin/Pelatih) ────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(150), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ── Tabel Member (Anggota Dojo) ───────────────────────────────────────────────

class Member(Base):
    __tablename__ = "members"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    email       = Column(String(150), unique=True, index=True)
    phone       = Column(String(20))
    address     = Column(Text)
    birth_date  = Column(Date)
    photo_url   = Column(String(255))
    belt_level  = Column(Enum(BeltLevel), default=BeltLevel.putih)
    belt_date   = Column(Date)
    is_active   = Column(Boolean, default=True)
    join_date   = Column(Date, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relasi ke tabel lain
    attendances  = relationship("Attendance", back_populates="member", cascade="all, delete-orphan")
    payments     = relationship("Payment", back_populates="member", cascade="all, delete-orphan")
    belt_history = relationship("BeltHistory", back_populates="member", cascade="all, delete-orphan")


# ── Tabel Schedule (Jadwal Latihan) ──────────────────────────────────────────

class Schedule(Base):
    __tablename__ = "schedules"

    id         = Column(Integer, primary_key=True, index=True)
    day        = Column(String(10), nullable=False)  # Senin, Rabu, Jumat
    start_time = Column(String(5), nullable=False)   # 07:00
    end_time   = Column(String(5), nullable=False)   # 09:00
    location   = Column(String(150))
    instructor = Column(String(100))
    notes      = Column(Text)
    is_active  = Column(Boolean, default=True)

    attendances = relationship("Attendance", back_populates="schedule")


# ── Tabel Attendance (Absensi) ────────────────────────────────────────────────

class Attendance(Base):
    __tablename__ = "attendances"

    id          = Column(Integer, primary_key=True, index=True)
    member_id   = Column(Integer, ForeignKey("members.id"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    date        = Column(Date, nullable=False)
    is_present  = Column(Boolean, default=True)
    notes       = Column(Text)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    member   = relationship("Member", back_populates="attendances")
    schedule = relationship("Schedule", back_populates="attendances")


# ── Tabel Payment (Iuran) ─────────────────────────────────────────────────────

class Payment(Base):
    __tablename__ = "payments"

    id         = Column(Integer, primary_key=True, index=True)
    member_id  = Column(Integer, ForeignKey("members.id"), nullable=False)
    month      = Column(Integer, nullable=False)  # 1-12
    year       = Column(Integer, nullable=False)
    amount     = Column(Numeric(10, 2), nullable=False)
    status     = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    paid_at    = Column(DateTime(timezone=True))
    notes      = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="payments")


# ── Tabel BeltHistory (Riwayat Kenaikan Sabuk) ───────────────────────────────

class BeltHistory(Base):
    __tablename__ = "belt_histories"

    id            = Column(Integer, primary_key=True, index=True)
    member_id     = Column(Integer, ForeignKey("members.id"), nullable=False)
    from_belt     = Column(Enum(BeltLevel))
    to_belt       = Column(Enum(BeltLevel), nullable=False)
    promoted_date = Column(Date, nullable=False)
    examiner      = Column(String(100))
    notes         = Column(Text)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", back_populates="belt_history")