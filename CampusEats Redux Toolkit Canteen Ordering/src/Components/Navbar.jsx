import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, UtensilsCrossed } from "lucide-react"; // Optional: for icons
import { useSelector } from "react-redux";

const Navbar = () => {
  const cartData = useSelector((store) => store.app.cart);
  const cartItems = Object.values(cartData);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-orange-500" />
            <Link
              to="/"
              className="text-2xl font-bold text-gray-800 tracking-tight"
            >
              Food<span className="text-orange-500">Geeky</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:bg-orange-50 rounded-full transition-all"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
