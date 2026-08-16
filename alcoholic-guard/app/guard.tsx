import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { AlcoholGuardRecord } from '../src/models/types';
import { saveGuardRecord } from '../src/storage';

const STATE_OPTIONS = ['つらい', '不安', 'イライラ', '暇', '疲労', '空腹', 'その他'];
const ACTION_OPTIONS = ['水を飲む', '食事をする', '散歩する', '横になる', '誰かに連絡する', 'シャワーを浴びる', '音楽を聴く'];

export default function GuardScreen() {
  const router = useRouter();
  const [urgeLevel, setUrgeLevel] = useState(5);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [nextAction, setNextAction] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<AlcoholGuardRecord | null>(null);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const selectAction = (action: string) => {
    setNextAction(action);
    setCustomAction('');
  };

  const handleSave = async () => {
    const finalAction = nextAction || customAction.trim();
    if (!finalAction) {
      Alert.alert('入力エラー', '「今からやること」を選択または入力してください');
      return;
    }

    const record: AlcoholGuardRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      urgeLevel,
      states: selectedStates,
      nextAction: finalAction,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveGuardRecord(record);
      setSavedRecord(record);
      setSaved(true);
    } catch {
      Alert.alert('保存エラー', '記録の保存に失敗しました');
    }
  };

  // === 保存後の結果表示 ===
  if (saved && savedRecord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>Alcohol Guard</Text>
          <Text style={styles.resultMeta}>
            飲酒欲求: {savedRecord.urgeLevel} / 10
          </Text>
          <Text style={styles.resultMeta}>
            状態: {savedRecord.states.join('・') || 'なし'}
          </Text>

          <View style={styles.actionBox}>
            <Text style={styles.actionLabel}>今やること</Text>
            <Text style={styles.actionText}>→ {savedRecord.nextAction}</Text>
          </View>

          <Text style={styles.savedMessage}>記録しました。</Text>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.homeButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // === 入力フォーム ===
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Alcohol Guard</Text>

        {/* 飲酒欲求 */}
        <Text style={styles.sectionLabel}>飲酒欲求</Text>
        <View style={styles.urgeRow}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.urgeButton, urgeLevel === n && styles.urgeButtonActive]}
              onPress={() => setUrgeLevel(n)}
            >
              <Text
                style={[styles.urgeText, urgeLevel === n && styles.urgeTextActive]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.urgeDisplay}>{urgeLevel} / 10</Text>

        {/* 現在の状態 */}
        <Text style={styles.sectionLabel}>現在の状態（複数選択可）</Text>
        <View style={styles.chipRow}>
          {STATE_OPTIONS.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.chip,
                selectedStates.includes(state) && styles.chipActive,
              ]}
              onPress={() => toggleState(state)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStates.includes(state) && styles.chipTextActive,
                ]}
              >
                {state}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 今からやること */}
        <Text style={styles.sectionLabel}>今からやること</Text>
        <View style={styles.chipRow}>
          {ACTION_OPTIONS.map((action) => (
            <TouchableOpacity
              key={action}
              style={[
                styles.chip,
                nextAction === action && styles.chipActive,
              ]}
              onPress={() => selectAction(action)}
            >
              <Text
                style={[
                  styles.chipText,
                  nextAction === action && styles.chipTextActive,
                ]}
              >
                {action}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="その他（自由入力）"
          placeholderTextColor="#666"
          value={customAction}
          onChangeText={(text) => {
            setCustomAction(text);
            setNextAction('');
          }}
        />

        {/* メモ */}
        <Text style={styles.sectionLabel}>メモ（任意）</Text>
        <TextInput
          style={[styles.textInput, styles.memoInput]}
          placeholder="今の気持ちなど"
          placeholderTextColor="#666"
          value={memo}
          onChangeText={setMemo}
          multiline
        />

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>記録する</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccccdd',
    marginTop: 20,
    marginBottom: 10,
  },
  urgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  urgeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgeButtonActive: {
    backgroundColor: '#e94560',
  },
  urgeText: {
    color: '#8888aa',
    fontSize: 14,
    fontWeight: '600',
  },
  urgeTextActive: {
    color: '#ffffff',
  },
  urgeDisplay: {
    textAlign: 'center',
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#2a2a4a',
  },
  chipActive: {
    backgroundColor: '#e94560',
  },
  chipText: {
    color: '#8888aa',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    marginTop: 10,
  },
  memoInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Result screen styles
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  resultMeta: {
    fontSize: 16,
    color: '#aaaacc',
    marginBottom: 6,
  },
  actionBox: {
    marginTop: 32,
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  actionLabel: {
    fontSize: 14,
    color: '#8888aa',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  savedMessage: {
    fontSize: 14,
    color: '#8888aa',
    marginBottom: 24,
  },
  homeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
