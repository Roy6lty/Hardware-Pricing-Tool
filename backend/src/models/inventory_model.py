from typing import Tuple
from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    mfg: Tuple[str, ...] = Field(default_factory=tuple)
    cond: Tuple[str, ...] = Field(default_factory=tuple)
    country: Tuple[str, ...] = Field(default_factory=tuple)
    region: Tuple[str, ...] = Field(default_factory=tuple)
    state: Tuple[str, ...] = Field(default_factory=tuple)
    size: int = 10
    offset: int = 100
    # fuzziness:str = 100 # Ensure all fields are hashable if uncommented
    # priced: int
    # age: int


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


class PartNumbersMultiple(AbstractBaseModel):
    model_config = ConfigDict(frozen=True)
    part_numbers: Tuple[str, ...]
    country: str | None
    region: str | None


class ModelSearchResponse(AbstractBaseModel):
    """Model for the response of the /model endpoint."""

    product_details: HPEProductsDescription
    product_component: list[SearchDescriptionResponse] = (
        []
    )  # Reuse SearchDescriptionResponse for table items


broker_obj = {
    "data": [
        {
            "age_in_days": 4,
            "clei": "",
            "company": "Telacomp Data Center Parts Inc.",
            "cond": "USED",
            "country": "USA",
            "description": "512MB RDRAM Rambus (bulk)",
            "mfg": "SAMSUNG",
            "part": "103996-B21",
            "price": 110,
            "qty": 8,
            "score": 18.589577,
        },
        {
            "age_in_days": 4,
            "clei": "",
            "company": "Telacomp Data Center Parts Inc.",
            "cond": "NEW",
            "country": "USA",
            "description": "512MB RDRAM Rambus (spares boxed ) 239067-001",
            "mfg": "COMPAQ",
            "part": "103996-B21",
            "price": 0,
            "qty": 14,
            "score": 17.765757,
        },
        {
            "age_in_days": 2,
            "clei": "",
            "company": "ACE Systems Technology Inc",
            "cond": "NEW",
            "country": "USA",
            "description": "512MB ECC RDRAM 800MHZ MEMORY MODULE",
            "mfg": "COMPAQ",
            "part": "103996-B21",
            "price": 135,
            "qty": 9,
            "score": 17.761087,
        },
        {
            "age_in_days": 2,
            "clei": "",
            "company": "Serverworlds.com",
            "cond": "REF",
            "country": "USA",
            "description": "512MB RDR 800Mhz ECC",
            "mfg": "HP",
            "part": "103996-B21",
            "price": 175,
            "qty": 14,
            "score": 17.761087,
        },
        {
            "age_in_days": 5,
            "clei": "",
            "company": "Amazon Computer Technology (ACT)",
            "cond": "NEW",
            "country": "USA",
            "description": "HP 512MB, 800MHz, PC800 ECC Rambus RDRAM RIMM "
            "memory module/",
            "mfg": "COMPAQ",
            "part": "103996-B21",
            "price": 95,
            "qty": 1,
            "score": 17.761087,
        },
        {
            "age_in_days": 4,
            "clei": "",
            "company": "Telacomp Data Center Parts Inc.",
            "cond": "NEW",
            "country": "USA",
            "description": "512MB RDRAM Rambus (bulk)",
            "mfg": "COMPAQ",
            "part": "103996-B21-B",
            "price": 115,
            "qty": 24,
            "score": 14.70297,
        },
    ],
    "meta": {
        "conditions": [
            {"doc_count": 4, "key": "NEW"},
            {"doc_count": 1, "key": "REF"},
            {"doc_count": 1, "key": "USED"},
        ],
        "countries": [{"doc_count": 6, "key": "USA"}],
        "manufacturers": [
            {"doc_count": 4, "key": "COMPAQ"},
            {"doc_count": 1, "key": "HP"},
            {"doc_count": 1, "key": "SAMSUNG"},
        ],
        "price": {"avg": 105, "count": 6, "max": 175, "min": 0, "sum": 630},
        "qty": {"avg": 11.666666666666666, "count": 6, "max": 24, "min": 1, "sum": 70},
        "regions": [{"doc_count": 6, "key": "North America"}],
        "request": {"count": 1, "limit": 50},
        "states": [
            {"doc_count": 3, "key": "MD"},
            {"doc_count": 2, "key": "FL"},
            {"doc_count": 1, "key": "MN"},
        ],
        "total": 6,
    },
}

