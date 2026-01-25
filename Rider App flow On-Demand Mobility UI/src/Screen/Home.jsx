import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTrip } from "../store/AppSlice";
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

const Home = ({ setIsActiveScreen }) => {
  const dispatch = useDispatch();
  const savedLocations = useSelector((store) => store.app.savedLocations);
  const [currentTrip, setCurrentTrip2] = useState({
    pickup: "",
    drop: "",
  });

  const handleConfirmTrip = () => {
    if (
      currentTrip.pickup.trim().length === 0 ||
      currentTrip.drop.trim().length === 0
    ) {
      return;
    }
    dispatch(setCurrentTrip(currentTrip));
    setIsActiveScreen("Rides");
  };

  return (
    <div className="px-5 pt-8 animate-in fade-in duration-500">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Where to{" "}
          <span className="text-blue-500 underline decoration-blue-500/30">
            next?
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Your ride is just a tap away.
        </p>
      </div>

      {/* Booking Card */}
      <div className="bg-[#161b2c]/80 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* The Route Connector Visual */}
        <div className="absolute left-10 top-[76px] bottom-[115px] w-0.5 bg-gradient-to-b from-blue-500 via-slate-700 to-indigo-500" />

        <div className="space-y-6">
          {/* Pickup Input */}
          <div className="relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
            <div className="ml-12">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                Pickup Location
              </label>
              <input
                type="text"
                placeholder="Current location"
                className="w-full bg-transparent border-b border-slate-800 py-2 focus:border-blue-500 outline-none transition-all text-white font-medium placeholder:text-slate-600"
                value={currentTrip.pickup}
                onChange={(e) =>
                  setCurrentTrip2({ ...currentTrip, pickup: e.target.value })
                }
              />
            </div>
          </div>

          {/* Drop Input */}
          <div className="relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <MapPin size={16} className="text-indigo-500" />
            </div>
            <div className="ml-12">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where are we going?"
                className="w-full bg-transparent border-b border-slate-800 py-2 focus:border-indigo-500 outline-none transition-all text-white font-medium placeholder:text-slate-600"
                value={currentTrip.drop}
                onChange={(e) =>
                  setCurrentTrip2({ ...currentTrip, drop: e.target.value })
                }
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmTrip}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-lg shadow-blue-900/40"
          >
            Find a Ride <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Saved Locations Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Star size={14} className="text-yellow-500 fill-yellow-500" /> Saved
            Places
          </h3>
          <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {savedLocations.map((address, index) => (
            <div
              key={index}
              onClick={() => setCurrentTrip2({ ...currentTrip, drop: address })}
              className="group flex items-center gap-4 p-4 bg-slate-800/20 border border-white/5 rounded-2xl hover:bg-slate-800/40 hover:border-blue-500/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-colors">
                <Clock size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {address}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  Recent Destination
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 group-hover:text-blue-500">
                <Navigation size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
