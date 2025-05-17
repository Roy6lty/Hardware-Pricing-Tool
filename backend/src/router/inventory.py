import logging
from typing import List, Optional
import httpx
from fastapi import APIRouter, FastAPI

from backend.src.database.handlers.inventory_parts import (
    LocalInventoryService,
)
from backend.src.models.inventory_model import (
    CountriesRegionsModel,
    HPEProductsDescription,
    InventoryPart,
    ModelSearchResponse,
    PartNumbersMultiple,
    PartResponse,
    PartsResponse,
    SearchDescriptionResponse,
)
from backend.src.root.database import db_dependency
from backend.src.root.settings import settings
from icecream import ic
from backend.src.services.hpe_services import (
    get_hpe_part_info,
    multiple_parts_broker_bin_search,
    search_parts_broker_bin,
)
from backend.src.models.inventory_model import HPE_obj

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

host = "https://serach.brokerbin.com"
router = APIRouter()  # Use APIRouter for better organization


# Base URL for the HPE PartSurfer search
BASE_URL = "https://partsurfer.hpe.com/Search.aspx"


# --- API Route ---
@router.get(
    "/part-number",
    summary="Get HPE Part Information",
    description="Retrieves product details and component BOM for a given HPE part ID by scraping PartSurfer.",
    response_description="A JSON object containing product information and component BOM.",
    tags=["HPE Parts"],  # Optional tag for grouping in docs
)
async def get_broker_part(
    db_conn: db_dependency,
    query: str,
    countries: Optional[str] = None,
    regions: Optional[str] = None,
):
    """
    API endpoint to fetch HPE part information.
    """
    # Search Local Database:
    if countries:
        countries = tuple(countries.split(","))
    if regions:
        regions = tuple(regions.split(","))

    result = await LocalInventoryService.get_computer_part_by_part_number(
        db_conn=db_conn, part_number=query
    )
    product_parts = []
    if len(result) > 0:
        for part in result:
            product = PartResponse(
                price=part.price, part_number=part.product_code, description=part.name
            )
            product_parts.append(product)
        return PartsResponse(data=product_parts)

    broker_query = InventoryPart(query=query, country=countries, region=regions)

    res = await search_parts_broker_bin(
        query=broker_query,
        authorization=f"Bearer {settings.AUTHORIZATION}",
        login_username=f"{settings.BROKERUSER}",
    )
    final = []
    for part in res.data:
        part_model = part_model = PartResponse(
            price=part.get("price"),
            part_number=part.get("part"),
            description=part.get("description"),
            country=part.get("country"),
            company=part.get("company"),
            condition=part.get("cond"),
            age=str(part.get("age_in_days")),
            manufacturer=part.get("mfg"),
        )
        final.append(part_model)

    return PartsResponse(data=final)


# --- API Route ---
@router.post(
    "/part-number/multiple",
    summary="Get HPE Part Information",
    description="Retrieves product details and component BOM for a given HPE part ID by scraping PartSurfer.",
    response_description="A JSON object containing product information and component BOM.",
    tags=["HPE Parts"],  # Optional tag for grouping in docs
)
async def get_multiple_part_numbers(db_conn: db_dependency, items: PartNumbersMultiple):
    """
    API endpoint to fetch HPE part information.
    """
    # Search Local Database:
    result = await LocalInventoryService.get_multiple_parts_by_part_number(
        db_conn=db_conn, part_numbers=items.part_numbers
    )
    product_parts = []
    product_part_numbers = items.part_numbers
    parts_number_not_found = []
    if len(result) > 0:
        for part in result:
            if part.product_code in items.part_numbers:
                product = PartResponse(
                    price=part.price,
                    part_number=part.product_code,
                    description=part.name,
                )
                product_parts.append(product)
            else:
                parts_number_not_found.append(part.product_code)

        if len(parts_number_not_found) == 0:
            return PartsResponse(data=product_parts)
        else:
            product_part_numbers = parts_number_not_found

    multiple_responses = await multiple_parts_broker_bin_search(
        parts_list=product_part_numbers,
        countries=items.countries,
        regions=items.regions,
    )
    result_data = multiple_responses.data

    result_data.extend(product_parts)
    final = []
    for part in result_data:
        part_model = PartResponse(
            price=part.get("price"),
            part_number=part.get("part"),
            description=part.get("description"),
            country=part.get("country"),
            company=part.get("company"),
            condition=part.get("cond"),
            age=part.get("age_in_days"),
            manufacturer=part.get("mfg"),
        )
        final.append(part_model)

    return PartsResponse(data=final)


