# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import auth, members
from app.api.v1.endpoints import auth, members, schedules
from app.api.v1.endpoints import auth, members, schedules, attendance
from app.api.v1.endpoints import auth, members, schedules, attendance, payments

# Bikin semua tabel di database otomatis saat app jalan
Base.metadata.create_all(bind=engine)

# Inisialisasi FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistem Manajemen Dojo Karate",
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc UI
)

# CORS — biar frontend bisa akses API ini nanti
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # nanti diganti domain frontend saat deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan router
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    members.router,
    prefix="/api/v1/members",
    tags=["Members"]
)

app.include_router(
    schedules.router,
    prefix="/api/v1/schedules",
    tags=["Schedules"]
)

app.include_router(
    attendance.router,
    prefix="/api/v1/attendance",
    tags=["Attendance"]
)

app.include_router(
    payments.router,
    prefix="/api/v1/payments",
    tags=["Payments"]
)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }