import React from "react";
import EditProfile from "../Components/EditProfile";
import AddWalletBalance from "../Components/AddWalletBalance";
import { ChevronLeft, Settings } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 font-sans selection:bg-blue-500/30 pb-12">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Unified Top Navigation */}
        <div className="flex items-center justify-between p-6">
          <button className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-md text-slate-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Account</h1>
          <button className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-md text-slate-400 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>

        <EditProfile />
        <div className="-mt-6"> {/* Slight overlap for visual flow */}
          <AddWalletBalance />
        </div>
      </div>
    </div>
  );
};

export default Profile;