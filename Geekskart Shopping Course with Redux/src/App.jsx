import React from "react";
import Home from "./Screen/Home";
import Course from "./Screen/Course";
import Cart from "./Screen/Cart";
import Wishlist from "./Screen/Wishlist";
import { Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/course/:id" element={<Course />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
};

export default App;
