import React, { useState } from "react";
import Profile from "./Screen/Profile";
import Home from "./Screen/Home";
import Navbar from "./Components/Navbar"; // Import the new component
import Rides from "./Screen/Rides";

const App = () => {
  const [isActiveScreen, setIsActiveScreen] = useState("Home");

  return (
    <div className="relative min-h-screen bg-[#0b0f1a]">
      {/* Content Area */}
      <main className="pb-28">
        {" "}
        {/* Padding bottom to ensure content isn't hidden by navbar */}
        {isActiveScreen === "Home" && (
          <Home setIsActiveScreen={setIsActiveScreen} />
        )}
        {isActiveScreen === "Profile" && (
          <Profile setIsActiveScreen={setIsActiveScreen} />
        )}
        {/* You can add placeholder screens for the others */}
        {isActiveScreen === "Rides" && (
          <Rides setIsActiveScreen={setIsActiveScreen} />
        )}
        {isActiveScreen === "History" && (
          <div className="p-20 text-white">History Screen</div>
        )}
      </main>

      {/* Floating Navigation */}
      <Navbar
        activeScreen={isActiveScreen}
        setIsActiveScreen={setIsActiveScreen}
      />
    </div>
  );
};

export default App;
