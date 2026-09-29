import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import init_db, SessionLocal
from app.database.seed import seed_database

# Import routers
from app.routes.diagnose import router as diagnose_router
from app.routes.devices import router as devices_router
from app.routes.repair import router as repair_router
from app.routes.resale import router as resale_router
from app.routes.centers import router as centers_router
from app.routes.decision import router as decision_router
from app.routes.rewards import router as rewards_router
from app.routes.dashboard import router as dashboard_router
from app.routes.health import router as health_router
from app.routes.data_sync import router as data_sync_router
from app.routes.assistant import router as assistant_router
from app.routes.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ReWiseApp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes tables and seeds initial data on app startup."""
    logger.info("Initializing database schemas...")
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    logger.info("ReWise AI Backend ready.")
    yield
    logger.info("Shutting down ReWise AI Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Circular-Economy AI Platform for Damaged Electronic Devices (Smartphones)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for seamless frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix
app.include_router(diagnose_router, prefix="/api")
app.include_router(devices_router, prefix="/api")
app.include_router(repair_router, prefix="/api")
app.include_router(resale_router, prefix="/api")
app.include_router(centers_router, prefix="/api")
app.include_router(decision_router, prefix="/api")
app.include_router(rewards_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(data_sync_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(admin_router, prefix="/api")



@app.get("/")
def root():
    return {
        "platform": "ReWise AI",
        "tagline": "Don't Throw It. Understand It. Repair It. Reuse It. Recycle It.",
        "docs": "/docs",
        "api_v1": "/api"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
