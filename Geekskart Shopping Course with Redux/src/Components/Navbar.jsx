import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, GraduationCap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
        <GraduationCap size={28} />
        <span>GeeksCart</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-8 font-medium text-gray-600">
        <Link to="/wishlist" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Heart size={20} />
          <span>Wishlist</span>
        </Link>

        <Link to="/cart" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ShoppingCart size={20} />
          <span>Cart</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;