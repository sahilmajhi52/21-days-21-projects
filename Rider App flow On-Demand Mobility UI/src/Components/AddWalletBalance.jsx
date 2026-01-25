import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addWalletBalance as walletReducer } from "../store/AppSlice";
import { Wallet, Plus, CreditCard, ArrowRight, X } from "lucide-react";

const balanceArray = [25, 50, 100, 500];

const AddWalletBalance = () => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [amountToBeadded, setAmountTobeAdded] = useState(0);
  const walletBalance = useSelector((store) => store.app.walletBalance);

  const handleBalanceAdd = () => {
    if (amountToBeadded > 0) {
      dispatch(walletReducer(Number(amountToBeadded)));
      setIsAdding(false);
      setAmountTobeAdded(0);
    }
  };

  return (
    <div className="px-5">
      <div className="bg-[#161b2c]/80 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Available Balance
              </p>
              <h3 className="text-2xl font-black text-white">
                ${walletBalance.toLocaleString()}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`p-3 rounded-2xl transition-all ${
              isAdding
                ? "bg-slate-700 text-white"
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            }`}
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {isAdding && (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-2">
              {balanceArray.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmountTobeAdded(amt)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    amountToBeadded === amt
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <CreditCard size={18} />
              </div>
              <input
                type="number"
                placeholder="Custom amount..."
                className="w-full bg-slate-900/50 border border-slate-700/50 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500 outline-none transition-all text-sm"
                value={amountToBeadded || ""}
                onChange={(e) => setAmountTobeAdded(e.target.value)}
              />
            </div>

            <button
              onClick={handleBalanceAdd}
              className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95"
            >
              Confirm Deposit <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWalletBalance;
