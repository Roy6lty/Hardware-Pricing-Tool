import asyncio

# from functools import lru_cache
from async_lru import alru_cache
import time
from bs4 import BeautifulSoup
from fastapi import HTTPException
import httpx
import logging
from numpy import append
from pydantic import BaseModel
from icecream import ic
from backend.src.models.inventory_model import (
    BrokerBinServerResponse,
    HPEPartsModel,
    HPEProductsDescription,
    InventoryPart,
)
from backend.src.root.settings import settings

# Configure basic logging to see output in the console
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

host = "https://serach.brokerbin.com"
# Base URL for the HPE PartSurfer search
BASE_URL = "https://partsurfer.hpe.com/Search.aspx"


# --- Helper Function to Parse HTML ---
def parse_part_html(html_content: str):
    """Parses the HTML content from PartSurfer to extract part details."""
    soup = BeautifulSoup(html_content, "lxml")  # Use lxml parser

    product_info = {}
    bom_array = []
    current_bom_item = {}
    bom_item_count = 0  # Counter to track fields within a BOM item
    products_details = {}

    # Find all span elements (similar to the original approach)
    spans = soup.find_all("span")

    for span in spans:
        span_id = span.get("id")
        span_text = span.get_text(strip=True)

        if span_id:
            # --- Extract Product Information ---
            if span_id == "ctl00_BodyContentPlaceHolder_lblSerialNumber":
                product_info["Serial Number"] = span_text
            elif span_id == "ctl00_BodyContentPlaceHolder_lblProductNumber":
                product_info["Product Number"] = span_text
            elif span_id == "ctl00_BodyContentPlaceHolder_lblDescription":
                product_info["Product Description"] = span_text

            # --- Extract Component BOM Information ---
            elif "ctl00_BodyContentPlaceHolder_gridCOMBOM" in span_id:
                if span_text in [
                    "Matching Spare Parts",
                    "Assembly Part Number",
                    "Part Description",
                    "Qty",
                    "",
                ]:
                    continue

                if bom_item_count == 0:
                    current_bom_item["Part"] = span_text
                elif bom_item_count == 1:
                    current_bom_item["Description"] = span_text
                elif bom_item_count == 2:
                    current_bom_item["Quantity"] = span_text
                    bom_array.append(current_bom_item)
                    current_bom_item = {}
                    bom_item_count = -1

                bom_item_count += 1

    results = {"productInfo": product_info, "componentBom": bom_array}

    if not product_info.get("Product Number") and not product_info.get("Serial Number"):
        logger.warning("Could not find key product information on the page.")
    return results


#####################################################################################


def parse_part_number(soup: BeautifulSoup):
    part_number = []
    tds = soup.find_all("td")
    if tds:
        for td_tags in tds:
            anchor_tag = td_tags.find("a")
            if anchor_tag:
                anchor_id = anchor_tag.get("id")
                anchor_text = anchor_tag.get_text(strip=True)
                anchor_href = anchor_tag.get("href")
                if anchor_id:
                    if anchor_id[-6:] == "Partno":
                        part_number.append(anchor_text)
        return part_number


def parse_specific_rtf_table_tag(soup: BeautifulSoup):
    spans = soup.find_all("span")
    product_info = {}
    rohs = []
    tech_courier = []
    csr = []
    part_description = []

    part_number = parse_part_number(soup)

    for index, span in enumerate(spans):
        span_id = span.get("id")
        span_text = span.get_text(strip=True)
        category = str(index)

        if span_id:
            # --- Extract Product Information ---
            if span_id == "ctl00_BodyContentPlaceHolder_lblSerialNumber":
                product_info["Serial Number"] = span_text
            elif span_id == "ctl00_BodyContentPlaceHolder_lblProductNumber":
                product_info["Product Number"] = span_text
            elif span_id == "ctl00_BodyContentPlaceHolder_lblDescription":
                product_info["Product Description"] = span_text

        # Now, check your cases (conditions)
        if span_id:
            if span_id[-7:] == "lbldesc":
                part_description.append(span_text)
            elif span_id[-6:] == "lblcsr":
                csr.append(span_text)
            elif span_id[-5:] == "lbltc":
                tech_courier.append(span_text)
            elif span_id[-4:] == "rohs":
                rohs.append(span_text)
    product_components = {
        "part_number": part_number,
        "part_description": part_description,
        "csr": csr,
        "tech_courier": tech_courier,
        "rohs": rohs,
    }
    product_components_model = HPEPartsModel.model_validate(product_components)
    product_info_model = HPEProductsDescription(
        serial_number=product_info.get("Serial Number"),
        product_number=product_info.get("Product Number"),
        product_description=product_info.get("Product Description"),
    )
    return product_info_model, product_components_model


