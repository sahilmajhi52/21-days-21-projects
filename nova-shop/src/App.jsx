import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Screens/Home";
import Pdp from "./Screens/Pdp";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Pdp />} />
      </Routes>
    </>
  );
}

export default App;
