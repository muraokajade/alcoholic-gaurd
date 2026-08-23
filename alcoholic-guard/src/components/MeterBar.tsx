import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MeterBarProps {
  label: string;
  value: number; // 0-10
  color?: string;
}

export function MeterBar({ label, value, color = '#4ade80' }: MeterBarProps) {
  const clamped = Math.max(0, Math.min(10, value));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped * 10}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{clamped}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 76,
    fontSize: 13,
    color: '#aaaacc',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a4a',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 20,
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'right',
  },
});