# --- API Route ---
@router.get(
    "/model",
    summary="Find Model Description",
    description="Retrieves product details and component BOM for a given HPE part ID by scraping PartSurfer.",
    response_description="A JSON object containing product information and component BOM.",
    tags=["HPE Parts"],  # Optional tag for grouping in docs
)
async def get_model_description(
    db_conn: db_dependency,
    query: str,
    countries: Optional[str] = None,
    regions: Optional[str] = None,
):
    """
    API endpoint to fetch HPE part information.
    """
    print(countries, regions)
    # Search Local Database:
    result = await LocalInventoryService.get_computer_part_by_name_fuzzy_search(
        db_conn=db_conn, part_name=query
    )
    product_list = []
    if len(result) > 0:
        for part in result:
            product = SearchDescriptionResponse(
                description=part.name,
                part_number=part.product_code,
                tech_courier=part.product_url,
            )
            product_list.append(product)
        return ModelSearchResponse(
            product_details=HPEProductsDescription(product_description=query),
            product_component=product_list,
        )

    product_info, product_component = await get_hpe_part_info(part_id=query)

    logger.info(f"Successfully received data for {query}.")
    # product_component = HPE_obj
    product_component_list = []
    part_number_list = []
    for part_number, description, tec_courier in zip(
        product_component.part_number,
        product_component.part_description,
        product_component.tech_courier,
    ):
        product_component_list.append(
            SearchDescriptionResponse(
                part_number=part_number,
                description=description,
                tech_courier=tec_courier,
            )
        )
        part_number_list.append(part_number)

    # Search Local Database:
    query_params = CountriesRegionsModel(countries=countries, regions=regions)

    # find the Average Market Value
    multiple_responses = await multiple_parts_broker_bin_search(
        parts_list=part_number_list,
        countries=query_params.countries,
        regions=query_params.regions,
    )
    product_info.product_average_cost = multiple_responses.total_cost

    final_response = []
    for part in multiple_responses.median_part:
        part_model = PartResponse(
            price=part.get("price", 0),
            part_number=part.get("part", "N/A"),
            description=part.get("description", "N/A"),
            country=part.get("country", "N/A"),
            company=part.get("company", "N/A"),
            condition=part.get("cond", " N/A"),
            age=part.get("age_in_days", "N/A"),
            manufacturer=part.get("mfg", "N/A"),
        )
        final_response.append(part_model)

    return ModelSearchResponse(
        product_details=product_info,
        product_component=final_response,
    )


@router.get("/part/search")  # Use .get, .post etc. and correct path
async def search_parts(query: InventoryPart):  # Example: taking query as a parameter
    # Example async request using httpx
    search_url = f"{host}/api/v2/part/search"  # Replace with actual endpoint
    params = query.model_dump(exclude_unset=True)  # Example parameters
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(search_url, params=params)
            response.raise_for_status()
            data = response.json()
            return data
    except httpx.RequestError as exc:
        print(f"API Request Error: {exc}")
        return {"error": "Failed to connect to search service"}
    except httpx.HTTPStatusError as exc:
        print(f"API HTTP Error: {exc.response.status_code} - {exc.response.text}")
        return {"error": f"Search service returned status {exc.response.status_code}"}
