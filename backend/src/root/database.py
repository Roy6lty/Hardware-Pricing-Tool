from typing import Annotated
from fastapi import Depends
from fastapi import Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.src.root.settings import settings
from backend.src.root.abstract_database import AbstractBase

async_database_connection_url = str(settings.POSTGRES_URL)


# Async
engine = create_async_engine(async_database_connection_url)


SessionLocal = async_sessionmaker(engine)

# Base = declarative_base()


async def startup():
    async with engine.begin() as conn:
        if settings.DEBUG_MODE:
            print("--staring database---")
        await conn.run_sync(AbstractBase.metadata.create_all)


async def shutdown():
    if settings.DEBUG_MODE:
        print("--shutting down database--")
    await engine.dispose()


# database dependency
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()


db_dependency = Annotated[AsyncSession, Depends(get_db)]