def parse_specific_rtf_table(html_content: str):
    """
    Parses an HTML table with class 'rtf_table' and extracts data
    based on spans with 'ctl00_BodyContentPlaceHolder_gridCOMBOM' in their ID.
    """
    soup = BeautifulSoup(html_content, "lxml")
    main_table = soup.find("table", class_="rtf_table")

    if not main_table:
        print("Table with class 'rtf_table' not found.")

        logger.info("Found table with class 'rtf_table'.")

    product_info, product_components = parse_specific_rtf_table_tag(soup)

    return product_info, product_components


# @alru_cache(maxsize=128)
async def get_hpe_part_info(part_id: str, max_retries: int = 5):
    """
    Function to fetch HPE part information (adapted for direct calling).
    """
    search_url = f"{BASE_URL}?searchText={part_id}"
    logger.info(
        f"Requesting part info for ID: {part_id} from URL: {search_url}"
    )  # Uncommented
    MAX_RETRIES = max_retries
    counter = 0
    response = None
    while counter < MAX_RETRIES:
        ic(counter)
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(search_url)
                response.raise_for_status()
                break

        except httpx.TimeoutException:
            logger.error(f"Timeout while requesting {search_url}")
            raise HTTPException(
                status_code=504, detail="Request to HPE PartSurfer timed out."
            )
        except httpx.RequestError as exc:
            logger.error(
                f"An error occurred while requesting {exc.request.url!r}: {exc}"
            )
            if counter > max_retries:
                raise HTTPException(
                    status_code=503,
                    detail=f"Could not connect to HPE PartSurfer: {exc}",
                ) from exc
        except httpx.HTTPStatusError as exc:
            logger.error(
                "HPE PartSurfer returned status %s for %r",
                exc.response.status_code,
                exc.request.url,
            )
            if counter > max_retries:
                raise HTTPException(
                    status_code=502,
                    detail=f"HPE PartSurfer returned an error: Status {exc.response.status_code}",
                )
            counter += 1

    logger.info(f"Successfully fetched HTML for part ID: {part_id}")

    try:
        if response:
            product_info, product_components = parse_specific_rtf_table(response.text)
            if not product_info:
                logger.warning(
                    "No significant data found after parsing for part ID: %s. Parsed data: %s",
                    part_id,
                    product_info,
                )
                raise HTTPException(
                    status_code=404,
                    detail="Part ID '%s' not found or no details available on PartSurfer."
                    % part_id,
                )

            logger.info(f"Successfully parsed data for part ID: {part_id}")

            return product_info, product_components

    except Exception as e:
        logger.exception(f"Error parsing HTML for part ID {part_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to parse data from HPE PartSurfer: {e}"
        )


@alru_cache(maxsize=128)
async def search_parts_broker_bin(
    query: InventoryPart, authorization: str, login_username: str, max_retires: int = 5
):
    host = "https://search.brokerbin.com"
    search_url: str = f"{host}/api/v2/part/search"
    params = query.model_dump(exclude_unset=True)
    headers = {
        "Authorization": f"Bearer {authorization}",
        "login": login_username,
        "Accept": "application/json",
    }
    MAX_RETRIES = max_retires
    counter = 0
    data = None
    while counter < MAX_RETRIES:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                logger.info(f"Requesting URL: {search_url} with params: {params}")
                response = await client.get(search_url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                break
        except httpx.RequestError as exc:
            logger.info(f"API Request Error: {exc}")
            if counter == MAX_RETRIES:
                logger.error(f"API Request Error: {exc}")
                raise exc
        except httpx.HTTPStatusError as exc:
            logger.info(
                f"API HTTP Error: {exc.response.status_code} - {exc.response.text}"
            )
            if counter == MAX_RETRIES:
                logger.error(
                    f"API HTTP Error: {exc.response.status_code} - {exc.response.text}"
                )
                raise exc
        counter += 1
        await asyncio.sleep(0.5 * (counter + 1))
    ic(counter)
    if not data:
        raise HTTPException(
            status_code=503,
            detail=f"API HTTP Error: 503 - unable to reach {host}",
        )
    return BrokerBinServerResponse(data=data["data"])


@alru_cache(maxsize=128)
async def multiple_parts_broker_bin_search(
    parts_list: list,
    country: str | None,
    login_username: str = settings.BROKERUSER,
    authorization: str = settings.AUTHORIZATION,
):
    query_params = []
    broker_response = []
    if len(parts_list) > 0:
        for part in parts_list:
            query = InventoryPart(query=part)
            query_params.append(query)
        results = await asyncio.gather(
            *(
                search_parts_broker_bin(
                    query=query,
                    login_username=login_username,
                    authorization=authorization,
                )
                for query in query_params
            ),
            return_exceptions=True,
        )
        for param, result in zip(query_params, results):
            if isinstance(result, Exception):
                continue
            else:
                if len(result.data) > 0:
                    broker_response.extend(result.data)
    return broker_response
