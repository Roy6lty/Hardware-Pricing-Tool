// /home/olowoleru/projects/Inventory_tool/inventory_frontend/front/src/components/ui/Search.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]); // Changed from string to array
  const [selectedCountrySpecificRegions, setSelectedCountrySpecificRegions] =
    useState([]); // Changed from string to array
  const [searchMode, setSearchMode] = useState("model");
  const [searchResults, setSearchResults] = useState(null); // This will now hold the product_component array for model search, or the list of parts for partnumber search
  const [productDetails, setProductDetails] = useState(null); // NEW state for product details (used only in model search)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModelItems, setSelectedModelItems] = useState([]);
  const navigate = useNavigate(); // useNavigate is imported but not used. Consider removing if not planned for use.
  const [selectedIndependentRegions, setSelectedIndependentRegions] = useState(
    []
  ); // Changed from string to array
  const [modelSearchCriteria, setModelSearchCriteria] = useState(null); // To store filters used for the model search

  // State for collapsible filter sections
  const [isCountriesFilterOpen, setIsCountriesFilterOpen] = useState(false); // Changed to false
  const [
    isCountrySpecificRegionsFilterOpen,
    setIsCountrySpecificRegionsFilterOpen, // Changed to false
  ] = useState(false); // Set to false for consistency, collapsed by default
  const [isIndependentRegionsFilterOpen, setIsIndependentRegionsFilterOpen] =
    useState(false); // Changed to false

  const countries = [
    { code: "ARG", name: "Argentina" },
    { code: "AUS", name: "Australia" },
    { code: "AUT", name: "Austria" },
    { code: "BRA", name: "Brazil" },
    { code: "CAN", name: "Canada" },
    { code: "CHN", name: "China" },
    { code: "COL", name: "Colombia" },
    { code: "CZE", name: "Czech Republic" },
    { code: "DNK", name: "Denmark" },
    { code: "EGY", name: "Egypt" },
    { code: "FRA", name: "France" },
    { code: "DEU", name: "Germany" },
    { code: "GRC", name: "Greece" },
    { code: "HKG", name: "Hong Kong" },
    { code: "HUN", name: "Hungary" },
    { code: "IND", name: "India" },
    { code: "IRL", name: "Ireland" },
    { code: "ISR", name: "Israel" },
    { code: "ITA", name: "Italy" },
    { code: "JPN", name: "Japan" },
    { code: "KOR", name: "South Korea" },
    { code: "NGA", name: "Nigeria" },
    { code: "MEX", name: "Mexico" },
    { code: "NLD", name: "Netherlands" },
    { code: "SAU", name: "Saudi Arabia" },
    { code: "SGP", name: "Singapore" },
    { code: "ZAF", name: "South Africa" },
    { code: "SWE", name: "Sweden" },
    { code: "CHE", name: "Switzerland" },
    { code: "TUR", name: "Turkey" },
    { code: "ARE", name: "United Arab Emirates" },
    { code: "GBR", name: "United Kingdom" },
    { code: "USA", name: "United States" },
  ];

  const independentRegions = [
    { code: "Asia", name: "Asia" },
    { code: "Europe", name: "Europe" },
    { code: "North America", name: "North America" },
    { code: "Middle East", name: "Middle East" },
    { code: "Oceania", name: "Oceania" },
  ];

  // Define regionsByCountry - you'll need to populate this with your actual data
  const regionsByCountry = {
    USA: [
      { code: "CA", name: "California" },
      { code: "NY", name: "New York" },
      { code: "TX", name: "Texas" },
      // ... other US states/regions
    ],
    CAN: [
      { code: "ON", name: "Ontario" },
      { code: "QC", name: "Quebec" },
      { code: "BC", name: "British Columbia" },
      // ... other Canadian provinces/regions
    ],
    // ... add other countries and their regions as needed
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleCountryToggle = (countryCode) => {
    setSelectedCountries((prev) => {
      const newSelectedCountries = prev.includes(countryCode)
        ? prev.filter((c) => c !== countryCode)
        : [...prev, countryCode];

      // If more than one country or no country is selected, clear country-specific regions
      if (newSelectedCountries.length !== 1) {
        setSelectedCountrySpecificRegions([]);
      }
      return newSelectedCountries;
    });
    // If a country is selected/deselected, clear independent regions to enforce mutual exclusivity
    setSelectedIndependentRegions([]);
  };

  const handleCountrySpecificRegionToggle = (regionCode) => {
    setSelectedCountrySpecificRegions((prev) =>
      prev.includes(regionCode)
        ? prev.filter((r) => r !== regionCode)
        : [...prev, regionCode]
    );
  };

  const handleIndependentRegionToggle = (regionCode) => {
    setSelectedIndependentRegions((prev) =>
      prev.includes(regionCode)
        ? prev.filter((r) => r !== regionCode)
        : [...prev, regionCode]
    );
    // If an independent region is selected/deselected, clear countries and country-specific regions
    // to enforce mutual exclusivity
    setSelectedCountries([]);
    setSelectedCountrySpecificRegions([]);
  };

  // Modified fetchData to handle different response structures based on searchMode
  const fetchData = async (endpoint, errorMessagePrefix) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null); // Clear previous table results
    setProductDetails(null); // Clear previous product details

    try {
      const response = await axios.get(endpoint);
      const responseBody = response.data;

      if (searchMode === "model") {
        // Expecting { product_details: {...}, product_component: [...] }
        console.log("Model Search API Response:", responseBody); // Log for debugging
        if (
          responseBody &&
          responseBody.product_details &&
          Array.isArray(responseBody.product_component)
        ) {
          setProductDetails(responseBody.product_details);
          setSearchResults(responseBody.product_component); // searchResults now holds the array for the table
        } else if (
          responseBody &&
          (responseBody.detail || responseBody.message)
        ) {
          // Handle API-level errors returned in the expected object structure
          setError(responseBody.detail || responseBody.message);
          setSearchResults(null);
          setProductDetails(null);
        } else {
          // This case handles unexpected successful responses (e.g., empty object, wrong keys)
          setError("Unexpected data format for model search results.");
          setSearchResults(null);
          setProductDetails(null);
          console.error(
            `Unexpected 2xx API response format for ${errorMessagePrefix}:`,
            responseBody
          );
        }
      } else {
        // searchMode === "partnumber"
        // Expecting { data: [...] } or just [...]
        console.log("Part Number Search API Response:", responseBody); // Log for debugging
        let itemsArray = null;
        if (responseBody && Array.isArray(responseBody.data)) {
          itemsArray = responseBody.data;
        } else if (responseBody && Array.isArray(responseBody)) {
          itemsArray = responseBody;
        }

        if (itemsArray) {
          setSearchResults(itemsArray); // searchResults holds the array for the table
          setProductDetails(null); // Ensure product details are cleared for part number search
        } else if (
          responseBody &&
          (responseBody.detail || responseBody.message)
        ) {
          setError(responseBody.detail || responseBody.message);
          setSearchResults(null);
          setProductDetails(null);
        } else {
          // This case handles unexpected successful responses (e.g., empty object, wrong keys)
          setError(
            "Unexpected data format from server for part number search results."
          );
          setSearchResults(null);
          setProductDetails(null);
          console.error(
            `Unexpected 2xx API response format for ${errorMessagePrefix}:`,
            responseBody
          );
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${errorMessagePrefix} (Axios):`, err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        `An unknown error occurred while fetching ${errorMessagePrefix}.`;
      setError(errorMessage);
      setSearchResults(null);
      setProductDetails(null); // Clear details on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartNumberData = async (
    currentQuery,
    currentCountries,
    currentCountrySpecificRegions,
    currentIndependentRegions
  ) => {
    const trimmedQuery = currentQuery.trim();
    if (!trimmedQuery) {
      setSearchResults(null);
      setProductDetails(null); // Clear details
      setError("Please enter a part number to search.");
      setIsLoading(false);
      return;
    }

    setSelectedModelItems([]);
    let endpoint = `http://134.209.22.147:8005/part-number?query=${encodeURIComponent(
      trimmedQuery
    )}`;

    if (currentCountries.length > 0) {
      endpoint += `&countries=${encodeURIComponent(
        currentCountries.join(",")
      )}`;
    }

    if (currentIndependentRegions.length > 0) {
      endpoint += `&regions=${encodeURIComponent(
        currentIndependentRegions.join(",")
      )}`;
    }

    fetchData(endpoint, "part number data");
  };

  const fetchModelData = async (
    currentQuery,
    currentCountries,
    currentCountrySpecificRegions,
    currentIndependentRegions // Added for consistency, assuming backend supports it
  ) => {
    const trimmedQuery = currentQuery.trim();
    if (!trimmedQuery) {
      setSearchResults(null);
      setProductDetails(null); // Clear details
      setError("Please enter a model to search.");
      setIsLoading(false);
      return;
    }
    // Store the criteria used for this model search
    setModelSearchCriteria({
      countries: currentCountries,
      countrySpecificRegions: currentCountrySpecificRegions,
      independentRegions: currentIndependentRegions,
    });

    setSelectedModelItems([]); // Clear selected items for model search
    let endpoint = `http://134.209.22.147:8005/model?query=${encodeURIComponent(
      trimmedQuery
    )}`;

    fetchData(endpoint, "model data");
  };

  const handleSetSearchMode = (newMode) => {
    setSearchMode(newMode);
    setError(null);
    setSearchResults(null);
    setProductDetails(null); // Clear product details when changing mode
    setIsLoading(false);
    setSelectedModelItems([]); // Clear selected items
    setSelectedCountries([]);
    setSelectedCountrySpecificRegions([]);
    setSelectedIndependentRegions([]);
    setModelSearchCriteria(null); // Clear stored model search criteria
  };

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError(
        searchMode === "partnumber"
          ? "Please enter a part number to search."
          : "Please enter a model to search."
      );
      setSearchResults(null);
      setProductDetails(null); // Clear details on empty query
      setIsLoading(false);
      return;
    }

    if (searchMode === "partnumber") {
      fetchPartNumberData(
        trimmedQuery,
        selectedCountries,
        selectedCountrySpecificRegions,
        selectedIndependentRegions
      );
    } else if (searchMode === "model") {
      fetchModelData(
        trimmedQuery,
        selectedCountries,
        selectedCountrySpecificRegions,
        selectedIndependentRegions
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const getCountryName = (code) => {
    if (!code) return ""; // Return empty or some placeholder if needed for multiple
    const country = countries.find((c) => c.code === code);
    return country ? country.name : code;
  };

  const getRegionName = (countryCode, regionCode) => {
    // This function might need adjustment if used to display multiple selected regions
    if (!regionCode) return "";
    if (countryCode && regionsByCountry[countryCode]) {
      const region = regionsByCountry[countryCode].find(
        (r) => r.code === regionCode
      );
      return region ? region.name : regionCode;
    }
    // For independent regions or if countryCode is not singular
    const independentRegion = independentRegions.find(
      (r) => r.code === regionCode
    );
    return independentRegion ? independentRegion.name : regionCode;
  };

  const handleModelItemToggle = (item) => {
    setSelectedModelItems((prevSelected) => {
      const isAlreadySelected = prevSelected.find(
        (selectedItem) => selectedItem.part_number === item.part_number
      );
      if (isAlreadySelected) {
        return prevSelected.filter(
          (selectedItem) => selectedItem.part_number !== item.part_number
        );
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const openSelectedPartsPage = async () => {
    if (selectedModelItems.length === 0) {
      alert("Please select at least one item to proceed.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const criteriaToUse = modelSearchCriteria || {
        countries: selectedCountries, // Fallback to current if modelSearchCriteria is somehow null
        countrySpecificRegions: selectedCountrySpecificRegions,
        independentRegions: selectedIndependentRegions,
      };

      const endpoint = "http://134.209.22.147:8005/part-number/multiple";
      const postData = {
        part_numbers: selectedModelItems.map((item) => item.part_number),
        countries: criteriaToUse.countries,
        regions: [
          ...(criteriaToUse.independentRegions || []),
          ...(criteriaToUse.countrySpecificRegions || []),
        ],
      };

      const response = await axios.post(endpoint, postData);
      const responseBody = response.data; // Use responseBody for clarity

      // Crucial: Log the actual response from the API
      console.log("API response for /part-number/multiple:", responseBody);

      let itemsToProcess = null;

      // Check if the array is directly in responseBody or nested (e.g., responseBody.data)
      if (
        responseBody &&
        Array.isArray(responseBody.data) &&
        responseBody.data.length > 0
      ) {
        itemsToProcess = responseBody.data;
      } else if (
        responseBody &&
        Array.isArray(responseBody) &&
        responseBody.length > 0
      ) {
        itemsToProcess = responseBody;
      }

      if (itemsToProcess) {
        const formattedItems = itemsToProcess.map((item) => ({
          // Ensure these keys match the PartResponse model in the backend
          part_number: item.part_number || "N/A",
          description: item.description || "No description available",
          // tech_courier is expected by SelectedPartsPage, map company if tech_courier isn't available in this specific response
          tech_courier: item.tech_courier || item.company || "N/A",
          price: item.price,
          country: item.country,
          condition: item.condition,
          age: item.age,
          manufacturer: item.manufacturer,
          quantity: item.quantity,
        }));

        const url = `/selected-parts?items=${encodeURIComponent(
          JSON.stringify(formattedItems)
        )}`;

        // Attempt to open the new window
        const newWindow = window.open(url, "_blank");

        // Check if the window was blocked
        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          setError(
            "Could not open new window. Please disable your pop-up blocker for this site and try again."
          );
        }
      } else {
        // If itemsToProcess is still null, it means no valid data was found
        let message = "No part information found for the selected items.";
        if (
          responseBody &&
          typeof responseBody === "object" &&
          !Array.isArray(responseBody)
        ) {
          // If API returns an error object like { message: "..." } or { detail: "..." }
          // or if it's an object that doesn't contain the expected array structure
          message = responseBody.message || responseBody.detail || message;
        } else if (
          (Array.isArray(responseBody) && responseBody.length === 0) ||
          (responseBody &&
            Array.isArray(responseBody.data) &&
            responseBody.data.length === 0)
        ) {
          message = "No part information found (empty list returned).";
        }
        setError(message);
      }
    } catch (error) {
      console.error(
        "Error fetching part information for selected models:",
        error
      );
      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to retrieve part information. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderText =
    searchMode === "model"
      ? "e.g., Western Digital Hard Drives, DL380 Gen10"
      : "e.g., 867992-B21, P00924-B21";

  // Determine if results should be shown (either table data or product details exist)
  const showResultsSection =
    !isLoading && !error && (searchResults || productDetails);

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      {/* ... Search Mode Slider ... */}
      <div className="search-mode-slider">
        <button
          type="button"
          className={`mode-option-button ${
            searchMode === "model" ? "active" : ""
          }`}
          onClick={() => handleSetSearchMode("model")}
        >
          Model Search
        </button>
        <button
          type="button"
          className={`mode-option-button ${
            searchMode === "partnumber" ? "active" : ""
          }`}
          onClick={() => handleSetSearchMode("partnumber")}
        >
          Part Number Search
        </button>
      </div>

      {/* ... Search Input Group ... */}
      <div className="search-input-group">
        <input
          type="text"
          className="search-input"
          placeholder={placeholderText}
          value={query}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="search-button"
          // Disable while loading, but only if there are no results/details currently displayed
          disabled={isLoading && !showResultsSection}
        >
          {isLoading && !showResultsSection ? "Searching..." : "Search"}
        </button>
      </div>

      {/* ... Filter Dropdown Group ... */}
      <div className="filter-dropdown-group">
        {/* Country Checkboxes */}
        <div className="filter-checkbox-group country-filter">
          <h5
            onClick={() => setIsCountriesFilterOpen(!isCountriesFilterOpen)}
            className="filter-group-header"
          >
            Countries {isCountriesFilterOpen ? "[-]" : "[+]"}
          </h5>
          {isCountriesFilterOpen && (
            <>
              {countries.map((country) => (
                <div key={country.code} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`country-${country.code}`}
                    checked={selectedCountries.includes(country.code)}
                    onChange={() => handleCountryToggle(country.code)}
                  />
                  <label htmlFor={`country-${country.code}`}>
                    {country.name}
                  </label>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Country-Specific Region Checkboxes (Conditional) */}
        {selectedCountries.length === 1 &&
          regionsByCountry[selectedCountries[0]] && (
            <div className="filter-checkbox-group region-filter">
              <h5
                onClick={() =>
                  setIsCountrySpecificRegionsFilterOpen(
                    !isCountrySpecificRegionsFilterOpen
                  )
                }
                className="filter-group-header"
              >
                Regions for {getCountryName(selectedCountries[0])}{" "}
                {isCountrySpecificRegionsFilterOpen ? "[-]" : "[+]"}
              </h5>
              {isCountrySpecificRegionsFilterOpen && (
                <>
                  {(regionsByCountry[selectedCountries[0]] || []).map(
                    (region) => (
                      <div key={region.code} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`country-region-${region.code}`}
                          checked={selectedCountrySpecificRegions.includes(
                            region.code
                          )}
                          onChange={() =>
                            handleCountrySpecificRegionToggle(region.code)
                          }
                        />
                        <label htmlFor={`country-region-${region.code}`}>
                          {region.name}
                        </label>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}

        {/* Independent Region Checkboxes */}
        <div className="filter-checkbox-group independent-region-filter">
          <h5
            onClick={() =>
              setIsIndependentRegionsFilterOpen(!isIndependentRegionsFilterOpen)
            }
            className="filter-group-header"
          >
            Regions {isIndependentRegionsFilterOpen ? "[-]" : "[+]"}{" "}
            {/* Title changed here */}
          </h5>
          {isIndependentRegionsFilterOpen && (
            <>
              {independentRegions.map((region) => (
                <div key={region.code} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`ind-region-${region.code}`}
                    checked={selectedIndependentRegions.includes(region.code)}
                    onChange={() => handleIndependentRegionToggle(region.code)}
                  />
                  <label htmlFor={`ind-region-${region.code}`}>
                    {region.name}
                  </label>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* --- Feedback Messages --- */}
      {isLoading &&
        !showResultsSection && ( // Only show loading if no results are currently displayed
          <div className="search-feedback loading-message">Loading...</div>
        )}
      {!isLoading &&
        error && ( // Show error if not loading and error exists
          <div className="search-feedback error-message">Error: {error}</div>
        )}

      {/* --- Results Section (Conditional Rendering) --- */}
      {showResultsSection && (
        <div className="search-results-section">
          {/* --- Product Details Section (ONLY for Model Search) --- */}
          {searchMode === "model" && productDetails && (
            <div className="product-details-summary">
              {" "}
              {/* Add a class for styling */}
              <h4>Product Details</h4> {/* Optional heading */}
              {/* Apply bold using <strong> tags */}
              <p>
                <strong>Product Name:</strong>{" "}
                {productDetails.product_number || "N/A"}
              </p>
              <p>
                <strong>Serial Number:</strong>{" "}
                {productDetails.serial_number || "N/A"}
              </p>
              <p>
                <strong>Product Description:</strong>{" "}
                {productDetails.product_description || "N/A"}
              </p>
            </div>
          )}
          {/* --- Table Container --- */}
          <div className="search-results-table-container">
            {/* Only show "Search Results" heading if there are items to display in the table */}
            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <h4>Search Results</h4>
            )}

            {/* --- Table Rendering --- */}
            {/* Render table only if searchResults is an array and has items */}
            {Array.isArray(searchResults) && searchResults.length > 0 ? (
              searchMode === "model" ? (
                <>
                  <div className="table-responsive-wrapper">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Part Number</th>
                          <th>Description</th>
                          <th>Tech Courier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((item, index) => (
                          // Use item.part_number for key if available, fallback to index
                          <tr key={item.part_number || `model-item-${index}`}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedModelItems.some(
                                  (selected) =>
                                    selected.part_number === item.part_number
                                )}
                                onChange={() => handleModelItemToggle(item)}
                                aria-label={`Select ${item.part_number}`}
                              />
                            </td>
                            {/* Bold the Part Number TD using inline style */}
                            <td style={{ fontWeight: "bold" }}>
                              {item.part_number}
                            </td>
                            <td>{item.description}</td>
                            <td>{item.tech_courier}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedModelItems.length > 0 && (
                    <div style={{ marginTop: "1rem", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={openSelectedPartsPage}
                        className="search-button next-button"
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Next"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // searchMode === "partnumber"
                <div className="table-responsive-wrapper">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Part Number</th>
                        <th>Description</th>
                        <th>Company</th>
                        <th>Country</th>
                        <th>Condition</th>
                        <th>Price</th>
                        <th>Manufacturer</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((item, index) => (
                        // Use item.part_number for key if available, fallback to index
                        <tr key={item.part_number || `pn-item-${index}`}>
                          {/* Bold the Part Number TD using inline style */}
                          <td style={{ fontWeight: "bold" }}>
                            {item.part_number}
                          </td>
                          <td>{item.description}</td>
                          <td>{item.company}</td>
                          <td>{item.country}</td>
                          <td>{item.condition}</td>
                          <td>
                            {typeof item.price === "number"
                              ? `$${item.price.toFixed(2)}`
                              : item.price}
                          </td>
                          <td>{item.manufacturer}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : // Message if searchResults is an empty array, but productDetails exist (for model search)
            searchMode === "model" && productDetails ? (
              <p>No component parts found for this model.</p>
            ) : (
              // Generic "No results" message if searchResults is empty and no productDetails (or not model search)
              <p>No results found for your query.</p>
            )}

            {/* Handle unexpected data format */}
            {!Array.isArray(searchResults) && searchResults !== null && (
              <p>
                The search results are not in the expected array format.
                Displaying raw data:{" "}
                <pre>{JSON.stringify(searchResults, null, 2)}</pre>
              </p>
            )}
          </div>{" "}
          {/* End search-results-table-container */}
        </div> /* End search-results-section */
      )}

      {/* --- Initial State / No Results Message --- */}
      {/* Show initial message only if not loading, no error, and no results/details are displayed */}
      {!isLoading && !error && !showResultsSection && (
        <div className="search-feedback">
          <p>
            {query
              ? "Click Search to find results."
              : "Enter search criteria and click Search."}
          </p>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
