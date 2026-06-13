# app/api/v1/endpoints/attendance.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Attendance, Member, Schedule
from app.schemas.schemas import AttendanceCreate, AttendanceOut

router = APIRouter()


@router.post("/", response_model=AttendanceOut, status_code=201)
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Catat absensi member"""
    # Cek member ada
    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")

    # Cek jadwal ada (kalau diisi)
    if data.schedule_id:
        schedule = db.query(Schedule).filter(Schedule.id == data.schedule_id).first()
        if not schedule:
            raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    # Cek absensi sudah ada untuk hari ini
    existing = db.query(Attendance).filter(
        Attendance.member_id == data.member_id,
        Attendance.date == data.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Absensi member ini sudah dicatat untuk tanggal tersebut")

    attendance = Attendance(**data.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/", response_model=List[AttendanceOut])
def get_attendances(
    member_id: Optional[int] = Query(None),
    schedule_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil data absensi, bisa filter by member/jadwal/tanggal"""
    query = db.query(Attendance)

    if member_id:
        query = query.filter(Attendance.member_id == member_id)
    if schedule_id:
        query = query.filter(Attendance.schedule_id == schedule_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)

    return query.order_by(Attendance.date.desc()).all()


@router.get("/summary", response_model=List[dict])
def get_attendance_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Rekap absensi semua member per bulan"""
    members = db.query(Member).filter(Member.is_active == True).all()
    result = []

    for member in members:
        attendances = db.query(Attendance).filter(
            Attendance.member_id == member.id,
            Attendance.date >= date(year, month, 1),
            Attendance.date <= date(year, month, 28)
        ).all()

        hadir = sum(1 for a in attendances if a.is_present)
        absen = sum(1 for a in attendances if not a.is_present)

        result.append({
            "member_id": member.id,
            "member_name": member.name,
            "belt_level": member.belt_level,
            "total_hadir": hadir,
            "total_absen": absen,
            "bulan": month,
            "tahun": year
        })

    return result


@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Hapus data absensi"""
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Data absensi tidak ditemukan")

    db.delete(attendance)
    db.commit()