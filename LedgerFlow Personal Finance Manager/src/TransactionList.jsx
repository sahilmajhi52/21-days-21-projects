import React from "react";
import { useLedgerStore } from "./Store";
import { Trash2, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";

const TransactionList = () => {
  const allTransactions = useLedgerStore((store) => store.transactions);
  const deleteTransactions = useLedgerStore((store) => store.deleteTransactions);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          Recent Transactions
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {allTransactions.length} Total
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
        {allTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No transactions recorded yet.</p>
          </div>
        ) : (
          allTransactions.map((data) => {
            const { date, description, type, amount, id } = data;
            const isIncome = type === "Income";

            return (
              <div key={id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isIncome ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                    {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 capitalize">{description}</p>
                    <p className="text-xs text-slate-500">{date || "Today"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className={`font-bold text-lg ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                    {isIncome ? "+" : "-"}${amount}
                  </p>
                  <button
                    onClick={() => deleteTransactions(id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionList;