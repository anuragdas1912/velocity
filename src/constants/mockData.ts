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
}

// Clean Slate: Zero-state database
export const MOCK_TRANSACTIONS: Transaction[] = [];

export const getCommercialTransactions = () => {
  return MOCK_TRANSACTIONS.filter((tx) => !tx.isP2P);
};

export const getP2PTransactions = () => {
  return MOCK_TRANSACTIONS.filter((tx) => tx.isP2P);
};

export const ACCOUNT_LIQUIDITY = 0; 
export const DAILY_SPEND_TARGET = 3500; 
export const CURRENT_DAILY_SPEND = 0; 

export const MILESTONES: any[] = [];

export const getTimelineDistribution = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => {
    return {
      day,
      amount: 0,
      frequency: 0, 
      surcharge: 0, 
    };
  });
};
