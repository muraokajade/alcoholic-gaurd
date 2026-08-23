import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ScaleInputProps {
  label: string;
  value: number; // 0-10
  onChange: (value: number) => void;
}

const SCALE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function ScaleInput({ label, value, onChange }: ScaleInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value} / 10</Text>
      </View>
      <View style={styles.row}>
        {SCALE.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.button, value === n && styles.buttonActive]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.buttonText, value === n && styles.buttonTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ccccdd',
  },
  value: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#e94560',
  },
  buttonText: {
    color: '#8888aa',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
});
