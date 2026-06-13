# app/api/v1/endpoints/payments.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Payment, Member, PaymentStatus
from app.schemas.schemas import PaymentCreate, PaymentUpdate, PaymentOut

router = APIRouter()


@router.post("/", response_model=PaymentOut, status_code=201)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Buat tagihan iuran member"""
    # Cek member ada
    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member tidak ditemukan")

    # Cek tagihan bulan ini sudah ada
    existing = db.query(Payment).filter(
        Payment.member_id == data.member_id,
        Payment.month == data.month,
        Payment.year == data.year
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tagihan bulan ini sudah ada")

    payment = Payment(**data.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/", response_model=List[PaymentOut])
def get_payments(
    member_id: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    status: Optional[PaymentStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil data pembayaran, bisa filter by member/bulan/status"""
    query = db.query(Payment)

    if member_id:
        query = query.filter(Payment.member_id == member_id)
    if month:
        query = query.filter(Payment.month == month)
    if year:
        query = query.filter(Payment.year == year)
    if status:
        query = query.filter(Payment.status == status)

    return query.order_by(Payment.year.desc(), Payment.month.desc()).all()


@router.patch("/{payment_id}", response_model=PaymentOut)
def update_payment_status(
    payment_id: int,
    data: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update status pembayaran — lunas / nunggak / pending"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Data pembayaran tidak ditemukan")

    payment.status = data.status
    payment.notes = data.notes

    # Kalau statusnya lunas, catat waktu bayarnya
    if data.status == PaymentStatus.lunas:
        payment.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/summary", response_model=List[dict])
def get_payment_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Rekap pembayaran semua member per bulan"""
    members = db.query(Member).filter(Member.is_active == True).all()
    result = []

    for member in members:
        payment = db.query(Payment).filter(
            Payment.member_id == member.id,
            Payment.month == month,
            Payment.year == year
        ).first()

        result.append({
            "member_id": member.id,
            "member_name": member.name,
            "belt_level": member.belt_level,
            "status": payment.status if payment else "belum_ada_tagihan",
            "amount": float(payment.amount) if payment else 0,
            "paid_at": payment.paid_at if payment else None,
            "bulan": month,
            "tahun": year
        })

    return result