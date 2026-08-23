import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { aiCheckinService } from '../src/services/aiCheckin';
import { AiCheckinResponse } from '../src/models/types';
import { ACTION_PRESETS } from '../src/constants/alternativeActions';

export default function AiCheckinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mood: string;
    lightness: string;
    refreshment: string;
    urge: string;
    yesterdayDrank: string;
  }>();
  const [response, setResponse] = useState<AiCheckinResponse | null>(null);

  useEffect(() => {
    (async () => {
      const result = await aiCheckinService.getMorningAdvice({
        mood: Number(params.mood ?? 5),
        lightness: Number(params.lightness ?? 5),
        refreshment: Number(params.refreshment ?? 5),
        urge: Number(params.urge ?? 0),
        yesterdayDrank: params.yesterdayDrank === '1',
      });
      setResponse(result);
    })();
  }, [params.mood, params.lightness, params.refreshment, params.urge, params.yesterdayDrank]);

  const suggestedActions = response
    ? ACTION_PRESETS.filter((a) => response.suggestedActionIds.includes(a.id))
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>AI朝チェックイン</Text>

        {!response ? (
          <ActivityIndicator color="#e94560" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.bubble}>
              <Text style={styles.bubbleLabel}>今日の状態整理</Text>
              <Text style={styles.bubbleText}>{response.summary}</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleLabel}>状況の整理</Text>
              <Text style={styles.bubbleText}>{response.situationNotes}</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleLabel}>今日使えそうな代替行動</Text>
              {suggestedActions.map((a) => (
                <Text key={a.id} style={styles.actionItem}>
                  ・{a.label}
                </Text>
              ))}
            </View>
            <Text style={styles.disclaimer}>
              ※ AIは診断・医療判断・飲酒可否の判断は行いません。
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>朝チェックインに戻る</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  bubble: {
    backgroundColor: '#2a2a4a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  bubbleLabel: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 6,
  },
  bubbleText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  actionItem: {
    fontSize: 15,
    color: '#4ade80',
    lineHeight: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666688',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
