import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FeedbackToast } from '../src/components/FeedbackToast';
import { MeterBar } from '../src/components/MeterBar';
import { pickPreventionDoneMessage } from '../src/constants/preventionActions';
import { AppSettings, DailyStatus, PreventionPlan } from '../src/models/types';
import {
  finalizeAchievement,
  getDailyStatus,
  getPreventionPlan,
  loadSettings,
  markPreventionItemDone,
  todayKey,
  yesterdayKey,
} from '../src/storage';

function isPastGoalTime(goalTime: string): boolean {
  const [h, m] = goalTime.split(':').map((n) => Number(n));
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
}

export default function HomeScreen() {
  const router = useRouter();
  const [today, setToday] = useState<DailyStatus | null>(null);
  const [yesterday, setYesterday] = useState<DailyStatus | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [preventionPlan, setPreventionPlan] = useState<PreventionPlan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);

  const reload = useCallback(async () => {
    let todayStatus = await getDailyStatus(todayKey());

    if (
      todayStatus.checkin &&
      !todayStatus.drank &&
      !todayStatus.finalizedAt &&
      isPastGoalTime(todayStatus.checkin.goalTime)
    ) {
      todayStatus = await finalizeAchievement(todayKey());
    }

    const [yesterdayStatus, appSettings, plan] = await Promise.all([
      getDailyStatus(yesterdayKey()),
      loadSettings(),
      getPreventionPlan(todayKey()),
    ]);

    setToday(todayStatus);
    setYesterday(yesterdayStatus);
    setSettings(appSettings);
    setPreventionPlan(plan);
    setLoaded(true);
  }, []);

  const handleMarkPreventionDone = async (actionId: string) => {
    const next = await markPreventionItemDone(todayKey(), actionId);
    setPreventionPlan(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setToastMessage(pickPreventionDoneMessage());
    setToastKey((k) => k + 1);
  };

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (!loaded || !today || !settings || !preventionPlan) {
    return <SafeAreaView style={styles.container} />;
  }

  const sortedPreventionItems = [...preventionPlan.items].sort((a, b) =>
    (a.scheduledTime ?? '99:99').localeCompare(b.scheduledTime ?? '99:99')
  );
  const preventionDoneCount = preventionPlan.items.filter((i) => i.done).length;

  const checkin = today.checkin;
  const showComparison = Boolean(checkin && yesterday?.checkin);
  const lightnessDiff = showComparison ? checkin!.lightness - yesterday!.checkin!.lightness : 0;
  const refreshmentDiff = showComparison ? checkin!.refreshment - yesterday!.checkin!.refreshment : 0;

  return (
    <SafeAreaView style={styles.container}>
      <FeedbackToast message={toastMessage} toastKey={toastKey} />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Alcoholic Guard</Text>

        {!checkin && (
          <TouchableOpacity style={styles.checkinCard} onPress={() => router.push('/morning')}>
            <Text style={styles.checkinCardTitle}>朝チェックインをする</Text>
            <Text style={styles.checkinCardSub}>今日の状態とゴール時刻を設定しましょう</Text>
          </TouchableOpacity>
        )}

        {checkin && (
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>今日のゴール</Text>
            <Text style={styles.goalValue}>{checkin.goalTime}</Text>
          </View>
        )}

        <View style={styles.preventionCard}>
          <View style={styles.preventionHeaderRow}>
            <Text style={styles.preventionTitle}>今日の予防ガード</Text>
            <TouchableOpacity onPress={() => router.push('/prevention')}>
              <Text style={styles.preventionEditLink}>
                {sortedPreventionItems.length === 0 ? '設定する' : '編集する'}
              </Text>
            </TouchableOpacity>
          </View>

          {sortedPreventionItems.length === 0 ? (
            <Text style={styles.preventionEmptyText}>
              飲みたくなる前にやることを決めておきましょう
            </Text>
          ) : (
            <>
              {sortedPreventionItems.map((item) => (
                <View key={item.actionId} style={styles.preventionRow}>
                  <Text
                    style={[
                      styles.preventionItemText,
                      item.done && styles.preventionItemTextDone,
                    ]}
                  >
                    {item.scheduledTime ? `${item.scheduledTime}　` : ''}
                    {item.actionLabel}
                  </Text>
                  {item.done ? (
                    <Text style={styles.preventionDoneMark}>✓</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.preventionDoneButton}
                      onPress={() => handleMarkPreventionDone(item.actionId)}
                    >
                      <Text style={styles.preventionDoneButtonText}>やった</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Text style={styles.preventionCountText}>
                今日の予防ガード {preventionDoneCount}回実行
              </Text>
            </>
          )}
        </View>

        {today.drank && (
          <View style={styles.drankCard}>
            <Text style={styles.drankCardText}>
              今日は飲んだ記録があります。次まで続けないことを大事にしましょう。
            </Text>
          </View>
        )}

        {checkin && (
          <>
            <View style={styles.meterCard}>
              <MeterBar label="気分" value={checkin.mood} color="#4ade80" />
              <MeterBar label="体の軽さ" value={checkin.lightness} color="#38bdf8" />
              <MeterBar label="爽快感" value={checkin.refreshment} color="#a78bfa" />
              <MeterBar label="飲酒欲求" value={checkin.urge} color="#e94560" />
            </View>

            {today.achieved && (
              <View style={styles.achievementCard}>
                <Text style={styles.achievementTitle}>超人達成</Text>
                <Text style={styles.achievementPercent}>100%</Text>
                <Text style={styles.achievementSub}>今日守ったもの</Text>
                <Text style={styles.achievementMoney}>
                  守ったお金：¥{today.moneySaved.toLocaleString()}
                </Text>
                <Text style={styles.achievementNote}>
                  体の軽さ・爽快感は明日の朝に記録します
                </Text>
              </View>
            )}

            {showComparison && (
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonTitle}>昨日よりレベルアップ</Text>
                <Text style={styles.comparisonLine}>
                  昨日より爽快感 {refreshmentDiff >= 0 ? '+' : ''}
                  {refreshmentDiff}
                </Text>
                <Text style={styles.comparisonLine}>
                  昨日より体の軽さ {lightnessDiff >= 0 ? '+' : ''}
                  {lightnessDiff}
                </Text>
                {yesterday!.achieved && (
                  <>
                    <Text style={styles.comparisonLine}>
                      守ったお金 +¥{yesterday!.moneySaved.toLocaleString()}
                    </Text>
                    <Text style={styles.comparisonLine}>昨日も超人達成</Text>
                  </>
                )}
              </View>
            )}

            <Text style={styles.totalSaved}>
              累計 ¥{settings.totalMoneySaved.toLocaleString()}
            </Text>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.dangerButton} onPress={() => router.push('/guard')}>
          <Text style={styles.dangerButtonText}>今、飲みたい</Text>
          <Text style={styles.dangerSubText}>タップしてGuardを開く</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  checkinCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  checkinCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 6,
  },
  checkinCardSub: {
    fontSize: 13,
    color: '#8888aa',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 13,
    color: '#8888aa',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  meterCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  preventionCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  preventionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  preventionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ccccdd',
  },
  preventionEditLink: {
    fontSize: 13,
    color: '#8888aa',
    textDecorationLine: 'underline',
  },
  preventionEmptyText: {
    fontSize: 13,
    color: '#8888aa',
  },
  preventionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  preventionItemText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  preventionItemTextDone: {
    color: '#8888aa',
    textDecorationLine: 'line-through',
  },
  preventionDoneButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  preventionDoneButtonText: {
    color: '#1a1a2e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  preventionDoneMark: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preventionCountText: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 2,
  },
  achievementCard: {
    backgroundColor: '#16333a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  achievementPercent: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 12,
  },
  achievementSub: {
    fontSize: 13,
    color: '#8888aa',
    marginBottom: 6,
  },
  achievementMoney: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  achievementNote: {
    fontSize: 12,
    color: '#8888aa',
    textAlign: 'center',
  },
  drankCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  drankCardText: {
    fontSize: 14,
    color: '#ccccdd',
    textAlign: 'center',
    lineHeight: 22,
  },
  comparisonCard: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ccccdd',
    marginBottom: 8,
  },
  comparisonLine: {
    fontSize: 14,
    color: '#4ade80',
    marginBottom: 4,
  },
  totalSaved: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8888aa',
    marginBottom: 24,
  },
  bottomBar: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dangerSubText: {
    fontSize: 12,
    color: '#ffcccc',
    marginTop: 4,
  },
});
