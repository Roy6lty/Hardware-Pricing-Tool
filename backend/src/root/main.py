import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware


from backend.src.root.database import shutdown, startup
from backend.src.root.settings import settings
from backend.src.root.sub_router import api_router


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    await startup()
    yield
    await shutdown()


app = FastAPI(title="Exam Companion Project", version="0.0.1", lifespan=app_lifespan)


app.include_router(router=api_router)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
allowed_exceptions = (HTTPException, os)
