import React, { useState } from "react";
import { useLedgerStore } from "./Store";
import { PlusCircle, Wallet, Tag } from "lucide-react";

const TransactionForm = () => {
  const addTransactions = useLedgerStore((state) => state.addTransactions);
  const [currTrans, setCurrentTrans] = useState({
    description: "",
    amount: "",
    type: "Income",
  });

  function handleAddTransaction() {
    if (currTrans.description.trim().length === 0 || currTrans.amount <= 0)
      return;

    addTransactions({ ...currTrans, amount: parseFloat(currTrans.amount) });

    setCurrentTrans({
      description: "",
      amount: "",
      type: "Income",
    });
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Add Transaction
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Keep track of your cash flow
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Description Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Description
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            placeholder="e.g. Grocery Shopping"
            value={currTrans.description}
            onChange={(e) =>
              setCurrentTrans({ ...currTrans, description: e.target.value })
            }
            type="text"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            $ Amount
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            placeholder="0.00"
            value={currTrans.amount}
            onChange={(e) =>
              setCurrentTrans({ ...currTrans, amount: e.target.value })
            }
            type="number"
          />
        </div>

        {/* Type Selector (Radio Tabs) */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              currTrans.type === "Income"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <input
              className="hidden"
              checked={currTrans.type === "Income"}
              onChange={() => setCurrentTrans({ ...currTrans, type: "Income" })}
              type="radio"
              name="type"
            />
            <span className="font-medium">Income</span>
          </label>

          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              currTrans.type === "Expense"
                ? "bg-rose-50 border-rose-500 text-rose-700"
                : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <input
              className="hidden"
              checked={currTrans.type === "Expense"}
              onChange={() =>
                setCurrentTrans({ ...currTrans, type: "Expense" })
              }
              type="radio"
              name="type"
            />
            <span className="font-medium">Expense</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAddTransaction}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          Add Transaction
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
