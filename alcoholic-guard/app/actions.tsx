import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ACTION_CATEGORIES, ACTION_PRESETS, REWARD_PRESETS } from '../src/constants/alternativeActions';
import { ActionCategoryId, AlternativeAction, Reward } from '../src/models/types';
import { addCustomAction, loadCustomActions, loadCustomRewards, logAction } from '../src/storage';

type FilterCategory = ActionCategoryId | 'all';

export default function ActionsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [customActions, setCustomActions] = useState<AlternativeAction[]>([]);
  const [customRewards, setCustomRewards] = useState<Reward[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<ActionCategoryId>('body');

  const reload = useCallback(async () => {
    const [customA, customR] = await Promise.all([loadCustomActions(), loadCustomRewards()]);
    setCustomActions(customA);
    setCustomRewards(customR);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const allActions = [...ACTION_PRESETS, ...customActions];
  const rewardsById = [...REWARD_PRESETS, ...customRewards].reduce<Record<string, Reward>>(
    (acc, r) => {
      acc[r.id] = r;
      return acc;
    },
    {}
  );

  const filtered =
    selectedCategory === 'all'
      ? allActions
      : allActions.filter((a) => a.category === selectedCategory);

  const handleSelect = async (action: AlternativeAction) => {
    await logAction(action.id, action.label);
    router.back();
  };

  const handleAddCustom = async () => {
    const label = newLabel.trim();
    if (!label) return;
    const action: AlternativeAction = {
      id: `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
      label,
      category: newCategory,
      isCustom: true,
    };
    await addCustomAction(action);
    setNewLabel('');
    setShowAddForm(false);
    reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>他の行動を見る</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        <TouchableOpacity
          style={[styles.tab, selectedCategory === 'all' && styles.tabActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.tabText, selectedCategory === 'all' && styles.tabTextActive]}>
            すべて
          </Text>
        </TouchableOpacity>
        {ACTION_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, selectedCategory === cat.id && styles.tabActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.tabText, selectedCategory === cat.id && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionRow}
            onPress={() => handleSelect(action)}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
            {action.rewardId && rewardsById[action.rewardId] && (
              <Text style={styles.rewardHint}>ご褒美: {rewardsById[action.rewardId].label}</Text>
            )}
          </TouchableOpacity>
        ))}

        {!showAddForm ? (
          <TouchableOpacity style={styles.addToggle} onPress={() => setShowAddForm(true)}>
            <Text style={styles.addToggleText}>＋ 自分の行動を追加</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <TextInput
              style={styles.textInput}
              placeholder="例）ジムへ行く"
              placeholderTextColor="#666"
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <View style={styles.categoryPickerRow}>
              {ACTION_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, newCategory === cat.id && styles.categoryChipActive]}
                  onPress={() => setNewCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      newCategory === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddCustom}>
              <Text style={styles.saveButtonText}>追加する</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 8,
  },
  tabRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#2a2a4a',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    color: '#8888aa',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  actionRow: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  rewardHint: {
    color: '#4ade80',
    fontSize: 12,
    marginTop: 4,
  },
  addToggle: {
    borderWidth: 1,
    borderColor: '#8888aa',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addToggleText: {
    color: '#8888aa',
    fontSize: 14,
  },
  addForm: {
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 12,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#2a2a4a',
  },
  categoryChipActive: {
    backgroundColor: '#e94560',
  },
  categoryChipText: {
    color: '#8888aa',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
