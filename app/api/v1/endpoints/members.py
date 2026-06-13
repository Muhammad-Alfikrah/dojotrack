# app/api/v1/endpoints/members.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Member, BeltHistory
from app.schemas.schemas import (
    MemberCreate, MemberUpdate, MemberOut,
    MemberListOut, BeltPromote, BeltHistoryOut
)
from datetime import date

router = APIRouter()


@router.get("/", response_model=MemberListOut)
def get_members(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = Query(None),
    belt_level: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil semua member, bisa filter by nama/sabuk/status"""
    query = db.query(Member)

    if search:
        query = query.filter(Member.name.ilike(f"%{search}%"))
    if belt_level:
        query = query.filter(Member.belt_level == belt_level)
    if is_active is not None:
        query = query.filter(Member.is_active == is_active)

    total = query.count()
    members = query.offset(skip).limit(limit).all()
    return {"total": total, "members": members}


@router.post("/", response_model=MemberOut, status_code=201)
def create_member(
    data: MemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Daftarkan anggota baru"""
    # Cek email duplikat
    if data.email:
        existing = db.query(Member).filter(Member.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    member = Member(**data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/{member_id}", response_model=MemberOut)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil detail satu member"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")
    return member


@router.put("/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int,
    data: MemberUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update data member"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=204)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Hapus member"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")

    db.delete(member)
    db.commit()


@router.post("/{member_id}/promote", response_model=MemberOut)
def promote_belt(
    member_id: int,
    data: BeltPromote,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Naikkan sabuk member"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")

    # Simpan riwayat sabuk
    history = BeltHistory(
        member_id=member_id,
        from_belt=member.belt_level,
        to_belt=data.to_belt,
        promoted_date=data.promoted_date,
        examiner=data.examiner,
        notes=data.notes
    )
    db.add(history)

    # Update sabuk member
    member.belt_level = data.to_belt
    member.belt_date = data.promoted_date

    db.commit()
    db.refresh(member)
    return member


@router.get("/{member_id}/belt-history", response_model=list[BeltHistoryOut])
def get_belt_history(
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil riwayat kenaikan sabuk member"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")
    return member.belt_history