import logging
import time

from fastapi import FastAPI, Request
from app.api.routers import auth, lectures, admin, contact, site, admin_site
from app.core.config import settings
from app.core.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("somali_notes.api")

# NOTE: For production, use Alembic. Let's create all tables as a fallback for simple local dev.
from app.core.database import engine, Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://baro-platform.elivateict.com",
        "http://baro-platform.elivateict.com"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):300\d",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths that are polled frequently and should only be logged on error
QUIET_PATHS = {
    "/api/v1/lectures/",
}

class PollingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Suppress Uvicorn access logs for polling paths if they were successful
        msg = record.getMessage()
        if "GET /api/v1/lectures/" in msg and " 200 " in msg:
            return False
        return True

logging.getLogger("uvicorn.access").addFilter(PollingFilter())

from app.core.rate_limit import rate_limit_middleware, security_headers_middleware
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(security_headers_middleware)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    started = time.perf_counter()
    path = request.url.path
    method = request.method

    # Check if this is a frequent polling path
    is_polling = any(path.startswith(p) for p in QUIET_PATHS) and method == "GET"
    is_options = method == "OPTIONS"

    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.exception("FAIL %s %s (%.1fms)", method, path, elapsed_ms)
        raise

    elapsed_ms = (time.perf_counter() - started) * 1000

    # Only log if it's not a polling/options path, or if it failed
    if not (is_polling or is_options) or response.status_code >= 400:
        logger.info("%s %s -> %s (%.1fms)", method, path, response.status_code, elapsed_ms)

    return response

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(lectures.router, prefix=f"{settings.API_V1_STR}/lectures", tags=["lectures"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(contact.router, prefix=f"{settings.API_V1_STR}/contact", tags=["contact"])
app.include_router(site.router, prefix=f"{settings.API_V1_STR}/site", tags=["site"])
app.include_router(admin_site.router, prefix=f"{settings.API_V1_STR}/admin/site", tags=["admin-site"])

import os
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads/profiles", exist_ok=True)
os.makedirs("uploads/site", exist_ok=True)
# Only public assets are served directly. Lecture audio and generated speech stay
# private and are streamed through authorised endpoints instead.
app.mount("/uploads/site", StaticFiles(directory="uploads/site"), name="uploads-site")
app.mount("/uploads/profiles", StaticFiles(directory="uploads/profiles"), name="uploads-profiles")

@app.get("/")
def read_root():
    return {"message": "Welcome to Video Lecture to Somali Notes API"}
