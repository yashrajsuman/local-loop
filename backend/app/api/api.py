from fastapi import APIRouter

from app.api.endpoints import auth, items, uploads

# Main API router
api_router = APIRouter()

# Binding different routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
