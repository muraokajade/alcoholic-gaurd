import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { PREVENTION_ACTION_PRESETS } from '../src/constants/preventionActions';
import { REWARD_PRESETS } from '../src/constants/alternativeActions';
import { PreventionAction, PreventionPlanItem, Reward } from '../src/models/types';
import {
  addCustomPreventionAction,
  getPreventionPlan,
  loadCustomPreventionActions,
  loadCustomRewards,
  savePreventionPlan,
  todayKey,
} from '../src/storage';

const MAX_ITEMS = 3;

export default function PreventionScreen() {
  const router = useRouter();
  const [customActions, setCustomActions] = useState<PreventionAction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(REWARD_PRESETS);
  const [items, setItems] = useState<PreventionPlanItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const [plan, custom, customRewards] = await Promise.all([
      getPreventionPlan(todayKey()),
      loadCustomPreventionActions(),
      loadCustomRewards(),
    ]);
    setItems(plan.items);
    setCustomActions(custom);
    setRewards([...REWARD_PRESETS, ...customRewards]);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const allActions = [...PREVENTION_ACTION_PRESETS, ...customActions];

  const isSelected = (actionId: string) => items.some((i) => i.actionId === actionId);

  const toggleAction = (action: PreventionAction) => {
    if (isSelected(action.id)) {
      setItems((prev) => prev.filter((i) => i.actionId !== action.id));
      return;
    }
    if (items.length >= MAX_ITEMS) {
      Alert.alert('選べるのは最大3個までです', '一度外してから別の行動を選んでください');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        actionId: action.id,
        actionLabel: action.label,
        scheduledTime: undefined,
        rewardId: action.rewardId,
        done: false,
        doneAt: null,
      },
    ]);
  };

  const updateTime = (actionId: string, time: string) => {
    setItems((prev) =>
      prev.map((i) => (i.actionId === actionId ? { ...i, scheduledTime: time } : i))
    );
  };

  const updateReward = (actionId: string, rewardId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.actionId === actionId ? { ...i, rewardId: i.rewardId === rewardId ? undefined : rewardId } : i
      )
    );
  };

  const handleAddCustom = async () => {
    const label = newLabel.trim();
    if (!label) return;
    const action: PreventionAction = {
      id: `custom-prevent-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
      label,
      isCustom: true,
    };
    await addCustomPreventionAction(action);
    setNewLabel('');
    setShowAddForm(false);
    reload();
  };

  const handleSave = async () => {
    const normalized = items.map((i) => ({
      ...i,
      scheduledTime: i.scheduledTime?.trim() || undefined,
    }));
    await savePreventionPlan({ date: todayKey(), items: normalized });
    router.back();
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>今日の予防ガード</Text>
      <Text style={styles.subtitle}>飲酒につながる前に、先回りしてやる行動を選ぶ（最大3個・任意）</Text>

      <ScrollView contentContainerStyle={styles.listContent}>
        {allActions.map((action) => {
          const selected = isSelected(action.id);
          const item = items.find((i) => i.actionId === action.id);
          return (
            <View key={action.id} style={styles.actionBlock}>
              <TouchableOpacity
                style={[styles.actionRow, selected && styles.actionRowActive]}
                onPress={() => toggleAction(action)}
              >
                <Text style={[styles.actionLabel, selected && styles.actionLabelActive]}>
                  {selected ? '✓ ' : ''}
                  {action.label}
                </Text>
              </TouchableOpacity>

              {selected && item && (
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>予定時刻（任意）</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="例）19:00"
                    placeholderTextColor="#666"
                    value={item.scheduledTime ?? ''}
                    onChangeText={(text) => updateTime(action.id, text)}
                  />
                  <Text style={styles.detailLabel}>行動後のご褒美（任意）</Text>
                  <View style={styles.rewardRow}>
                    {rewards.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.rewardChip, item.rewardId === r.id && styles.rewardChipActive]}
                        onPress={() => updateReward(action.id, r.id)}
                      >
                        <Text
                          style={[
                            styles.rewardChipText,
                            item.rewardId === r.id && styles.rewardChipTextActive,
                          ]}
                        >
                          {r.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {!showAddForm ? (
          <TouchableOpacity style={styles.addToggle} onPress={() => setShowAddForm(true)}>
            <Text style={styles.addToggleText}>＋ 自分の予防行動を追加</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <TextInput
              style={styles.textInput}
              placeholder="例）18時からPCを開く"
              placeholderTextColor="#666"
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TouchableOpacity style={styles.addSaveButton} onPress={handleAddCustom}>
              <Text style={styles.addSaveButtonText}>追加する</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>今日の予防ガードを保存</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#8888aa',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  actionBlock: {
    marginBottom: 10,
  },
  actionRow: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
  },
  actionRowActive: {
    backgroundColor: '#3a2f5a',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  actionLabelActive: {
    color: '#4ade80',
  },
  detailBox: {
    backgroundColor: '#20203a',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  detailLabel: {
    color: '#8888aa',
    fontSize: 12,
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#2a2a4a',
  },
  rewardChipActive: {
    backgroundColor: '#4ade80',
  },
  rewardChipText: {
    color: '#8888aa',
    fontSize: 12,
  },
  rewardChipTextActive: {
    color: '#1a1a2e',
    fontWeight: '600',
  },
  addToggle: {
    borderWidth: 1,
    borderColor: '#8888aa',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  addToggleText: {
    color: '#8888aa',
    fontSize: 14,
  },
  addForm: {
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 12,
  },
  addSaveButton: {
    backgroundColor: '#2a2a4a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addSaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
