import React from "react";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import Balances from "./Balances";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Personal Ledger</h1>
          <p className="text-slate-500">
            Manage your income and expenses in one place
          </p>
        </header>
        <Balances />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Form */}
          <div className="lg:col-span-4 sticky top-8">
            <TransactionForm />
          </div>

          {/* Right Side: List */}
          <div className="lg:col-span-8">
            <TransactionList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
