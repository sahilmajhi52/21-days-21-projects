import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import RestaurantDetails from "./screens/RestaurantDetails";
import Cart from "./screens/Cart";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/res/:id" element={<RestaurantDetails />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
};

export default App;
