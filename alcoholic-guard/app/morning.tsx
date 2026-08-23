import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScaleInput } from '../src/components/ScaleInput';
import { GOAL_TIME_OPTIONS, GoalTime, MorningCheckin } from '../src/models/types';
import {
  getDailyStatus,
  getPreventionPlan,
  loadSettings,
  saveMorningCheckin,
  todayKey,
  updateDailyAlcoholCost,
  yesterdayKey,
} from '../src/storage';

export default function MorningScreen() {
  const router = useRouter();
  const [mood, setMood] = useState(5);
  const [lightness, setLightness] = useState(5);
  const [refreshment, setRefreshment] = useState(5);
  const [urge, setUrge] = useState(0);
  const [goalTime, setGoalTime] = useState<GoalTime>(GOAL_TIME_OPTIONS[0]);
  const [dailyCost, setDailyCost] = useState('1000');
  const [yesterdayDrank, setYesterdayDrank] = useState(false);
  const [yesterdayPreventionDone, setYesterdayPreventionDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [today, yesterday, settings, yesterdayPlan] = await Promise.all([
        getDailyStatus(todayKey()),
        getDailyStatus(yesterdayKey()),
        loadSettings(),
        getPreventionPlan(yesterdayKey()),
      ]);
      if (today.checkin) {
        setMood(today.checkin.mood);
        setLightness(today.checkin.lightness);
        setRefreshment(today.checkin.refreshment);
        setUrge(today.checkin.urge);
        setGoalTime(today.checkin.goalTime);
      }
      setYesterdayDrank(yesterday.drank);
      setDailyCost(String(settings.dailyAlcoholCost));
      setYesterdayPreventionDone(yesterdayPlan.items.filter((i) => i.done).map((i) => i.actionLabel));
      setLoaded(true);
    })();
  }, []);

  const handleSave = async () => {
    const checkin: MorningCheckin = {
      date: todayKey(),
      mood,
      lightness,
      refreshment,
      urge,
      goalTime,
      createdAt: new Date().toISOString(),
    };
    const cost = Number(dailyCost);
    await Promise.all([
      saveMorningCheckin(checkin),
      updateDailyAlcoholCost(Number.isFinite(cost) && cost >= 0 ? cost : 0),
    ]);
    router.replace('/');
  };

  const handleAiChat = () => {
    router.push({
      pathname: '/ai-checkin',
      params: {
        mood: String(mood),
        lightness: String(lightness),
        refreshment: String(refreshment),
        urge: String(urge),
        yesterdayDrank: yesterdayDrank ? '1' : '0',
      },
    });
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>朝チェックイン</Text>

        {yesterdayDrank && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>今日は連続させない。それだけ意識できれば十分です。</Text>
          </View>
        )}

        {yesterdayPreventionDone.length > 0 && (
          <View style={styles.noticeBox}>
            <Text style={styles.preventionSummaryText}>
              昨日は「{yesterdayPreventionDone.join('」「')}」を実行しました。
            </Text>
          </View>
        )}

        <ScaleInput label="気分" value={mood} onChange={setMood} />
        <ScaleInput label="体の軽さ" value={lightness} onChange={setLightness} />
        <ScaleInput label="爽快感" value={refreshment} onChange={setRefreshment} />
        <ScaleInput label="飲酒欲求" value={urge} onChange={setUrge} />

        <Text style={styles.sectionLabel}>今日のゴール時刻</Text>
        <View style={styles.chipRow}>
          {GOAL_TIME_OPTIONS.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.chip, goalTime === time && styles.chipActive]}
              onPress={() => setGoalTime(time)}
            >
              <Text style={[styles.chipText, goalTime === time && styles.chipTextActive]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>普段1日に酒へ使う金額（円）</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="number-pad"
          value={dailyCost}
          onChangeText={setDailyCost}
          placeholder="1000"
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.aiButton} onPress={handleAiChat}>
          <Text style={styles.aiButtonText}>AIと今日の状態を整理する</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preventionButton} onPress={() => router.push('/prevention')}>
          <Text style={styles.preventionButtonText}>今日の予防ガードを選ぶ（任意）</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>チェックインを保存</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  noticeBox: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noticeText: {
    color: '#fbbf24',
    fontSize: 14,
    textAlign: 'center',
  },
  preventionSummaryText: {
    color: '#aaaacc',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ccccdd',
    marginTop: 4,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#2a2a4a',
  },
  chipActive: {
    backgroundColor: '#e94560',
  },
  chipText: {
    color: '#8888aa',
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  aiButton: {
    borderWidth: 1,
    borderColor: '#4ade80',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiButtonText: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
  },
  preventionButton: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  preventionButtonText: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
