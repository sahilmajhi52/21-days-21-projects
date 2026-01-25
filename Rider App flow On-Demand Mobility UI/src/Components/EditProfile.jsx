import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../store/AppSlice";
import { User, Mail, Phone, Camera, Save, X, Edit3, Star, Car } from "lucide-react";

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const { name, email, phoneNumber } = useSelector((store) => store.app.userData);
  const [currentData, setCurrentData] = useState({ name, email, phoneNumber });

  const handleUpdate = () => {
    if (currentData.name.trim() && currentData.email.trim()) {
      dispatch(setUserData(currentData));
      setIsEditing(false);
    }
  };

  return (
    <div className="px-5 mb-8">
      <div className="relative bg-[#161b2c]/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
        
        {/* Header Action */}
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-blue-400 transition-colors"
        >
          {isEditing ? <X size={20} /> : <Edit3 size={20} />}
        </button>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0b0f1a] rounded-[1.9rem] flex items-center justify-center overflow-hidden">
                <User size={40} className="text-blue-400" />
              </div>
            </div>
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-xl border-4 border-[#161b2c] text-white">
                <Camera size={14} />
              </div>
            )}
          </div>
          
          <h2 className="mt-4 text-xl font-bold text-white tracking-tight">{name}</h2>
          
          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-semibold text-slate-400">
              <Car size={12} className="text-blue-500" /> 47 Rides
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[11px] font-semibold text-slate-400">
              <Star size={12} className="text-yellow-500 fill-yellow-500" /> 4.5
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="mt-8 space-y-4">
          {!isEditing ? (
            <div className="space-y-3">
              <InfoRow icon={<Mail size={16}/>} label="Email" value={email} />
              <InfoRow icon={<Phone size={16}/>} label="Mobile" value={phoneNumber} />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <InputField label="Full Name" value={currentData.name} onChange={(val) => setCurrentData({...currentData, name: val})} />
              <InputField label="Email Address" value={currentData.email} onChange={(val) => setCurrentData({...currentData, email: val})} />
              <InputField label="Phone Number" value={currentData.phoneNumber} onChange={(val) => setCurrentData({...currentData, phoneNumber: val})} />
              <button 
                onClick={handleUpdate}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
    <div className="text-blue-500/70">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-widest">{label}</label>
    <input 
      className="w-full bg-slate-900/50 border border-slate-700/50 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default EditProfile;