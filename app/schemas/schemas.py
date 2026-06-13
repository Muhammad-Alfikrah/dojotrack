# app/schemas/schemas.py

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from app.models.models import BeltLevel, PaymentStatus
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Member ────────────────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    belt_level: BeltLevel = BeltLevel.putih
    join_date: date


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    is_active: Optional[bool] = None


class MemberOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    birth_date: Optional[date]
    photo_url: Optional[str]
    belt_level: BeltLevel
    belt_date: Optional[date]
    is_active: bool
    join_date: date
    created_at: datetime


class MemberListOut(BaseModel):
    total: int
    members: List[MemberOut]

    model_config = {"from_attributes": True}


# ── Belt History ──────────────────────────────────────────────────────────────

class BeltPromote(BaseModel):
    to_belt: BeltLevel
    promoted_date: date
    examiner: Optional[str] = None
    notes: Optional[str] = None


class BeltHistoryOut(BaseModel):
    id: int
    from_belt: Optional[BeltLevel]
    to_belt: BeltLevel
    promoted_date: date
    examiner: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Schedule ──────────────────────────────────────────────────────────────────

class ScheduleCreate(BaseModel):
    day: str
    start_time: str
    end_time: str
    location: Optional[str] = None
    instructor: Optional[str] = None
    notes: Optional[str] = None


class ScheduleOut(BaseModel):
    id: int
    day: str
    start_time: str
    end_time: str
    location: Optional[str]
    instructor: Optional[str]
    notes: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    member_id: int
    schedule_id: Optional[int] = None
    date: date
    is_present: bool = True
    notes: Optional[str] = None


class AttendanceOut(BaseModel):
    id: int
    member_id: int
    schedule_id: Optional[int]
    date: date
    is_present: bool
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    member_id: int
    month: int
    year: int
    amount: float
    notes: Optional[str] = None

    @field_validator("month")
    @classmethod
    def validate_month(cls, v):
        if not 1 <= v <= 12:
            raise ValueError("Bulan harus antara 1-12")
        return v


class PaymentUpdate(BaseModel):
    status: PaymentStatus
    notes: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    member_id: int
    month: int
    year: int
    amount: float
    status: PaymentStatus
    paid_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}