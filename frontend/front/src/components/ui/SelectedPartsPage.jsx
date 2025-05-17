// SelectedPartsPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "./SearchBar.css"; // Assuming you want to reuse the CSS

const SelectedPartsPage = () => {
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let dataKey = params.get("dataKey"); // Get the key

    // Trim whitespace from the key to ensure an exact match
    if (dataKey) dataKey = dataKey.trim();

    if (dataKey) {
      try {
        let attempt = 0;
        const maxAttempts = 5;
        const retryDelay = 100; // milliseconds
        const tryToGetData = () => {
          attempt++;
          const storedDataString = sessionStorage.getItem(dataKey);

          if (storedDataString) {
            setSelectedItems(JSON.parse(storedDataString));
            // sessionStorage.removeItem(dataKey); // Removed cleanup to persist data in sessionStorage
            setIsLoading(false);
          } else if (attempt < maxAttempts) {
            setTimeout(tryToGetData, retryDelay);
          } else {
            setError(
              "Data not found after multiple attempts. It might have expired or been cleared."
            );
            setIsLoading(false);
          }
        };

        tryToGetData();
      } catch (e) {
        console.error(
          "Error retrieving or parsing data from sessionStorage:",
          e
        );
        setError("Failed to load part details due to a data error.");
        setIsLoading(false);
      }
    } else {
      setError("No data key provided to load part details.");
      setIsLoading(false);
    }
    // setIsLoading(false); // Moved inside the logic to handle async retries
  }, [location.search]); // Re-run if location.search changes (though typically not for this page load)

  if (isLoading) {
    return (
      <div
        className="search-feedback loading-message"
        style={{ marginTop: "180px" }}
      >
        Loading selected parts...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="search-feedback error-message"
        style={{ marginTop: "180px" }}
      >
        Error: {error}
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return <p style={{ marginTop: "180px" }}>No items to display.</p>;
  }

  return (
    <div className="search-results-section" style={{ marginTop: "180px" }}>
      <div className="search-results-table-container">
        <h4>Selected Parts</h4>
        <div className="table-responsive-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Part Number</th> {/* Updated column header */}
                <th>Description</th>
                <th>Tech Courier/Company</th> <th>Country</th>{" "}
                {/* Updated column header */}
                <th>Condition</th> {/* Updated column header */}
                <th>Price</th> {/* Updated column header */}
                <th>Manufacturer</th> {/* Updated column header */}
                <th>Quantity</th> {/* Updated column header */}
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={`${item.part_number || "unknown"}-${index}`}>
                  {" "}
                  {/* Use part_number for key */}
                  <td>{item.part_number}</td>
                  <td>{item.description}</td>
                  <td>{item.tech_courier}</td> {/* Display tech_courier */}
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
      </div>
    </div>
  );
};

export default SelectedPartsPage;
