from typing import Tuple
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import Float


class AbstractBaseModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
        str_min_length=0,
        str_max_length=255,
        use_enum_values=True,
    )


class InventoryPart(AbstractBaseModel):
    model_config = ConfigDict(frozen=True)

    query: str
    # Change list to Tuple and [] to () or Field(default_factory=tuple)
    mfg: tuple | list | None = None
    cond: tuple | list | None = None
    country: tuple | list | None = None
    region: tuple | list | None = None
    state: tuple | list | None = None
    size: int = 100
    offset: int = 0

    # fuzziness:str = 100 # Ensure all fields are hashable if uncommented
    # priced: int
    # age: int
    @field_validator("mfg", "region", "country", "region", "state", mode="before")
    def convert_to_tuple(cls, value):
        if isinstance(value, list):
            if len(value) > 0:
                return tuple(value)
            else:
                return None
        return value


class InventoryPartMeta(AbstractBaseModel):
    total: int
    manufactures: list
    conditions: list
    states: list
    countries: list
    regions: list


class InventoryPartResponse(AbstractBaseModel):
    data: list
    meta: InventoryPartMeta


class HPEPart(BaseModel):
    product_details: dict | None = None
    product_components: dict | None = None


class BrokerBinData(AbstractBaseModel):
    company: str | None
    country: str | None
    part: str | None
    clei: str | None
    mfg: str | None
    cond: str | None
    description: str | None
    price: int | None
    qty: int | None
    age_in_days: int | None


class BrokerBinServerResponse(AbstractBaseModel):
    data: list
    average_cost: int | str | None = "N/A"
    median_part: dict | None = None


class InventoryPartSchema(AbstractBaseModel):
    part_number: str
    country: str


class PartResponse(AbstractBaseModel):
    manufacturer: str | None = "N/A"
    price: str | None = "N/A"
    description: str | None = "N/A"
    country: str | None = "N/A"
    part_number: str | None = "N/A"
    quantity: str | None = "N/A"
    company: str | None = "N/A"
    condition: str | None = "N/A"
    age: str | None = "N/A"

    @field_validator("price", "age", mode="before")
    def stringfy(cls, v):
        if v is None:
            return "N/A"
        return str(v)


class PartsResponse(AbstractBaseModel):
    data: list[PartResponse] = []


class HPEPartsModel(AbstractBaseModel):
    part_number: list
    part_description: list
    csr: list
    tech_courier: list
    rohs: list


class SearchDescriptionResponse(AbstractBaseModel):
    description: str | None = "N/A"
    part_number: str | None = "N/A"
    tech_courier: str | None = "N/A"


class HPEProductsDescription(AbstractBaseModel):
    serial_number: str | None = "N/A"
    product_number: str | None = "N/A"
    product_description: str | None = "N/A"
    product_average_cost: float | None = 0.0


class PartNumbersMultiple(AbstractBaseModel):
    model_config = ConfigDict(frozen=True)
    part_numbers: Tuple[str, ...]
    countries: list | tuple | None
    regions: list | tuple | None

    @field_validator("part_numbers", "countries", mode="before")
    def convert_to_tuple(cls, value):
        if isinstance(value, list):
            if len(value) > 0:
                return tuple(value)
            else:
                return None
        return value


class ModelSearchResponse(AbstractBaseModel):
    """Model for the response of the /model endpoint."""

    product_details: HPEProductsDescription
    product_component: list[PartResponse] = []


class MultipleBrokenbinPartResponse(AbstractBaseModel):
    data: list = []
    median_part: list = []
    total_cost: float | None = None


class CountriesRegionsModel(AbstractBaseModel):
    countries: str | list | tuple | None = None
    regions: str | list | tuple | None = None

    @field_validator("regions", "countries", mode="before")
    def convert_to_tuple(cls, value):
        if isinstance(value, str):
            value = tuple(value.split(","))
            return value
        if isinstance(value, tuple):
            return value

        if isinstance(value, list):
            if len(value) > 0:
                return tuple(value)
            else:
                return None

        else:
            return None
