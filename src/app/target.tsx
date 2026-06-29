import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TargetTorus } from '@/components/TargetTorus';
import { GlassCard } from '@/components/GlassCard';
import { AmbientBackground } from '@/components/AmbientBackground';
import { useHaptics } from '@/hooks/useHaptics';
import { Milestone, useAppContext } from '@/context/AppContext';
import Slider from '@react-native-community/slider';

export default function TargetScreen() {
  const haptics = useHaptics();
  const { 
    milestones, 
    addMilestone, 
    editMilestone, 
    deleteMilestone 
  } = useAppContext();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Form states for creating new milestone
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalColor, setGoalColor] = useState('#FFFFFF');

  // Form states for editing active milestone
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');

  // Determine active milestone
  const activeMilestone = useMemo(() => {
    if (milestones.length === 0) return null;
    if (activeId && milestones.some(m => m.id === activeId)) {
      return milestones.find(m => m.id === activeId)!;
    }
    return milestones[0];
  }, [milestones, activeId]);

  const progress = useMemo(() => {
    if (!activeMilestone || activeMilestone.target === 0) return 0;
    return Math.min(1, activeMilestone.current / activeMilestone.target);
  }, [activeMilestone]);

  const handleSavingsChange = (val: number) => {
    if (!activeMilestone) return;
    
    // Physical spring tick simulation
    if (Math.round(val) % 25000 === 0) {
      haptics.light();
    }
    
    editMilestone({
      ...activeMilestone,
      current: Math.round(val)
    });
  };

  const handleMilestoneSelect = (id: string) => {
    haptics.medium();
    setActiveId(id);
    setIsEditingGoal(false);
  };

  const handleSaveGoal = () => {
    const targetVal = parseFloat(goalTarget);
    if (!goalName || isNaN(targetVal) || targetVal <= 0) {
      haptics.heavy();
      return;
    }

    haptics.success();
    addMilestone({
      name: goalName,
      target: targetVal,
      current: 0,
      color: goalColor
    });

    // Reset forms
    setGoalName('');
    setGoalTarget('');
    setShowAddGoalForm(false);
  };

  const handleStartEdit = () => {
    if (!activeMilestone) return;
    haptics.selection();
    setEditName(activeMilestone.name);
    setEditTarget(activeMilestone.target.toString());
    setIsEditingGoal(true);
  };

  const handleSaveEditGoal = () => {
    const targetVal = parseFloat(editTarget);
    if (!activeMilestone || !editName || isNaN(targetVal) || targetVal <= 0) {
      haptics.heavy();
      return;
    }

    haptics.success();
    editMilestone({
      ...activeMilestone,
      name: editName,
      target: targetVal,
      current: Math.min(activeMilestone.current, targetVal)
    });
    setIsEditingGoal(false);
  };

  const handleDeleteGoal = () => {
    if (!activeMilestone) return;
    haptics.heavy();
    deleteMilestone(activeMilestone.id);
    setActiveId(null);
    setIsEditingGoal(false);
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
              <Text style={styles.headerSubtitle}>GOALS</Text>
              <Text style={styles.headerTitle}>Targets</Text>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>ACTIVE TARGETS: {milestones.length}</Text>
            </View>
          </View>

          {/* Render circular progress ring tilted in 3D perspective space */}
          {activeMilestone ? (
            <View style={styles.torusContainer}>
              <View style={styles.perspectiveTorusWrapper}>
                <TargetTorus progress={progress} color={activeMilestone.color} />
              </View>
              <View style={styles.torusLabelContainer}>
                <Text style={styles.torusPercentage}>{(progress * 100).toFixed(1)}%</Text>
                <Text style={styles.torusLabel}>SAVED</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noActiveTorus}>
              <Text style={styles.noActiveText}>No Active Goal Selected</Text>
            </View>
          )}

          {/* Slider Contribution Card */}
          {activeMilestone && (
            <GlassCard style={styles.dialCard}>
              {isEditingGoal ? (
                <View style={styles.editGoalForm}>
                  <Text style={styles.editFormTitle}>EDIT TARGET DETAILS</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Goal Name</Text>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Target Amount (₹)</Text>
                    <TextInput
                      value={editTarget}
                      onChangeText={setEditTarget}
                      keyboardType="numeric"
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.actionsRow}>
                    <Pressable onPress={() => setIsEditingGoal(false)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnText}>CANCEL</Text>
                    </Pressable>
                    <Pressable onPress={handleSaveEditGoal} style={styles.saveBtn}>
                      <Text style={styles.saveBtnText}>SAVE DETAILS</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.dialHeader}>
                    <Text style={styles.dialLabel}>Tactile Allocation</Text>
                    <Text style={styles.dialValue}>
                      ₹{activeMilestone.current.toLocaleString()} / ₹{activeMilestone.target.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <Slider
                      value={activeMilestone.current}
                      onValueChange={handleSavingsChange}
                      minimumValue={0}
                      maximumValue={activeMilestone.target}
                      minimumTrackTintColor={activeMilestone.color}
                      maximumTrackTintColor="#27272A"
                      thumbTintColor="#FFFFFF"
                      style={styles.nativeSlider}
                    />
                  </View>
                  
                  <View style={styles.goalActionsRow}>
                    <Pressable onPress={handleStartEdit} style={styles.editActionBtn}>
                      <Text style={styles.editActionText}>EDIT TARGET</Text>
                    </Pressable>
                    <Pressable onPress={handleDeleteGoal} style={styles.deleteActionBtn}>
                      <Text style={styles.deleteActionText}>DELETE TARGET</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </GlassCard>
          )}

          {/* Add Goal Panel Toggle */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR SAVINGS TARGETS</Text>
            <Pressable
              onPress={() => {
                haptics.medium();
                setShowAddGoalForm(!showAddGoalForm);
              }}
              style={styles.addGoalBtn}
            >
              <Text style={styles.addGoalBtnText}>{showAddGoalForm ? '✕ CLOSE' : '＋ ADD GOAL'}</Text>
            </Pressable>
          </View>

          {/* Add Goal Form Drawer */}
          {showAddGoalForm && (
            <GlassCard style={styles.addFormCard}>
              <Text style={styles.formTitle}>NEW SAVINGS GOAL</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal Name</Text>
                <TextInput
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="e.g. Porsche 911 Fund, Alps Chalet"
                  placeholderTextColor="#3F3F46"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Amount (₹)</Text>
                <TextInput
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  placeholder="0.00"
                  placeholderTextColor="#3F3F46"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Theme Color</Text>
                <View style={styles.colorRow}>
                  {[
                    '#FFFFFF', // pure silver white
                    '#E2E8F0', // slate gray
                    '#94A3B8', // dark steel
                    '#64748B', // titanium gray
                  ].map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => { haptics.selection(); setGoalColor(color); }}
                      style={[
                        styles.colorPill,
                        { backgroundColor: color },
                        goalColor === color && styles.colorPillActive
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Pressable onPress={handleSaveGoal} style={styles.submitBtn}>
                <Text style={styles.submitText}>ESTABLISH GOAL</Text>
              </Pressable>
            </GlassCard>
          )}

          {/* Goals List */}
          <View style={styles.milestonesList}>
            {milestones.map((m) => {
              const active = activeMilestone?.id === m.id;
              const pct = m.target > 0 ? (m.current / m.target) * 100 : 0;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => handleMilestoneSelect(m.id)}
                  style={[
                    styles.milestoneCard,
                    active && { borderColor: m.color, backgroundColor: '#0F0F10' }
                  ]}
                >
                  <View style={styles.milestoneHeader}>
                    <View style={styles.milestoneInfo}>
                      <View style={[styles.colorIndicator, { backgroundColor: m.color }]} />
                      <Text style={styles.milestoneName}>{m.name}</Text>
                    </View>
                    <Text style={styles.milestonePct}>{pct.toFixed(0)}%</Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: m.color }]} />
                  </View>

                  <View style={styles.milestoneFooter}>
                    <Text style={styles.milestoneAmount}>
                      ₹{m.current.toLocaleString()} saved
                    </Text>
                    <Text style={styles.milestoneTargetAmount}>
                      Target: ₹{m.target.toLocaleString()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            
            {milestones.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No savings goals set. Tap "Add Goal" to begin.</Text>
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
    marginBottom: 10,
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
  targetBadge: {
    backgroundColor: '#1E1E20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  targetBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  torusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  perspectiveTorusWrapper: {
    transform: [
      { perspective: 800 },
      { rotateX: '20deg' },
      { rotateY: '-15deg' }
    ],
  },
  noActiveTorus: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 80,
    width: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  noActiveText: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  torusLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torusPercentage: {
    fontSize: 28,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  torusLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 2,
    marginTop: 4,
  },
  dialCard: {
    padding: 20,
    marginBottom: 28,
  },
  dialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dialLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
  },
  dialValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  nativeSlider: {
    width: '100%',
    height: 40,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dialHint: {
    fontSize: 9,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  goalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
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
  editGoalForm: {
    width: '100%',
  },
  editFormTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 2,
  },
  addGoalBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addGoalBtnText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addFormCard: {
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
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  colorPillActive: {
    borderColor: '#52525B',
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
  milestonesList: {
    gap: 16,
  },
  milestoneCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    padding: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  milestonePct: {
    fontSize: 13,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#1E1E20',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneAmount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  milestoneTargetAmount: {
    fontSize: 9,
    fontWeight: '500',
    color: '#71717A',
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
