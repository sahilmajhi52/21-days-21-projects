import React from "react";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Nova Shop
      </Link>
      <SearchBar />

      <div className="navbar-right">
        <div className="cart">
          🛒
          <span className="cart-text">Cart</span>
          <span className="cart-count">2</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;