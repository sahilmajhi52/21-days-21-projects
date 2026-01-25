import { create } from "zustand";
import { v6 as uuidv6 } from "uuid";

export const useLedgerStore = create((set) => ({
  transactions: [],
  addTransactions: (transaction) => {
    set((state) => ({
      transactions: [
        {
          ...transaction,
          date: Date.now(),
          id: uuidv6(),
        },
        ...state.transactions,
      ],
    }));
  },
  deleteTransactions: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((data) => data.id !== id),
    }));
  },
}));

// Transactions = [] ->
// {
// Date
// Id
// TRansctionType = income|expense  //ce
// Description // c
// amount // c
// }
