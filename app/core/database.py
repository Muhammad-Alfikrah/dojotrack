# app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Bikin koneksi ke PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Session untuk transaksi database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk semua model/tabel nanti
Base = declarative_base()


# Fungsi ini dipanggil tiap ada request masuk
# Setelah request selesai, koneksi otomatis ditutup
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()