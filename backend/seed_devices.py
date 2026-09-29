"""
Direct execution script for Phase 1 Database Expansion & Synchronization.
Runs schema migration to add all new Phase 1 hardware spec & failure columns,
then imports and upserts all 320+ authentic smartphones into rewise.db.
"""

import os
import sys
import logging

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, init_db
from app.services.device_importer import run_sqlite_schema_migration, import_device_catalog_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("SeedDevices")

def main():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rewise.db")
    logger.info(f"Running SQLite schema migration on {db_path}...")
    run_sqlite_schema_migration(db_path)
    
    logger.info("Initializing schema tables...")
    init_db()
    
    db = SessionLocal()
    try:
        logger.info("Importing 320+ authentic smartphone dataset...")
        stats = import_device_catalog_json(db)
        logger.info(f"Sync Results: {stats}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
