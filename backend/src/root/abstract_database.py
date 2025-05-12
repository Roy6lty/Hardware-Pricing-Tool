from datetime import datetime
from sqlalchemy import TIMESTAMP, Index, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class AbstractBase(DeclarativeBase):
    __abstract__ = True
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    date_created: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.timezone("UTC", func.now()),
    )
    last_updated: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.current_timestamp(),
    )

    def as_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__table__.c}
