import React from "react";
import Home from "./Screens/Home";
import Pdp from "./Screens/Pdp";
import { Route, Routes } from "react-router-dom";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<Pdp />} />
    </Routes>
  );
};

export default App;