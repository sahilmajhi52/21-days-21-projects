import React from "react";
import { Home, User, MapPin, History } from "lucide-react";

const Navbar = ({ activeScreen, setIsActiveScreen }) => {
  const tabs = [
    { id: "Home", icon: <Home size={22} />, label: "Home" },
    { id: "Rides", icon: <MapPin size={22} />, label: "Rides" },
    { id: "Profile", icon: <User size={22} />, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
      <div className="max-w-md mx-auto bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setIsActiveScreen(tab.id)}
                className={`relative flex flex-col items-center justify-center py-3 px-5 rounded-2xl transition-all duration-300 ${
                  isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/10 rounded-2xl animate-pulse" />
                )}
                
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? "-translate-y-1 scale-110" : ""}`}>
                  {tab.icon}
                </div>
                
                <span className={`text-[10px] font-bold mt-1 tracking-wider transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 h-0"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;