import React, { useState } from "react";
import { useLedgerStore } from "./Store";
import { ArrowUpCircle, ArrowDownCircle, Scale, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const Balances = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const allTransactions = useLedgerStore((store) => store.transactions);

  let totalIncome = 0;
  let totalExpense = 0;

  allTransactions.forEach((data) => {
    if (data.type === "Income") {
      totalIncome += Number(data.amount);
    } else {
      totalExpense += Number(data.amount);
    }
  });

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const data = [
    { name: "Income", amount: totalIncome },
    { name: "Expense", amount: totalExpense },
  ];

  // Colors matching the UI theme: Emerald-500 and Rose-500
  const COLORS = ["#10b981", "#f43f5e"];
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Scale className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Balance</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">${totalBalance.toLocaleString()}</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ArrowUpCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Income</span>
        </div>
        <h2 className="text-3xl font-bold text-emerald-600 tracking-tight">+${totalIncome.toLocaleString()}</h2>
      </div>

   
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-rose-50 rounded-lg">
            <ArrowDownCircle className="w-6 h-6 text-rose-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Expense</span>
        </div>
        <h2 className="text-3xl font-bold text-rose-600 tracking-tight">-${totalExpense.toLocaleString()}</h2>
      </div>

      {/* 4. Chart Section (Spans across all columns on desktop) */}
      <div className="md:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-4">
          <PieIcon className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800">Income vs Expense Ratio</h3>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                data={data}
                dataKey="amount" 
                innerRadius={60} 
                outerRadius={100}
                paddingAngle={5}
                onMouseEnter={onPieEnter}
                onMouseLeave={() => setActiveIndex(-1)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Balances;