// SelectedPartsPage.jsx
import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "./SearchBar.css"; // Assuming you want to reuse the CSS

const SelectedPartsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedItemsString = queryParams.get("items");
  let selectedItems = [];

  if (selectedItemsString) {
    try {
      selectedItems = JSON.parse(decodeURIComponent(selectedItemsString));
    } catch (e) {
      console.error("Error parsing selected items:", e);
      return <p>Error: Could not load selected items.</p>; // Error handling
    }
  }

  if (!selectedItems || selectedItems.length === 0) {
    return <p>No items selected.</p>;
  }

  return (
    // Add a style to this div for the top margin
    <div className="search-results-section" style={{ marginTop: "180px" }}>
      <div className="search-results-table-container">
        <h4>Selected Parts</h4>
        <div className="table-responsive-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Part Number</th> {/* Updated column header */}
                <th>Description</th>
                <th>Company</th> {/* Updated column header */}
                <th>Country</th> {/* Updated column header */}
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
                  <td>{item.company}</td>
                  <td>{item.country}</td>
                  <td>{item.condition}</td>
                  <td>{item.price}</td>
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
