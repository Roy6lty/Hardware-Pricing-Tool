from backend.src.root.abstract_basemodel import AbstractBaseModel


class ComputerPartsModelTable(AbstractBaseModel):
    type: str | None = None
    parent_sku: str | None = None
    name: str | None = None
    sku: str | None = None
    product_url: str | None = None
    product_code: str | None = None
    price: str | None = None
