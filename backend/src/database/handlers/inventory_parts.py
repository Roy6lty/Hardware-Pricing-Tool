import uuid
from pydantic import UUID4
from sqlalchemy import select, update, delete, func
from abc import ABC, abstractmethod
import sqlalchemy
from sqlalchemy.exc import SQLAlchemyError
from backend.src.custom_exception.custom_errors import NotFoundError
from backend.src.root.database import db_dependency
from backend.src.database.orms.inventory_parts_orm import ComputerPartsTable
from backend.src.models import orm_model


class LocalInventoryService:
    @classmethod
    async def create_computer_part(cls, db_conn: db_dependency, computer_part: dict):
        new_part = ComputerPartsTable(id=str(uuid.uuid4()), **computer_part)
        db_conn.add(new_part)
        await db_conn.commit()
        await db_conn.refresh(new_part)
        return new_part

    @classmethod
    async def update_computer_part_by_id(cls, db_conn: db_dependency, part_uuid: str):

        query = (
            update(ComputerPartsTable)
            .where(ComputerPartsTable.id == part_uuid)
            .values(**vector_data.model_dump(exclude_unset=True))
            .returning(ComputerPartsTable)
        )

        result = await db_conn.execute(query)
        computer_part = result.scalar_one_or_none()
        if not computer_part:
            raise NotFoundError
        await db_conn.commit()
        return orm_model.ComputerPartsModelTable.model_validate(computer_part)

    @classmethod
    async def delete_computer_part_by_id(cls, db_conn: db_dependency, part_uuid: str):
        query = (
            delete(ComputerPartsTable)
            .where(ComputerPartsTable.id == part_uuid)
            .returning(ComputerPartsTable)
        )

        result = await db_conn.execute(query)
        computer_part = result.scalar_one_or_none()

        if not computer_part:
            raise NotFoundError
        await db_conn.commit()

        return orm_model.ComputerPartsModelTable.model_validate(computer_part)

    @classmethod
    async def get_computer_part_by_name(cls, db_conn: db_dependency, part_name: str):
        try:
            query = select(ComputerPartsTable).where(
                ComputerPartsTable.name == part_name
            )
            result = await db_conn.execute(query)
            computer_parts = result.scalars().all()
            if len(computer_parts) > 0:
                return orm_model.ComputerPartsModelTable.model_validate(computer_parts)

        except SQLAlchemyError as e:
            raise e

    @classmethod
    async def get_computer_part_by_name_fuzzy_search(
        cls, db_conn: db_dependency, part_name: str, similarity_threshold: float = 0.5
    ):
        try:
            # Using the similarity function from pg_trgm
            query = (
                select(ComputerPartsTable)
                .where(
                    func.similarity(ComputerPartsTable.name, part_name)
                    >= similarity_threshold
                )
                .order_by(
                    func.similarity(ComputerPartsTable.name, part_name).desc()
                )  # Order by most similar
            )

            result = await db_conn.execute(query)
            parts = result.scalars().all()

            if parts is None:
                return []
            return [
                orm_model.ComputerPartsModelTable.model_validate(part) for part in parts
            ]

        except SQLAlchemyError as e:
            # logger.error(f"Database error during fuzzy name search for '{part_name}': {e}")
            raise e  # Re-raise the exception or handle it appropriately

    @classmethod
    async def get_computer_part_by_part_number(
        cls, db_conn: db_dependency, part_number: str
    ):
        try:
            query = select(ComputerPartsTable).where(
                ComputerPartsTable.product_code == part_number
            )
            result = await db_conn.execute(query)
            computer_parts = result.scalars().all()
            if len(computer_parts) > 0:
                return [
                    orm_model.ComputerPartsModelTable.model_validate(part)
                    for part in computer_parts
                ]
            return []

        except SQLAlchemyError as e:
            raise
        ...

    @classmethod
    async def get_multiple_parts_by_part_number(
        cls, db_conn: db_dependency, part_numbers: list[str]
    ):
        try:
            query = select(ComputerPartsTable).where(
                ComputerPartsTable.product_code.in_(part_numbers)
            )
            result = await db_conn.execute(query)
            computer_parts = result.scalars().all()
            if len(computer_parts) > 0:
                return [
                    orm_model.ComputerPartsModelTable.model_validate(part)
                    for part in computer_parts
                ]
            return []

        except SQLAlchemyError as e:
            raise
        ...
