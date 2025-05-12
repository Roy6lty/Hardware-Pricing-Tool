# Inventory Tool Backend

This project is a backend application built with FastAPI, designed to manage and query inventory information, with a primary focus on HPE (Hewlett Packard Enterprise) parts. It integrates with external services like BrokerBin and HPE PartSurfer to fetch real-time part data and utilizes a local PostgreSQL database for caching and storing inventory.

## Features

- **HPE Part Information:**
  - Retrieve detailed product information and Bill of Materials (BOM) for HPE parts by scraping HPE PartSurfer.
  - Search by product description/model.
- **BrokerBin Integration:**
  - Search for parts on BrokerBin by part number (single or multiple).
  - Filter BrokerBin searches by country, manufacturer, condition, etc.
  - Retrieves pricing, availability, company, condition, and other details.
- **Local Database Integration:**
  - Checks a local PostgreSQL database for part information before querying external services.
  - Stores fetched data to optimize future requests.
  - Supports fuzzy search on part names in the local database.
- **Asynchronous Operations:**
  - Leverages `async/await` for non-blocking I/O, enhancing performance and scalability, especially when dealing with external API calls.
- **Modular Design:**
  - Clear separation of concerns with routers for API endpoints, services for business logic, and database handlers.
- **Configuration Management:**
  - Uses Pydantic settings for easy configuration via environment variables.

## Technologies Used

- **Backend Framework:** FastAPI
- **Programming Language:** Python 3.x
- **Database:** PostgreSQL (with `asyncpg` driver)
- **ORM:** SQLAlchemy (Async support)
- **HTTP Client:** httpx (asynchronous)
- **Web Scraping:** Beautiful Soup 4, lxml
- **Data Validation/Serialization:** Pydantic
- **Caching:** async-lru for asynchronous function call caching.
- **Configuration:** Pydantic-Settings
- **Development/Debugging:** icecream
- **Web Server (for FastAPI):** Uvicorn

## Project Structure
