import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface FeedbackToastProps {
  message: string | null;
  toastKey: number; // メッセージ文言が同じでも再表示させるためのトリガー
  duration?: number;
}

// OKタップを要求しない一時表示フィードバック。durationミリ秒後に自動で消える。
export function FeedbackToast({ message, toastKey, duration = 1600 }: FeedbackToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (!message || toastKey === 0) return;

    setDisplayMessage(message);
    setVisible(true);
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();

    const hideTimer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setVisible(false);
      });
    }, duration);

    return () => clearTimeout(hideTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastKey]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Text style={styles.toastText}>{displayMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#2a2a4a',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 20,
  },
  toastText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
});
