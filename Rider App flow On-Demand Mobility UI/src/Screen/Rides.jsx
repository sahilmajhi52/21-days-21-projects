import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTrip } from "../store/AppSlice";
import {
  ChevronLeft,
  Bike,
  Car,
  Navigation2,
  Clock,
  ShieldCheck,
  MapPin,
  User,
  Star,
  Phone,
} from "lucide-react";

const RidesOption = [
  {
    id: "Bike",
    icon: <Bike size={24} />,
    desc: "Fastest for traffic",
    base: 15,
  },
  {
    id: "Auto",
    icon: <Navigation2 size={24} />,
    desc: "Eco-friendly & open",
    base: 35,
  },
  { id: "Car", icon: <Car size={24} />, desc: "Comfortable sedans", base: 60 },
];

const Rides = ({ setIsActiveScreen }) => {
  const dispatch = useDispatch();
  const currentTrip = useSelector((store) => store.app.currentTrip);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const handleSelectRide = (option) => {
    setSelectedRide(option);
    // Simulate booking process
    setTimeout(() => {
      setIsBookingConfirmed(true);
      dispatch(setCurrentTrip({ ...currentTrip, selectedMode: option }));
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-slate-200 overflow-hidden">
      {/* 1. SIMULATED MAP BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]" />
        {/* Faux Route Line */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 100 200 Q 200 400 300 600"
            stroke="#3b82f6"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="8 8"
            className="animate-[dash_20s_linear_infinite]"
          />
        </svg>
      </div>

      {/* 2. TOP NAV OVERLAY */}
      <div className="relative z-20 p-6 flex items-center gap-4 bg-gradient-to-b from-[#0b0f1a] to-transparent">
        <button
          onClick={() => setIsActiveScreen("Home")}
          className="p-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
              {currentTrip.pickup}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
              {currentTrip.drop}
            </p>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM PANEL */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-10">
        {!isBookingConfirmed ? (
          /* RIDE SELECTION DRAWER */
          <div className="bg-[#161b2c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black mb-4">Choose a ride</h3>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {RidesOption.map((option, idx) => {
                const price = Math.floor(option.base * (idx + 1.2));
                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectRide(option.id)}
                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedRide === option.id
                        ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/40 scale-[1.02]"
                        : "bg-slate-900/50 border-white/5 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          selectedRide === option.id
                            ? "bg-white/20"
                            : "bg-slate-800 text-blue-400"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <p
                          className={`font-bold ${
                            selectedRide === option.id
                              ? "text-white"
                              : "text-slate-200"
                          }`}
                        >
                          {option.id}
                        </p>
                        <p
                          className={`text-[10px] ${
                            selectedRide === option.id
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {option.desc}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black ${
                          selectedRide === option.id
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        ${price}
                      </p>
                      <p
                        className={`text-[10px] flex items-center gap-1 ${
                          selectedRide === option.id
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        <Clock size={10} /> 3 min
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ShieldCheck size={16} className="text-blue-400" />
              <p className="text-[10px] font-bold text-blue-300 uppercase">
                Top rated drivers nearby
              </p>
            </div>
          </div>
        ) : (
          /* DRIVER COMING STATUS */
          <div className="bg-[#161b2c]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">
                  Driver is coming
                </p>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  KA 01 MG 2024
                </h2>
                <p className="text-slate-500 text-xs font-bold mt-1">
                  White Toyota Camry
                </p>
              </div>
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/40 text-white animate-bounce">
                <Navigation2 size={24} />
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full mb-6" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <User size={30} className="text-slate-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-[10px] font-black text-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    4.9 <Star size={8} fill="black" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    Alexander Pierce
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    Gold Tier Driver
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-4 bg-slate-800 rounded-2xl text-white hover:bg-slate-700 transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 transition-colors">
                  <p className="text-xs font-black">Message</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rides;
