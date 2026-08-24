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
import { ACTION_PRESETS, AFTER_DRINK_ACTION_IDS, RECOMMENDED_ACTION_IDS } from '../src/constants/alternativeActions';
import { FeedbackToast } from '../src/components/FeedbackToast';
import { AlcoholGuardRecord, DailyStatus } from '../src/models/types';
import { getDailyStatus, logAction, recordDrank, saveGuardRecord, todayKey } from '../src/storage';

const STATE_OPTIONS = ['つらい', '不安', 'イライラ', '暇', '疲労', '空腹', 'その他'];
const ACTION_OPTIONS = ['水を飲む', '食事をする', '散歩する', '横になる', '誰かに連絡する', 'シャワーを浴びる', '音楽を聴く'];

const RECOMMENDED_ACTIONS = ACTION_PRESETS.filter((a) => RECOMMENDED_ACTION_IDS.includes(a.id));
const AFTER_DRINK_ACTIONS = ACTION_PRESETS.filter((a) => AFTER_DRINK_ACTION_IDS.includes(a.id));

export default function GuardScreen() {
  const router = useRouter();
  const [urgeLevel, setUrgeLevel] = useState(5);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [nextAction, setNextAction] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedRecord, setSavedRecord] = useState<AlcoholGuardRecord | null>(null);
  const [todayStatus, setTodayStatus] = useState<DailyStatus | null>(null);
  const [afterDrink, setAfterDrink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getDailyStatus(todayKey()).then(setTodayStatus);
    }, [])
  );

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleQuickAction = async (actionId: string, actionLabel: string) => {
    await logAction(actionId, actionLabel);
    const next = await getDailyStatus(todayKey());
    setTodayStatus(next);
    setToastMessage(`記録しました：${actionLabel}`);
    setToastKey((k) => k + 1);
  };

  const handleDrank = async () => {
    await recordDrank(todayKey());
    const next = await getDailyStatus(todayKey());
    setTodayStatus(next);
    setAfterDrink(true);
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

  // === 飲酒後：責めずに次の行動へ ===
  if (afterDrink) {
    return (
      <SafeAreaView style={styles.container}>
        <FeedbackToast message={toastMessage} toastKey={toastKey} />
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>今日は飲んだ。</Text>
          <Text style={styles.afterDrinkMessage}>
            でも次まで続けないために、{'\n'}今できることを1つ決めよう。
          </Text>
          <View style={styles.afterDrinkActions}>
            {AFTER_DRINK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.afterDrinkChip}
                onPress={() => handleQuickAction(action.id, action.label)}
              >
                <Text style={styles.afterDrinkChipText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}>
            <Text style={styles.homeButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
      <FeedbackToast message={toastMessage} toastKey={toastKey} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Alcohol Guard</Text>

        {/* 今日のゴール・行動実績 */}
        <View style={styles.goalBox}>
          <Text style={styles.goalText}>
            今日のゴール：{todayStatus?.checkin?.goalTime ?? '未設定'}
          </Text>
          <Text style={styles.actionCountText}>
            今日のガード行動：{todayStatus?.guardActionCount ?? 0}回
          </Text>
        </View>

        {/* おすすめの行動 */}
        <Text style={styles.sectionLabel}>まず、今できることを1つ</Text>
        <View style={styles.recommendedRow}>
          {RECOMMENDED_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.recommendedCard}
              onPress={() => handleQuickAction(action.id, action.label)}
            >
              <Text style={styles.recommendedText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/actions')}>
          <Text style={styles.linkButtonText}>他の行動を見る</Text>
        </TouchableOpacity>

        {/* 20 TAP GUARD */}
        <Text style={styles.escalationLabel}>それでも飲みたい気持ちが強いなら</Text>
        <TouchableOpacity style={styles.tapGuardButton} onPress={() => router.push('/tapguard')}>
          <Text style={styles.tapGuardButtonText}>20 TAP GUARDを使う</Text>
        </TouchableOpacity>

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

        {/* 飲んでしまった場合 */}
        <TouchableOpacity style={styles.drankButton} onPress={handleDrank}>
          <Text style={styles.drankButtonText}>飲んでしまった</Text>
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
  drankButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#2a2a4a',
  },
  drankButtonText: {
    color: '#aaaacc',
    fontSize: 14,
  },
  goalBox: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goalText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionCountText: {
    color: '#8888aa',
    fontSize: 13,
  },
  recommendedRow: {
    gap: 10,
    marginBottom: 12,
  },
  recommendedCard: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  recommendedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  linkButtonText: {
    color: '#8888aa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  escalationLabel: {
    fontSize: 13,
    color: '#8888aa',
    textAlign: 'center',
    marginBottom: 10,
  },
  tapGuardButton: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  tapGuardButtonText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  afterDrinkMessage: {
    fontSize: 16,
    color: '#ccccdd',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  afterDrinkActions: {
    gap: 10,
    width: '100%',
    marginBottom: 32,
  },
  afterDrinkChip: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  afterDrinkChipText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
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
