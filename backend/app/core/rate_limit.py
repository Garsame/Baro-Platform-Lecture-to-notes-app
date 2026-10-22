"""Small in-memory rate limiter for the public, abuse-prone endpoints.

It is per process, which is enough to slow down guessing and spam on a single
server. Behind a proxy, run uvicorn with --proxy-headers so request.client is the real address.
"""
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse

# (method, path prefix) -> (max requests, window seconds)
RULES: dict[tuple[str, str], tuple[int, int]] = {
    ("POST", "/api/v1/auth/login"): (20, 300),
    ("POST", "/api/v1/auth/admin-login"): (20, 300),
    ("POST", "/api/v1/auth/admin-signup"): (10, 3600),
    ("POST", "/api/v1/auth/signup"): (30, 3600),
    ("POST", "/api/v1/auth/google"): (30, 300),
    ("POST", "/api/v1/auth/me/email"): (20, 3600),
    ("POST", "/api/v1/auth/verify-email"): (20, 3600),
    ("POST", "/api/v1/contact"): (8, 3600),
    ("POST", "/api/v1/site/testimonials"): (8, 3600),
}

_hits: dict[tuple[str, str], deque] = defaultdict(deque)


def _match(method: str, path: str):
    for (m, prefix), limit in RULES.items():
        if m == method and path.startswith(prefix):
            return prefix, limit
    return None


def reset() -> None:
    _hits.clear()


async def rate_limit_middleware(request: Request, call_next):
    hit = _match(request.method, request.url.path)
    if hit:
        prefix, (limit, window) = hit
        ip = request.client.host if request.client else "unknown"
        bucket = _hits[(ip, prefix)]
        now = time.monotonic()
        while bucket and now - bucket[0] > window:
            bucket.popleft()
        if len(bucket) >= limit:
            retry = int(window - (now - bucket[0])) + 1
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please wait a little and try again."},
                headers={"Retry-After": str(retry)},
            )
        bucket.append(now)
    return await call_next(request)


async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    return response
