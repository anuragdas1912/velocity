import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cpu, 
  ArrowLeftRight, 
  Target as TargetIcon, 
  ChevronDown, 
  ChevronUp,
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Sparkles, 
  Activity, 
  TrendingDown, 
  RefreshCw,
  Zap,
  Flame,
  ShoppingBag,
  Sliders,
  DollarSign,
  Compass
} from 'lucide-react';
import { useAppContext, Transaction, Milestone } from './context/AppContext';
import { AmbientBackground } from './components/AmbientBackground';
import { GlassCard } from './components/GlassCard';
import { MatrixSphere } from './components/MatrixSphere';
import { QuantumChart } from './components/QuantumChart';
import { TargetTorus } from './components/TargetTorus';
import { AppTabs } from './components/AppTabs';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quantum' | 'target'>('dashboard');
  const [booting, setBooting] = useState(true);
  const [bootFade, setBootFade] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  // Clock Update simulation
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence simulation
  useEffect(() => {
    const fadeTimer = setTimeout(() => setBootFade(true), 2100);
    const stopTimer = setTimeout(() => setBooting(false), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(stopTimer);
    };
  }, []);

  if (booting) {
    return (
      <div className={`boot-screen transition-opacity duration-500 ${bootFade ? 'opacity-0' : 'opacity-100'}`}>
        <div className="boot-logo-container">
          <img src="/logo.png" alt="Velocity Logo" className="boot-logo-img" />
          <h1 className="boot-title">Velocity</h1>
          <div className="boot-divider" />
          <p className="boot-subtitle">Budget Tracker</p>
        </div>
        
        <div className="boot-loader-container">
          <div className="boot-spinner" />
          <span className="boot-loader-text">Securing Local State</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="app-container overflow-hidden flex flex-col"
      style={{ position: 'fixed', inset: 0, height: '100dvh' }}
    >
      <AmbientBackground />
      
      {/* Top Header */}
      <header 
        className="px-5 flex justify-between items-center z-10 select-none"
        style={{ height: '60px', marginTop: 'env(safe-area-inset-top, 10px)' }}
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
          <span className="text-xs font-black tracking-[0.25em] font-outfit text-white uppercase">
            Velocity
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Digital System Clock */}
          <span className="text-[10px] font-bold text-zinc-500 tracking-wider font-mono bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
            {timeStr}
          </span>
          <button 
            onClick={() => {
              if (window.confirm("App data reset kerna chahte hain?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="p-2 rounded-full border border-white/5 bg-white/5 active:scale-95 transition-transform"
          >
            <RefreshCw size={11} className="text-zinc-500 hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Workspace Gutter padding */}
      <main className="flex-1 ios-scrollable px-4.5 pb-[130px] z-10 w-full">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'quantum' && <QuantumView />}
        {activeTab === 'target' && <TargetView />}
      </main>

      {/* Navigation Tab Bar */}
      <AppTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

/* ==========================================
   WORKSPACE 1: DASHBOARD VIEW
   ========================================== */
function DashboardView() {
  const { 
    balance, 
    todaySpend, 
    dailyLimit, 
    addTransaction,
    personalIncome,
    businessIncome,
    transactions
  } = useAppContext();

  const [quickInput, setQuickInput] = useState('');
  const [showParser, setShowParser] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  const proximityToTarget = todaySpend / dailyLimit;

  // AI Metric 1: Financial Health Index
  const healthIndex = useMemo(() => {
    if (transactions.length === 0) return 100;
    return Math.max(10, Math.round(100 - (todaySpend / dailyLimit) * 60));
  }, [todaySpend, dailyLimit, transactions]);

  // AI Metric 2: Outflow Predictor
  const predictedOutflow = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit' && !t.isP2P);
    if (debits.length === 0) return 0;
    
    const uniqueDays = Array.from(new Set(debits.map(t => t.timestamp.split('T')[0])));
    const totalDays = uniqueDays.length || 1;
    const totalSpend = debits.reduce((sum, t) => sum + t.amount, 0);
    const average = totalSpend / totalDays;
    
    return Math.round(average * 0.85 + todaySpend * 0.15);
  }, [transactions, todaySpend]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const text = quickInput.trim();
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (!amountMatch) {
      alert("Please enter an amount! (e.g. Swiggy 350)");
      return;
    }

    const parsedAmount = parseFloat(amountMatch[1]);
    const cleanMerchant = text.replace(amountMatch[0], '').trim();
    const finalMerchant = cleanMerchant || "Quick Expense";

    const lowerText = text.toLowerCase();
    let finalCategory: 'quick_commerce' | 'food_delivery' | 'utilities' | 'p2p' = 'p2p';
    let finalType: 'credit' | 'debit' = 'debit';
    let finalIncomeType: 'personal' | 'business' | undefined = undefined;

    if (lowerText.includes('swiggy') || lowerText.includes('zomato') || lowerText.includes('food') || lowerText.includes('dine') || lowerText.includes('lunch')) {
      finalCategory = 'food_delivery';
    } else if (lowerText.includes('zepto') || lowerText.includes('blinkit') || lowerText.includes('grocery') || lowerText.includes('instamart')) {
      finalCategory = 'quick_commerce';
    } else if (lowerText.includes('recharge') || lowerText.includes('bill') || lowerText.includes('netflix') || lowerText.includes('electricity') || lowerText.includes('rent') || lowerText.includes('utility') || lowerText.includes('cloud')) {
      finalCategory = 'utilities';
    }

    if (lowerText.includes('salary') || lowerText.includes('refund') || lowerText.includes('income') || lowerText.includes('credit') || lowerText.includes('freelance') || lowerText.includes('received')) {
      finalType = 'credit';
      finalCategory = 'utilities';
      if (lowerText.includes('business') || lowerText.includes('freelance') || lowerText.includes('work') || lowerText.includes('client')) {
        finalIncomeType = 'business';
      } else {
        finalIncomeType = 'personal';
      }
    }

    addTransaction({
      amount: parsedAmount,
      merchant: finalMerchant,
      category: finalCategory,
      timestamp: new Date().toISOString(),
      isP2P: finalCategory === 'p2p',
      type: finalType,
      frequency: 1,
      surcharge: 0,
      incomeType: finalIncomeType
    });

    setQuickInput('');
    setShowParser(false);
    
    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 800);
  };

  const quickChips = ["Swiggy 350", "Zepto 450", "Zomato 820", "Salary 50000 business", "Netflix 199", "Airtel 349"];

  return (
    <div className="flex flex-col gap-4 select-none w-full px-0.5">
      {/* Holographic Balance Card with sheen */}
      <GlassCard className="p-5 flex flex-col justify-between overflow-hidden relative metallic-sheen">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/5 rounded-full filter blur-xl pointer-events-none" />
        
        <div>
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase font-outfit">Liquidity Index</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tighter mt-1 font-outfit">
            ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
          <div>
            <span className="text-[8px] font-bold text-zinc-500 tracking-wider block uppercase">Personal Capital</span>
            <span className="text-[12px] font-extrabold text-teal-400 font-outfit">₹{personalIncome.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-zinc-500 tracking-wider block uppercase">Business Capital</span>
            <span className="text-[12px] font-extrabold text-indigo-400 font-outfit">₹{businessIncome.toLocaleString()}</span>
          </div>
        </div>
      </GlassCard>

      {/* 3D Interactive Canvas Orb */}
      <div className="flex flex-col items-center justify-center my-0.5 relative">
        <MatrixSphere proximityToTarget={proximityToTarget} />
        
        {/* Futuristic Floating Parser FAB */}
        <button 
          onClick={() => setShowParser(true)}
          className="absolute bottom-0 p-3.5 rounded-full bg-white hover:bg-zinc-200 text-black shadow-lg active:scale-95 transition-all z-20 flex justify-center items-center"
        >
          <Sparkles size={16} />
        </button>
      </div>

      {/* Today spend details */}
      <GlassCard className="p-4 flex justify-between items-center">
        <div>
          <span className="text-[8px] font-bold text-zinc-500 tracking-widest block uppercase">TODAY'S OUTFLOW</span>
          <span className="text-base font-extrabold text-white mt-0.5 block font-outfit">
            ₹{todaySpend.toLocaleString()}&nbsp;
            <span className="text-zinc-500 text-xs font-normal">/ ₹{dailyLimit.toLocaleString()}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-bold text-zinc-500 tracking-widest block uppercase">AI DAILY LIMIT</span>
          <span className="text-[9px] font-bold text-teal-400 bg-teal-400/10 px-2.5 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider font-outfit">
            Auto Estimated
          </span>
        </div>
      </GlassCard>

      {/* AI stats row */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase font-outfit">Health index</span>
            <Activity size={11} className="text-teal-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white font-outfit">{healthIndex}</span>
            <span className="text-[7px] font-bold text-zinc-500 tracking-wide block uppercase mt-0.5">Optimal spend feed</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase font-outfit">Outflow Predict</span>
            <TrendingDown size={11} className="text-indigo-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white font-outfit">₹{predictedOutflow.toLocaleString()}</span>
            <span className="text-[7px] font-bold text-zinc-500 tracking-wide block uppercase mt-0.5">Forecast tomorrow</span>
          </div>
        </GlassCard>
      </div>

      {/* Slide-Up AI Parser Overlay */}
      {showParser && (
        <div className="fixed inset-0 z-50 bg-[#030303]/85 backdrop-blur-md flex items-end justify-center px-4 pb-[84px]">
          <GlassCard className="w-full p-5 max-w-md border border-white/10 shadow-2xl relative animate-slide-in-bottom">
            <button 
              onClick={() => setShowParser(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5 mb-4 font-outfit">
              <Sparkles size={13} className="text-teal-400" /> AI Command Console
            </h3>

            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
              <input 
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="e.g. Swiggy 350 or Salary 80000 business"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-teal-400 transition-colors placeholder:text-zinc-600"
                autoFocus
              />
              
              {/* Quick Input Suggestions chips */}
              <div className="flex flex-wrap gap-1.5 my-1">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuickInput(chip)}
                    className="text-[8px] font-bold text-zinc-400 border border-white/5 bg-white/[0.02] px-2.5 py-1 rounded-lg hover:text-white hover:border-white/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-[10px] uppercase tracking-widest shadow-md transition-colors"
              >
                Execute Outflow
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Success alert flash */}
      {successPulse && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-teal-400 text-black text-[9px] font-extrabold tracking-widest px-6 py-3 rounded-full shadow-lg z-50 uppercase animate-bounce">
          Transaction Processed
        </div>
      )}
    </div>
  );
}

/* ==========================================
   WORKSPACE 2: QUANTUM VIEW (LEDGER)
   ========================================== */
function QuantumView() {
  const { transactions, deleteTransaction, editTransaction } = useAppContext();
  
  const [filterTab, setFilterTab] = useState<'debits' | 'credits' | 'combined'>('debits');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [p2pNeutral, setP2pNeutral] = useState(true);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Weekly data
  const chartData = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: daysOfWeek[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        amount: 0,
        frequency: 0,
        surcharge: 0
      };
    });

    transactions.forEach((tx) => {
      if (tx.type === 'debit' && (!p2pNeutral || !tx.isP2P)) {
        const txDate = tx.timestamp.split('T')[0];
        const chartDay = last7Days.find(d => d.dateStr === txDate);
        if (chartDay) {
          chartDay.amount += tx.amount;
          chartDay.frequency += 1;
          chartDay.surcharge += tx.surcharge;
        }
      }
    });

    return last7Days;
  }, [transactions, p2pNeutral]);

  // Filtered list
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (p2pNeutral && tx.isP2P) return false;
      if (filterTab === 'debits') return tx.type === 'debit';
      if (filterTab === 'credits') return tx.type === 'credit';
      return true;
    });
  }, [transactions, filterTab, p2pNeutral]);

  const handleEditClick = (tx: Transaction) => {
    setEditMerchant(tx.merchant);
    setEditAmount(tx.amount.toString());
    setIsEditing(true);
  };

  const handleSaveUpdate = (tx: Transaction) => {
    const amountVal = parseFloat(editAmount);
    if (!editMerchant || isNaN(amountVal)) {
      alert("Invalid Inputs!");
      return;
    }
    editTransaction({
      ...tx,
      merchant: editMerchant,
      amount: amountVal
    });
    setIsEditing(false);
    setExpandedId(null);
  };

  const getCategoryTheme = (category: string, type: string) => {
    if (type === 'credit') {
      return {
        icon: <DollarSign size={13} />,
        bg: 'bg-teal-500/10 border-teal-500/10 text-teal-400'
      };
    }
    switch (category) {
      case 'quick_commerce':
        return {
          icon: <ShoppingBag size={13} />,
          bg: 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400'
        };
      case 'food_delivery':
        return {
          icon: <Flame size={13} />,
          bg: 'bg-[#ff385c]/10 border-[#ff385c]/10 text-[#ff385c]'
        };
      case 'utilities':
        return {
          icon: <Zap size={13} />,
          bg: 'bg-indigo-500/10 border-indigo-500/10 text-indigo-400'
        };
      default:
        return {
          icon: <ShoppingBag size={13} />,
          bg: 'bg-zinc-500/10 border-zinc-500/10 text-zinc-400'
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none w-full px-0.5">
      <QuantumChart data={chartData} />

      <div className="flex flex-col gap-3">
        {/* Toggle P2P Shield */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-1.5 font-outfit">
            🛡️ Neutralize UPI Transfers
          </span>
          <button 
            onClick={() => setP2pNeutral(!p2pNeutral)}
            className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${
              p2pNeutral ? 'glass-switch-active' : 'glass-switch'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${
              p2pNeutral ? 'transform translate-x-4' : ''
            }`} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-0.5 bg-white/5 rounded-xl border border-white/5">
          {['debits', 'credits', 'combined'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilterTab(tab as any)}
              className={`flex-1 py-1.5 text-[9px] font-extrabold tracking-widest uppercase rounded-lg transition-colors font-outfit ${
                filterTab === tab ? 'bg-white/10 text-white shadow' : 'text-zinc-500'
              }`}
            >
              {tab === 'combined' ? 'All Flow' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2 mt-1">
        {filteredTxs.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">No flows logged</span>
          </div>
        ) : (
          filteredTxs.map((tx) => {
            const isExpanded = expandedId === tx.id;
            const isDebit = tx.type === 'debit';
            const theme = getCategoryTheme(tx.category, tx.type);
            
            return (
              <GlassCard key={tx.id} className="overflow-hidden border border-white/5">
                <div 
                  onClick={() => {
                    setExpandedId(isExpanded ? null : tx.id);
                    setIsEditing(false);
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Glowing Category Badge */}
                    <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border ${theme.bg}`}>
                      {theme.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-outfit">{tx.merchant}</h4>
                      <span className="text-[8px] font-bold text-zinc-500 tracking-wider block mt-0.5 uppercase">
                        {tx.timestamp.split('T')[0]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-outfit ${
                      isDebit ? 'text-[#ff385c]' : 'text-teal-400'
                    }`}>
                      {isDebit ? '-' : '+'}&nbsp;₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {isExpanded ? <ChevronUp size={11} className="text-zinc-600" /> : <ChevronDown size={11} className="text-zinc-600" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 bg-white/[0.01]">
                    {isEditing ? (
                      <div className="flex flex-col gap-3 mt-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            value={editMerchant}
                            onChange={(e) => setEditMerchant(e.target.value)}
                            placeholder="Merchant Name"
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-teal-400"
                          />
                          <input 
                            type="number" 
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Amount"
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white outline-none focus:border-teal-400"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-[8px] font-bold tracking-widest text-zinc-500 uppercase"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveUpdate(tx)}
                            className="px-4 py-1.5 rounded-lg bg-teal-400 text-black text-[8px] font-bold tracking-widest uppercase"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3 mt-1.5">
                          <div>
                            <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block">Category</span>
                            <span className="text-[10px] font-semibold text-zinc-300 uppercase">{tx.category.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block">Channel</span>
                            <span className="text-[10px] font-semibold text-zinc-300 uppercase">{tx.incomeType || 'Commercial Outflow'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-1.5 pt-2 border-t border-white/5">
                          <button 
                            onClick={() => handleEditClick(tx)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[8px] font-bold tracking-widest text-zinc-400 hover:text-white uppercase"
                          >
                            <Edit2 size={9} /> Edit
                          </button>
                          <button 
                            onClick={() => deleteTransaction(tx.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 bg-[#ff385c]/10 text-[8px] font-bold tracking-widest text-[#ff385c] hover:bg-[#ff385c]/20 uppercase"
                          >
                            <Trash2 size={9} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ==========================================
   WORKSPACE 3: TARGET VIEW (MILESTONES)
   ========================================== */
function TargetView() {
  const { milestones, addMilestone, editMilestone, deleteMilestone, balance } = useAppContext();

  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalColor, setGoalColor] = useState('#00f2fe');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const activeM = useMemo(() => {
    if (milestones.length === 0) return null;
    const match = milestones.find(m => m.id === activeId);
    return match || milestones[0];
  }, [milestones, activeId]);

  const progress = useMemo(() => {
    if (!activeM || activeM.target === 0) return 0;
    return activeM.current / activeM.target;
  }, [activeM]);

  // AI Savings Simulator Days
  const remainingDays = useMemo(() => {
    if (!activeM) return 0;
    const diff = activeM.target - activeM.current;
    if (diff <= 0) return 0;

    const averageSavingSpeed = Math.max(1000, balance * 0.02);
    return Math.max(1, Math.ceil(diff / averageSavingSpeed));
  }, [activeM, balance]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeM) return;
    const val = parseFloat(e.target.value);
    editMilestone({
      ...activeM,
      current: Math.round(val)
    });
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    if (!goalName || isNaN(targetVal) || targetVal <= 0) {
      alert("Invalid Inputs!");
      return;
    }

    addMilestone({
      name: goalName,
      target: targetVal,
      current: 0,
      color: goalColor
    });

    setGoalName('');
    setGoalTarget('');
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    const targetVal = parseFloat(editTarget);
    if (!activeM || !editName || isNaN(targetVal) || targetVal <= 0) {
      alert("Invalid Inputs!");
      return;
    }
    editMilestone({
      ...activeM,
      name: editName,
      target: targetVal
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-5 select-none w-full px-0.5">
      {activeM ? (
        <>
          <div className="flex flex-col items-center justify-center my-2.5 relative">
            <TargetTorus progress={progress} color={activeM.color} />
          </div>

          {/* Active Goal Info Card */}
          <GlassCard className="p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-xl pointer-events-none" style={{ backgroundColor: `${activeM.color}11` }} />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase block">Target Milestone</span>
                {isEditing ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none"
                    />
                    <input 
                      type="number" 
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none"
                    />
                    <div className="flex gap-2.5 mt-0.5">
                      <button onClick={() => setIsEditing(false)} className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase">Cancel</button>
                      <button onClick={handleSaveEdit} className="text-[8px] font-bold tracking-widest text-teal-400 uppercase">Save</button>
                    </div>
                  </div>
                ) : (
                  <h3 className="text-xl font-extrabold text-white font-outfit mt-0.5">{activeM.name}</h3>
                )}
              </div>
              
              {!isEditing && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditName(activeM.name);
                      setEditTarget(activeM.target.toString());
                      setIsEditing(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-white"
                  >
                    <Sliders size={11} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("Milestone delete kerna chahte hain?")) {
                        deleteMilestone(activeM.id);
                        setActiveId(null);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[#ff385c]/10 border border-[#ff385c]/5 text-[#ff385c]"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
              <div>
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block">CURRENTLY LOGGED</span>
                <span className="text-sm font-extrabold text-white font-outfit">₹{activeM.current.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block">FUNDING GOAL</span>
                <span className="text-sm font-extrabold font-outfit" style={{ color: activeM.color }}>₹{activeM.target.toLocaleString()}</span>
              </div>
            </div>

            {/* iOS Styled Volume/Brightness range bar pill */}
            <div className="flex flex-col gap-2.5 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase">Drag to Fund</span>
                <span className="text-[9px] font-extrabold text-zinc-400">₹{activeM.current.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min="0"
                max={activeM.target}
                step="5000"
                value={activeM.current}
                onChange={handleSliderChange}
                className="ios-slider"
                style={{ 
                  '--slider-color': activeM.color,
                  background: `linear-gradient(to right, ${activeM.color} 0%, ${activeM.color} ${(activeM.current/activeM.target)*100}%, rgba(255,255,255,0.03) ${(activeM.current/activeM.target)*100}%, rgba(255,255,255,0.03) 100%)` 
                } as any}
              />
            </div>
          </GlassCard>

          {/* AI Simulator Output */}
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-400/10 flex items-center justify-center">
                <Sparkles size={13} className="text-teal-400" />
              </div>
              <div>
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block font-outfit">Velocity simulator</span>
                <span className="text-xs font-bold text-white block">
                  {remainingDays > 0 ? `Est. ${remainingDays} Days remaining to Target` : 'Target fully funded!'}
                </span>
              </div>
            </div>
            <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase">AI MODEL</span>
          </GlassCard>
        </>
      ) : (
        <div className="text-center py-12">
          <span className="text-xs font-bold text-zinc-600 tracking-widest uppercase block">No milestones active</span>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-5 py-2 bg-teal-400 text-black text-[10px] font-extrabold tracking-widest rounded-xl uppercase active:scale-95 transition-transform"
          >
            Create Goal
          </button>
        </div>
      )}

      {/* Goal listSwitcher */}
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase font-outfit">All Milestones</span>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-teal-400 uppercase active:scale-95 transition-transform"
          >
            <Plus size={10} /> Add Goal
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {milestones.map((m) => {
            const isSelected = activeM?.id === m.id;
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            return (
              <div 
                key={m.id}
                onClick={() => setActiveId(m.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  isSelected 
                    ? 'bg-white/[0.03] border-white/10' 
                    : 'bg-transparent border-white/5 hover:border-white/10'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white font-outfit">{m.name}</h4>
                  <span className="text-[8px] font-bold text-zinc-500 tracking-wider block uppercase mt-0.5">
                    ₹{m.current.toLocaleString()} / ₹{m.target.toLocaleString()}
                  </span>
                </div>
                
                <span className="text-xs font-black font-outfit" style={{ color: m.color }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal creation modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-[#030303]/85 backdrop-blur-md flex items-end justify-center px-4 pb-[100px]">
          <GlassCard className="w-full p-5 max-w-md border border-white/10 shadow-2xl relative animate-slide-in-bottom">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={15} />
            </button>

            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5 mb-4 font-outfit">
              <Plus size={13} className="text-teal-400" /> Create Milestone Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="flex flex-col gap-3">
              <input 
                type="text" 
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Rolex Submariner or Alps Trip"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-teal-400 transition-colors"
                autoFocus
              />
              <input 
                type="number" 
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target Funding Amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-teal-400 transition-colors"
              />
              
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-bold text-zinc-500 tracking-wider uppercase block">Accent Theme Color</span>
                <div className="flex gap-2">
                  {['#00f2fe', '#f35588', '#2dd4bf', '#a855f7', '#fb923c', '#ffffff'].map((color) => (
                    <button 
                      key={color}
                      type="button"
                      onClick={() => setGoalColor(color)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        goalColor === color ? 'border-white scale-110' : 'border-transparent opacity-60'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-[10px] uppercase tracking-widest shadow-md transition-colors mt-2"
              >
                Launch Milestone
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
