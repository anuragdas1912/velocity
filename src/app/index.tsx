import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MatrixSphere } from '@/components/MatrixSphere';
import { GlassCard } from '@/components/GlassCard';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useHaptics } from '@/hooks/useHaptics';
import { useAppContext } from '@/context/AppContext';

export default function MatrixScreen() {
  const haptics = useHaptics();
  const { 
    balance, 
    todaySpend, 
    dailyLimit, 
    addTransaction,
    personalIncome,
    businessIncome,
    transactions
  } = useAppContext();

  const proximityToTarget = todaySpend / dailyLimit;

  // Forms / Toggles state
  const [showAddForm, setShowAddForm] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  // Traditional Form states
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit');
  const [category, setCategory] = useState<'quick_commerce' | 'food_delivery' | 'utilities' | 'p2p'>('quick_commerce');
  const [incomeType, setIncomeType] = useState<'personal' | 'business'>('personal');

  // AI Feature: Financial Health Index (0 - 100)
  const healthIndex = useMemo(() => {
    if (transactions.length === 0) return 100;
    const score = Math.max(10, Math.round(100 - (todaySpend / dailyLimit) * 60));
    return score;
  }, [todaySpend, dailyLimit, transactions]);

  // AI Feature: Outflow Predictor (Forecasts tomorrow's commercial debits)
  const predictedOutflow = useMemo(() => {
    const debits = transactions.filter(t => t.type === 'debit' && !t.isP2P);
    if (debits.length === 0) return 0;
    
    const uniqueDays = Array.from(new Set(debits.map(t => t.timestamp.split('T')[0])));
    const totalDays = uniqueDays.length || 1;
    const totalSpend = debits.reduce((sum, t) => sum + t.amount, 0);
    const average = totalSpend / totalDays;
    
    // Add minor temporal variance based on today's spend
    return Math.round(average * 0.9 + todaySpend * 0.1);
  }, [transactions, todaySpend]);

  // Smart Parser for Quick-Add Input
  const handleQuickAdd = () => {
    if (!quickInput.trim()) {
      haptics.heavy();
      return;
    }

    const text = quickInput.trim();
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (!amountMatch) {
      haptics.heavy();
      alert("Amount type kijiye! (e.g. Swiggy 300)");
      return;
    }

    const parsedAmount = parseFloat(amountMatch[1]);
    const cleanMerchant = text.replace(amountMatch[0], '').trim();
    const finalMerchant = cleanMerchant || "Quick Expense";

    // Auto-classification logic
    const lowerText = text.toLowerCase();
    let finalCategory: 'quick_commerce' | 'food_delivery' | 'utilities' | 'p2p' = 'p2p';
    let finalType: 'credit' | 'debit' = 'debit';
    let finalIncomeType: 'personal' | 'business' | undefined = undefined;

    if (lowerText.includes('swiggy') || lowerText.includes('zomato') || lowerText.includes('food') || lowerText.includes('bistro')) {
      finalCategory = 'food_delivery';
    } else if (lowerText.includes('zepto') || lowerText.includes('blinkit') || lowerText.includes('grocery') || lowerText.includes('instamart')) {
      finalCategory = 'quick_commerce';
    } else if (lowerText.includes('recharge') || lowerText.includes('bill') || lowerText.includes('netflix') || lowerText.includes('electricity') || lowerText.includes('rent') || lowerText.includes('utility') || lowerText.includes('cloud')) {
      finalCategory = 'utilities';
    }

    if (lowerText.includes('salary') || lowerText.includes('refund') || lowerText.includes('income') || lowerText.includes('credit') || lowerText.includes('freelance')) {
      finalType = 'credit';
      finalCategory = 'utilities';
      if (lowerText.includes('business') || lowerText.includes('freelance') || lowerText.includes('work') || lowerText.includes('client')) {
        finalIncomeType = 'business';
      } else {
        finalIncomeType = 'personal';
      }
    }

    haptics.success();
    addTransaction({
      amount: parsedAmount,
      merchant: finalMerchant,
      category: finalCategory,
      timestamp: new Date().toISOString(),
      isP2P: finalCategory === 'p2p',
      type: finalType,
      frequency: 1,
      surcharge: finalType === 'debit' && finalCategory !== 'p2p' ? 10 : 0,
      incomeType: finalIncomeType
    });

    setQuickInput('');
  };

  const handleSaveTransaction = () => {
    if (!merchant || !amount) {
      haptics.heavy();
      return;
    }
    
    haptics.success();
    addTransaction({
      amount: parseFloat(amount),
      merchant,
      category,
      timestamp: new Date().toISOString(),
      isP2P: category === 'p2p',
      type: txType,
      frequency: 1,
      surcharge: txType === 'debit' && category !== 'p2p' ? 10 : 0,
      incomeType: txType === 'credit' ? incomeType : undefined
    });

    setMerchant('');
    setAmount('');
    setShowAddForm(false);
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
              <Text style={styles.headerSubtitle}>MATRIX</Text>
              <Text style={styles.headerTitle}>Velocity</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, proximityToTarget > 0.8 ? styles.statusDotWarning : styles.statusDotActive]} />
              <Text style={styles.statusText}>{proximityToTarget > 0.8 ? 'OVER LIMIT' : 'OPTIMAL'}</Text>
            </View>
          </View>

          {/* Central Pulsating Orb */}
          <View style={styles.sphereContainer}>
            <MatrixSphere proximityToTarget={proximityToTarget} />
          </View>

          {/* Smart Quick-Add Bar */}
          <GlassCard style={styles.quickAddCard}>
            <Text style={styles.quickAddLabel}>QUICK RECORD ENTRY</Text>
            <View style={styles.quickAddRow}>
              <TextInput
                value={quickInput}
                onChangeText={setQuickInput}
                placeholder="Type 'Zepto 240' or 'Salary 45000'..."
                placeholderTextColor="#52525B"
                style={styles.quickAddInput}
                onSubmitEditing={handleQuickAdd}
              />
              <Pressable onPress={handleQuickAdd} style={styles.quickAddSubmitBtn}>
                <Text style={styles.quickAddSubmitText}>ADD</Text>
              </Pressable>
            </View>
          </GlassCard>

          {/* 3D Holographic Perspective Balance Display */}
          <View style={styles.perspectiveCardContainer}>
            <GlassCard style={styles.liquidityCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>TOTAL LIQUIDITY</Text>
                <Pressable
                  onPress={() => {
                    haptics.medium();
                    setShowAddForm(!showAddForm);
                  }}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>{showAddForm ? '✕ CLOSE' : '＋ MANUAL TX'}</Text>
                </Pressable>
              </View>

              <View style={styles.row}>
                <Text style={styles.liquidityValue}>₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                <Text style={styles.liquidityCurrency}>INR</Text>
              </View>

              <View style={styles.liquidityStats}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>TODAY'S OUTFLOW</Text>
                  <Text style={styles.statValue}>₹{todaySpend.toLocaleString()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>AI ESTIMATED LIMIT</Text>
                  <Text style={styles.statValue}>₹{dailyLimit.toLocaleString()}</Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* AI Intelligence Metrics Section */}
          <GlassCard style={styles.aiMetricsCard}>
            <Text style={styles.aiMetricsHeader}>AI COGNITIVE ANALYTICS</Text>
            <View style={styles.aiRow}>
              <View style={styles.aiMetricCol}>
                <Text style={styles.aiLabel}>HEALTH INDEX</Text>
                <Text style={[styles.aiValue, { color: healthIndex > 75 ? '#FFFFFF' : '#A1A1AA' }]}>
                  {healthIndex}%
                </Text>
                <Text style={styles.aiSubText}>{healthIndex > 75 ? 'EXCELLENT' : 'OPTIMIZE SPEND'}</Text>
              </View>
              <View style={styles.aiDivider} />
              <View style={styles.aiMetricCol}>
                <Text style={styles.aiLabel}>TOMORROW FORECAST</Text>
                <Text style={styles.aiValue}>₹{predictedOutflow.toLocaleString()}</Text>
                <Text style={styles.aiSubText}>PREDICTED OUTFLOW</Text>
              </View>
            </View>
          </GlassCard>

          {/* Income Source Pools Display */}
          <GlassCard style={styles.incomePoolsCard}>
            <Text style={styles.poolsLabel}>INFLOW CHANNELS</Text>
            <View style={styles.poolsRow}>
              <View style={styles.poolCol}>
                <Text style={styles.poolLabel}>PERSONAL INCOME</Text>
                <Text style={styles.poolValue}>₹{personalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.poolsDivider} />
              <View style={styles.poolCol}>
                <Text style={styles.poolLabel}>BUSINESS INCOME</Text>
                <Text style={styles.poolValue}>₹{businessIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Traditional Manual Add Form */}
          {showAddForm && (
            <GlassCard style={styles.formCard}>
              <Text style={styles.formTitle}>MANUAL TRANSACTION</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Merchant / Source</Text>
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="e.g. Swiggy, Zepto, Salary"
                  placeholderTextColor="#3F3F46"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#3F3F46"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.rowSelector}>
                <Pressable
                  onPress={() => { haptics.selection(); setTxType('debit'); }}
                  style={[styles.selectorBtn, txType === 'debit' && styles.selectorActive]}
                >
                  <Text style={[styles.selectorText, txType === 'debit' && styles.selectorTextActive]}>Debit (Outflow)</Text>
                </Pressable>
                <Pressable
                  onPress={() => { haptics.selection(); setTxType('credit'); }}
                  style={[styles.selectorBtn, txType === 'credit' && styles.selectorActive]}
                >
                  <Text style={[styles.selectorText, txType === 'credit' && styles.selectorTextActive]}>Credit (Inflow)</Text>
                </Pressable>
              </View>

              {txType === 'credit' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Income Channel</Text>
                  <View style={styles.rowSelector}>
                    <Pressable
                      onPress={() => { haptics.selection(); setIncomeType('personal'); }}
                      style={[styles.selectorBtn, incomeType === 'personal' && styles.selectorActive]}
                    >
                      <Text style={[styles.selectorText, incomeType === 'personal' && styles.selectorTextActive]}>Personal</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { haptics.selection(); setIncomeType('business'); }}
                      style={[styles.selectorBtn, incomeType === 'business' && styles.selectorActive]}
                    >
                      <Text style={[styles.selectorText, incomeType === 'business' && styles.selectorTextActive]}>Business</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.gridSelector}>
                    {[
                      { id: 'quick_commerce', label: 'Q-Comm' },
                      { id: 'food_delivery', label: 'Food' },
                      { id: 'utilities', label: 'Utility' },
                      { id: 'p2p', label: 'P2P Transfer' },
                    ].map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => { haptics.selection(); setCategory(cat.id as any); }}
                        style={[styles.gridBtn, category === cat.id && styles.gridBtnActive]}
                      >
                        <Text style={[styles.gridText, category === cat.id && styles.gridTextActive]}>{cat.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <Pressable onPress={handleSaveTransaction} style={styles.submitBtn}>
                <Text style={styles.submitText}>RECORD ENTRY</Text>
              </Pressable>
            </GlassCard>
          )}

          {/* Simple Outflow Summary Card */}
          <GlassCard style={styles.tipCard}>
            <Text style={styles.tipTitle}>OUTFLOW SUMMARY</Text>
            <Text style={styles.tipDescription}>
              {proximityToTarget > 0.8 
                ? "Outflow has exceeded the AI-driven optimal daily spent limit. Keep check on quick outflows."
                : "Spend velocity is within AI-calculated parameters. System optimal."}
            </Text>
          </GlassCard>
          
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
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 9,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#FFFFFF',
  },
  statusDotWarning: {
    backgroundColor: '#71717A',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  sphereContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  quickAddCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  quickAddLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddInput: {
    flex: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 12,
  },
  quickAddSubmitBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddSubmitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  perspectiveCardContainer: {
    transform: [
      { perspective: 1000 },
      { rotateX: '8deg' },
      { rotateY: '-8deg' }
    ],
    marginBottom: 20,
  },
  liquidityCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  incomePoolsCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  poolsLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  poolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolCol: {
    flex: 1,
    alignItems: 'center',
  },
  poolLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  poolValue: {
    fontSize: 15,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  poolsDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  aiMetricsCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  aiMetricsHeader: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  aiLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aiValue: {
    fontSize: 20,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  aiSubText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#3F3F46',
    letterSpacing: 1,
    marginTop: 2,
  },
  aiDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
  },
  addBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addBtnText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  liquidityValue: {
    fontSize: 30,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  liquidityCurrency: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginLeft: 8,
    letterSpacing: 1,
  },
  liquidityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
  },
  statCol: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  limitPressable: {
    paddingVertical: 2,
  },
  editLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitInput: {
    height: 24,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    color: '#FFFFFF',
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  saveLimitBtn: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveLimitText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  formCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  rowSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  gridSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBtn: {
    flex: 1,
    minWidth: '40%',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  gridBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },
  gridTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1.5,
  },
  tipCard: {
    padding: 16,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: '#D4D4D8',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
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
