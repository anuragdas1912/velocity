import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QuantumChart } from '@/components/QuantumChart';
import { GlassCard } from '@/components/GlassCard';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useHaptics } from '@/hooks/useHaptics';
import { Transaction, useAppContext } from '@/context/AppContext';
import { ChevronDown, Flame, ShoppingBag, Zap, ArrowLeftRight } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';

interface TransactionItemProps {
  tx: Transaction;
  onPress: () => void;
  isExpanded: boolean;
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ tx, onPress, isExpanded, onDelete, onEdit }) => {
  const haptics = useHaptics();
  const animatedHeight = useSharedValue(0);

  const [isEditing, setIsEditing] = useState(false);
  const [merchant, setMerchant] = useState(tx.merchant);
  const [amount, setAmount] = useState(tx.amount.toString());

  React.useEffect(() => {
    animatedHeight.value = withTiming(isExpanded ? 1 : 0, { duration: 200 });
    if (!isExpanded) {
      setIsEditing(false);
    }
  }, [isExpanded]);

  const detailStyle = useAnimatedStyle(() => {
    const height = interpolate(animatedHeight.value, [0, 1], [0, isEditing ? 180 : 110], Extrapolation.CLAMP);
    const opacity = interpolate(animatedHeight.value, [0.3, 1], [0, 1], Extrapolation.CLAMP);
    return {
      height,
      opacity,
      overflow: 'hidden',
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    const rotate = interpolate(animatedHeight.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const getIcon = () => {
    switch (tx.category) {
      case 'quick_commerce':
        return <ShoppingBag size={16} color="#FFFFFF" />;
      case 'food_delivery':
        return <Flame size={16} color="#FFFFFF" />;
      case 'utilities':
        return <Zap size={16} color="#FFFFFF" />;
      case 'p2p':
        return <ArrowLeftRight size={16} color="#A1A1AA" />;
      default:
        return <ShoppingBag size={16} color="#FFFFFF" />;
    }
  };

  const isDebit = tx.type === 'debit';

  const handleUpdate = () => {
    const parsedAmount = parseFloat(amount);
    if (!merchant || isNaN(parsedAmount)) {
      haptics.heavy();
      return;
    }
    haptics.success();
    onEdit({
      ...tx,
      merchant,
      amount: parsedAmount
    });
    setIsEditing(false);
  };

  return (
    <Pressable 
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.txCard,
        isExpanded && styles.txCardActive,
        pressed && styles.txCardPressed
      ]}
    >
      <View style={styles.txMainRow}>
        <View style={[styles.iconContainer, tx.isP2P ? styles.iconContainerP2P : styles.iconContainerCommercial]}>
          {getIcon()}
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txMerchant}>{tx.merchant}</Text>
          <Text style={styles.txDate}>{tx.timestamp.split('T')[0]}</Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text style={[styles.txAmount, isDebit ? styles.txAmountDebit : styles.txAmountCredit]}>
            {isDebit ? '-' : '+'}&nbsp;₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Animated.View style={arrowStyle}>
            <ChevronDown size={14} color="#71717A" style={styles.chevron} />
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[detailStyle, styles.detailsContainer]}>
        <View style={styles.detailsDivider} />
        
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.editRow}>
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                style={styles.editInput}
                placeholder="Merchant"
                placeholderTextColor="#52525B"
              />
              <TextInput
                value={amount}
                onChangeText={setAmount}
                style={styles.editInput}
                placeholder="Amount"
                placeholderTextColor="#52525B"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.actionsRow}>
              <Pressable onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={handleUpdate} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.detailsContent}>
            <View style={styles.detailsRow}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>CATEGORY</Text>
                <Text style={styles.detailValue}>{tx.category.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>CHANNEL</Text>
                <Text style={styles.detailValue}>
                  {tx.type === 'credit' 
                    ? (tx.incomeType ? tx.incomeType.toUpperCase() : 'PERSONAL')
                    : 'OUTFLOW'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionsRow}>
              <Pressable 
                onPress={() => {
                  haptics.selection();
                  setIsEditing(true);
                }} 
                style={styles.editActionBtn}
              >
                <Text style={styles.editActionText}>EDIT</Text>
              </Pressable>
              <Pressable 
                onPress={() => {
                  haptics.heavy();
                  onDelete(tx.id);
                }} 
                style={styles.deleteActionBtn}
              >
                <Text style={styles.deleteActionText}>DELETE</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function QuantumScreen() {
  const haptics = useHaptics();
  const { transactions, deleteTransaction, editTransaction } = useAppContext();
  
  // Tab states: 'debits' | 'credits' | 'combined'
  const [activeTab, setActiveTab] = useState<'debits' | 'credits' | 'combined'>('combined');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Income Segment: 'all' | 'personal' | 'business' (Only applicable for Credits tab)
  const [incomeSegment, setIncomeSegment] = useState<'all' | 'personal' | 'business'>('all');

  // Filter transactions list
  const transactionsList = useMemo(() => {
    let list = [...transactions];
    if (activeTab === 'debits') {
      list = list.filter((t) => t.type === 'debit');
    } else if (activeTab === 'credits') {
      list = list.filter((t) => t.type === 'credit');
      if (incomeSegment === 'personal') {
        list = list.filter((t) => t.incomeType === 'personal');
      } else if (incomeSegment === 'business') {
        list = list.filter((t) => t.incomeType === 'business');
      }
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, activeTab, incomeSegment]);

  const sumDebits = useMemo(() => {
    return transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const sumCredits = useMemo(() => {
    return transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const timelineData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => {
      const dayTx = transactions.filter((tx) => {
        const date = new Date(tx.timestamp);
        const txDay = date.getDay();
        const targetDayIdx = (index + 1) % 7;
        return txDay === targetDayIdx && tx.type === 'debit' && !tx.isP2P;
      });
      const dayTotal = dayTx.reduce((sum, tx) => sum + tx.amount, 0);
      return { day, amount: dayTotal, frequency: dayTx.length, surcharge: 0 };
    });
  }, [transactions]);

  const handleTxPress = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Drifting Glowing Nebulas Background */}
      <AmbientBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>HISTORY</Text>
              <Text style={styles.headerTitle}>Flow</Text>
            </View>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {activeTab.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsContainer}>
            {[
              { id: 'debits', label: 'Debits' },
              { id: 'credits', label: 'Credits' },
              { id: 'combined', label: 'Combined' },
            ].map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => {
                  haptics.selection();
                  setActiveTab(tab.id as any);
                  setExpandedTxId(null);
                }}
                style={[styles.tabButton, activeTab === tab.id && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sub-selectors for Credits Tab: Personal vs Business */}
          {activeTab === 'credits' && (
            <View style={styles.segmentContainer}>
              {[
                { id: 'all', label: 'All Inflows' },
                { id: 'personal', label: 'Personal' },
                { id: 'business', label: 'Business' },
              ].map((seg) => (
                <Pressable
                  key={seg.id}
                  onPress={() => {
                    haptics.selection();
                    setIncomeSegment(seg.id as any);
                    setExpandedTxId(null);
                  }}
                  style={[styles.segmentBtn, incomeSegment === seg.id && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, incomeSegment === seg.id && styles.segmentTextActive]}>
                    {seg.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* 3D Holographic Perspective Chart */}
          {activeTab === 'debits' && (
            <View style={styles.perspectiveChartContainer}>
              <QuantumChart data={timelineData} />
            </View>
          )}

          {/* Outflow Value Summary Card */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>TOTAL DEBITS</Text>
                <Text style={styles.summaryAmount}>₹{sumDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>TOTAL CREDITS</Text>
                <Text style={styles.summaryAmount}>₹{sumCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.txList}>
            {transactionsList.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onPress={() => handleTxPress(tx.id)}
                isExpanded={expandedTxId === tx.id}
                onDelete={deleteTransaction}
                onEdit={editTransaction}
              />
            ))}
            
            {transactionsList.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No records found in this section.</Text>
              </View>
            )}
          </View>

          {/* Credit footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>DESIGNED & ENGINEERED BY ANURAG DAS</Text>
          </View>
          
          {/* Bottom spacing for custom tab bar offset */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
    marginTop: 2,
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  segmentActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  perspectiveChartContainer: {
    transform: [
      { perspective: 1000 },
      { rotateX: '8deg' },
      { rotateY: '-8deg' }
    ],
    marginBottom: 10,
  },
  summaryContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCol: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  txList: {
    gap: 12,
  },
  txCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    padding: 16,
  },
  txCardActive: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
  },
  txCardPressed: {
    opacity: 0.9,
  },
  txMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerCommercial: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainerP2P: {
    backgroundColor: 'rgba(113, 113, 122, 0.12)',
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  txDate: {
    fontSize: 10,
    color: '#71717A',
    marginTop: 2,
  },
  txAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  txAmountDebit: {
    color: '#FFFFFF',
  },
  txAmountCredit: {
    color: '#E4E4E7',
  },
  chevron: {
    marginLeft: 8,
  },
  detailsContainer: {
    marginTop: 0,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
  detailsContent: {
    justifyContent: 'space-between',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  editActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  editActionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  deleteActionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  editForm: {
    flex: 1,
    justifyContent: 'space-between',
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editInput: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  saveBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#71717A',
    fontSize: 12,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#3F3F46',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