HPE_obj = {
    "csr": [
        "B",
        "A",
        "A",
        "A",
        "B",
        "A",
        "A",
        "N",
        "A",
        "A",
        "B",
        "-N/A-",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "A",
        "B",
        "B",
        "-N/A-",
        "A",
        "A",
        "-N/A-",
        "B",
        "A",
        "A",
    ],
    "part_description": [
        "SPS-PCA OCP 4p 1Gb BASE-T BCM 5719 Opn",
        "SPS-CA kit,PWR 4LFF/8SFF,50/240/400mm",
        "SPS-CA kit,RAR/FRT/MID",
        "Cable Arm, 2U",
        "SPS-PCA,2U 2x16 slots ter cable rsr",
        "SPS-CA, MCIO Kit 2 in 1",
        "Cable, Jumper cord C13/C14 India 2.0 m Blank",
        "SPS-OCP,RAIL,CHASSIS,AP4100G11",
        "DL560/DL360 Gen9 blank cover kit - Contains power "
        "supply blank cover, Flexible LOM blank cover, fan slot "
        "blank,  and Heat Sink blank",
        "Blank Large Form Factor (LFF) reduced depth",
        "SPS-DIMM,32GB PC5-4800B-R,2Gx8",
        "HP LFF HDD Spade Blank Gen9, Rev:A",
        "SPS-Drive Cage w/ BP, EDSFF",
        "SPS-Cage w/ BP,2SFF,U.3 NVMe",
        "SPS-CAGE,PCI RISER,2U",
        "SPS-LATCH, MEGA CBLANK, FAN",
        "SPS-FAN MOD, STD",
        "SPS-FAN CAGE,2U",
        "SPS-BAFFLE, H/S,REMOVABLE,2U",
        "Miscellaneous blank kit for Apollo 4200 - Includes air "
        "blocker for PCIe expansion slots 5-7, air blocker for "
        "front 2-drive cage backplane, chassis retention "
        "bracket, fan blank, LFF and SFF drive blank, cable "
        "management holder, and FlexibleLOM blank",
        "SPS-PCA,2U 3 x16 slots rsr,x8/x16/x8",
        "SPS-SUBPAN,SYS BRD, 2U",
        "SPS-SYS BRD W/SUBPAN, 1U",
        "AC Power Distribution Unit (PDU) power cord (Black) - "
        "250 V ac, 16 AWG, 2.0 m (6.6 ft) long - Includes "
        "IEC-320 C14 (M) connector to IEC 320 C13 (F) connector",
        "AC Power Distribution Unit (PDU) power cord (Black) - "
        "250 V, 16 AWG, 3 m (9.8 ft) long - Has  C14 (M) "
        "connector to C13 (F) connector",
        "Power Distribution Unit (PDU) power cord",
        "SPS-PS GNRC 1U 12V 800W HTPLG HE-P",
        "SPS-H/S,STD",
        "SPS-KIT, FR, RAIL 3",
    ],
    "part_number": [
        "P51305-001",
        "P58212-001",
        "P58221-001",
        "P24100-001",
        "P53213-001",
        "P52801-001",
        "P10794-001",
        "P52474-001",
        "775423-001",
        "827363-001",
        "P48501-001",
        "802658-B21",
        "P56502-001",
        "P56491-001",
        "P58209-001",
        "P39788-001",
        "P49959-001",
        "P58210-001",
        "P38194-001",
        "809955-001",
        "P53211-001",
        "P53214-001",
        "P60634-001",
        "142258-001",
        "142258-003",
        "416151-B21",
        "P39385-001",
        "P49956-001",
        "P58211-001",
    ],
    "rohs": [
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_2106",
        "COMPLY_2506",
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_2912",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_2506",
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_5012",
        "COMPLY_2912",
        "-N/A-",
        "COMPLY_2506",
        "COMPLY_2506",
        "COMPLY_5012",
        "COMPLY_2912",
        "COMPLY_5012",
        "COMPLY_5012",
    ],
    "tech_courier": [
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
        "-N/A-",
    ],
}
