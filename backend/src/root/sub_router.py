from fastapi import APIRouter
from backend.src.router.inventory import router as inventory_router

api_router = APIRouter()

# api_router.include_router(router=inventory_router)
