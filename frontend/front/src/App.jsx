import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import HomePageHeader from "./components/ui/header";
import SearchBar from "./components/ui/Search";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom"; // Import Router components
import SelectedPartsPage from "./components/ui/SelectedPartsPage"; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<LayoutWithHeader />}>
          <Route index element={<SearchBar />} />{" "}
          {/* 'index' for the default route */}
          <Route path="selected-parts" element={<SelectedPartsPage />} />
          {/* Add other routes here within the LayoutWithHeader */}
        </Route>
        {/* Routes outside the layout (if any) would go here */}
      </Routes>
    </Router>
  );
}

// Layout component to include the header
function LayoutWithHeader() {
  return (
    <>
      <HomePageHeader />
      <Outlet /> {/* Outlet renders the child route's component */}
    </>
  );
}

export default App;
