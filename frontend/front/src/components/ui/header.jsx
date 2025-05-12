// src/components/ui/header.jsx
import React from "react";
import "./Header.css"; // Path is correct

function HomePageHeader() {
  return (
    // Use <nav> for a navigation bar and update className
    <nav className="app-navbar">
      <div>
        <h1>Hardware Pricing Tool</h1>
        <h2 className="secondary-header">
          Get hardware validation base on product models and part number
        </h2>
      </div>
    </nav>
  );
}

export default HomePageHeader;
