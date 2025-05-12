from backend.src.root.abstract_database import AbstractBase
from sqlalchemy import Column, Integer, String
from sqlalchemy import ARRAY, Boolean, ForeignKey, String, Integer, Index, TEXT
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship


class ComputerPartsTable(AbstractBase):
    __tablename__ = "computer_parts"
    parent_sku: Mapped[str] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=True)
    product_code: Mapped[str] = mapped_column(String, nullable=True)
    price: Mapped[str] = mapped_column(String, nullable=True)
    product_url: Mapped[str] = mapped_column(String, nullable=True)
    platform: Mapped[str] = mapped_column(String, nullable=True)

    __table_args__ = (
        Index(
            "idx_id_computer_parts_local_id",  # Index name
            "id",  # Column to index
            unique=True,  # Unique index
            postgresql_using="btree",  # PostgreSQL specific index type
        ),
        Index(
            "idx_product_code_computer_parts_code",  # Index name
            "product_code",  # Column to index
            unique=False,  # Unique index
            postgresql_using="btree",  # PostgreSQL specific index type
        ),
        Index(
            "idx_computer_parts_name_gin_trgm",  # Descriptive index name
            "name",
            postgresql_ops={"name": "gin_trgm_ops"},  # Specify operator class
            postgresql_using="gin",
        ),
    )
