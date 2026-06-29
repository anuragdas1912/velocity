import React, { createContext, useContext, useState, useMemo } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: 'quick_commerce' | 'food_delivery' | 'utilities' | 'p2p';
  timestamp: string;
  isP2P: boolean;
  type: 'credit' | 'debit';
  frequency: number;
  surcharge: number;
  incomeType?: 'personal' | 'business'; // For credit transactions
}

export interface Milestone {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

interface AppContextType {
  transactions: Transaction[];
  milestones: Milestone[];
  dailyLimit: number;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  editMilestone: (m: Milestone) => void;
  deleteMilestone: (id: string) => void;
  balance: number;
  todaySpend: number;
  personalIncome: number;
  businessIncome: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-populate with realistic starter entries so UI features (Chart, Rings, stats) activate immediately
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-starter-1',
      amount: 45000,
      merchant: 'Freelance Design Client (Business)',
      category: 'utilities',
      timestamp: new Date().toISOString(),
      isP2P: false,
      type: 'credit',
      frequency: 1,
      surcharge: 0,
      incomeType: 'business'
    },
    {
      id: 'tx-starter-2',
      amount: 5000,
      merchant: 'Family Cash Transfer (Personal)',
      category: 'utilities',
      timestamp: new Date().toISOString(),
      isP2P: false,
      type: 'credit',
      frequency: 1,
      surcharge: 0,
      incomeType: 'personal'
    },
    {
      id: 'tx-starter-3',
      amount: 450,
      merchant: 'Zepto Order',
      category: 'quick_commerce',
      timestamp: new Date().toISOString(),
      isP2P: false,
      type: 'debit',
      frequency: 3,
      surcharge: 5
    },
    {
      id: 'tx-starter-4',
      amount: 820,
      merchant: 'Zomato Dining',
      category: 'food_delivery',
      timestamp: new Date().toISOString(),
      isP2P: false,
      type: 'debit',
      frequency: 2,
      surcharge: 10
    },
    {
      id: 'tx-starter-5',
      amount: 349,
      merchant: 'Airtel Bill Recharge',
      category: 'utilities',
      timestamp: new Date().toISOString(),
      isP2P: false,
      type: 'debit',
      frequency: 1,
      surcharge: 0
    }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm-starter-1', name: 'Porsche 911 Fund', target: 5000000, current: 35000, color: '#FFFFFF' },
    { id: 'm-starter-2', name: 'Alps Chalet Lease', target: 1200000, current: 12500, color: '#94A3B8' }
  ]);

  // AI-Driven Dynamic Daily Limit (Average Daily Outflow + 25% Optimal Safety Buffer)
  const dailyLimit = useMemo(() => {
    const debits = transactions.filter((t) => t.type === 'debit' && !t.isP2P);
    if (debits.length === 0) return 3500; // Baseline fallback limit

    // Count unique days in transaction history
    const uniqueDays = Array.from(new Set(debits.map((t) => t.timestamp.split('T')[0])));
    const totalDays = uniqueDays.length || 1;
    const totalSpend = debits.reduce((sum, t) => sum + t.amount, 0);
    const average = totalSpend / totalDays;

    // Estimated optimal limit rounded to nearest 100
    return Math.max(1500, Math.round((average * 1.25) / 100) * 100);
  }, [transactions]);

  const balance = useMemo(() => {
    return transactions.reduce((sum, tx) => {
      if (tx.type === 'credit') return sum + tx.amount;
      return sum - tx.amount;
    }, 0);
  }, [transactions]);

  const personalIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'credit' && tx.incomeType === 'personal')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const businessIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'credit' && tx.incomeType === 'business')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const todaySpend = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions
      .filter((tx) => {
        const txDate = tx.timestamp.split('T')[0];
        return txDate === todayStr && tx.type === 'debit' && !tx.isP2P;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    setTransactions((prev) => [
      { ...newTx, id } as Transaction,
      ...prev
    ]);
  };

  const editTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addMilestone = (newM: Omit<Milestone, 'id'>) => {
    const id = `m-${Date.now()}`;
    setMilestones((prev) => [
      { ...newM, id } as Milestone,
      ...prev
    ]);
  };

  const editMilestone = (updatedM: Milestone) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === updatedM.id ? updatedM : m))
    );
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        milestones,
        dailyLimit,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addMilestone,
        editMilestone,
        deleteMilestone,
        balance,
        todaySpend,
        personalIncome,
        businessIncome,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
