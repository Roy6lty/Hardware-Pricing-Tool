// /home/olowoleru/projects/Inventory_tool/inventory_frontend/front/src/components/ui/Search.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [searchMode, setSearchMode] = useState("model");
  const [searchResults, setSearchResults] = useState(null); // This will now hold the product_component array for model search, or the list of parts for partnumber search
  const [productDetails, setProductDetails] = useState(null); // NEW state for product details (used only in model search)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModelItems, setSelectedModelItems] = useState([]);
  const navigate = useNavigate();

  const countries = [
    { code: "USA", name: "United States" },
    { code: "CAN", name: "Canada" },
    { code: "GBR", name: "United Kingdom" },
  ];

  const regionsByCountry = {
    USA: [
      { code: "CA", name: "California" },
      { code: "NY", name: "New York" },
      { code: "TX", name: "Texas" },
    ],
    CAN: [
      { code: "ON", name: "Ontario" },
      { code: "QC", name: "Quebec" },
    ],
    GBR: [
      { code: "ENG", name: "England" },
      { code: "SCT", name: "Scotland" },
    ],
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    setSelectedCountry(countryCode);
    setSelectedRegion("");
  };

  const handleRegionChange = (event) => {
    const newRegion = event.target.value;
    setSelectedRegion(newRegion);
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
    currentCountry,
    currentRegion
  ) => {
    const trimmedQuery = currentQuery.trim();
    if (!trimmedQuery) {
      setSearchResults(null);
      setProductDetails(null); // Clear details
      setError("Please enter a part number to search.");
      setIsLoading(false);
      return;
    }
    setSelectedModelItems([]); // Clear selected items for model search
    const endpoint = `http://134.209.22.147/:8005/part-number?query=${encodeURIComponent(
      trimmedQuery
    )}&country=${encodeURIComponent(
      currentCountry || ""
    )}&region=${encodeURIComponent(currentRegion || "")}`;
    fetchData(endpoint, "part number data");
  };

  const fetchModelData = async (
    currentQuery,
    currentCountry,
    currentRegion
  ) => {
    const trimmedQuery = currentQuery.trim();
    if (!trimmedQuery) {
      setSearchResults(null);
      setProductDetails(null); // Clear details
      setError("Please enter a model to search.");
      setIsLoading(false);
      return;
    }
    setSelectedModelItems([]); // Clear selected items for model search
    const endpoint = `http://134.209.22.147/:8005/model?query=${encodeURIComponent(
      trimmedQuery
    )}&country=${encodeURIComponent(
      currentCountry || ""
    )}&region=${encodeURIComponent(currentRegion || "")}`;
    fetchData(endpoint, "model data");
  };

  const handleSetSearchMode = (newMode) => {
    setSearchMode(newMode);
    setError(null);
    setSearchResults(null);
    setProductDetails(null); // Clear product details when changing mode
    setIsLoading(false);
    setSelectedModelItems([]); // Clear selected items
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
      fetchPartNumberData(trimmedQuery, selectedCountry, selectedRegion);
    } else if (searchMode === "model") {
      fetchModelData(trimmedQuery, selectedCountry, selectedRegion);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const getCountryName = (code) => {
    if (!code) return "All";
    const country = countries.find((c) => c.code === code);
    return country ? country.name : code;
  };

  const getRegionName = (countryCode, regionCode) => {
    if (!regionCode) return "All";
    if (!countryCode || !regionsByCountry[countryCode]) return regionCode;
    const region = regionsByCountry[countryCode].find(
      (r) => r.code === regionCode
    );
    return region ? region.name : regionCode;
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
      const endpoint = "http://134.209.22.147/:8005/part-number/multiple";
      const postData = {
        part_numbers: selectedModelItems.map((item) => item.part_number),
        country: selectedCountry || "",
        region: selectedRegion || "",
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
        <select
          className="filter-dropdown country-dropdown"
          value={selectedCountry}
          onChange={handleCountryChange}
        >
          <option value="">Select Country (All)</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        <select
          className="filter-dropdown region-dropdown"
          value={selectedRegion}
          onChange={handleRegionChange}
          disabled={
            !selectedCountry || !regionsByCountry[selectedCountry]?.length
          }
        >
          <option value="">Select Region (All)</option>
          {selectedCountry &&
            regionsByCountry[selectedCountry]?.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
        </select>
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
