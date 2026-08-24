import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { logAction } from '../src/storage';

const TAP_TARGET = 20;
const MESSAGE_POOL = ['まだいける', '酒じゃなくこっちを選んだ'];

function getMessage(tapNumber: number): string {
  if (tapNumber === 1) return '今の1回もガード成功';
  if (tapNumber === TAP_TARGET) return 'よし、次の行動へ';
  if (tapNumber === Math.floor(TAP_TARGET / 2)) return '半分まで来た';
  if (tapNumber >= TAP_TARGET - 4) return 'あと少し';
  return MESSAGE_POOL[tapNumber % MESSAGE_POOL.length];
}

export default function TapGuardScreen() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [logged, setLogged] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const cleared = count >= TAP_TARGET;

  const handleTap = () => {
    if (cleared) return;
    const next = count + 1;
    setCount(next);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();

    if (next >= TAP_TARGET) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (!logged) {
        setLogged(true);
        logAction('tap-guard-20', '20 TAP GUARD').catch(() => {});
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>20 TAP GUARD</Text>
        <Text style={styles.counter}>
          {count} / {TAP_TARGET}
        </Text>
        <Text style={styles.message}>
          {cleared ? 'GUARD CLEAR' : count === 0 ? '20回タップして流れを切り替える' : getMessage(count)}
        </Text>

        {!cleared ? (
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity style={styles.tapButton} onPress={handleTap} activeOpacity={0.7}>
              <Text style={styles.tapButtonText}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={() => router.back()}>
            <Text style={styles.nextButtonText}>次の行動へ</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    letterSpacing: 2,
    marginBottom: 24,
  },
  counter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#ccccdd',
    marginBottom: 48,
    textAlign: 'center',
  },
  tapButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tapButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nextButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
