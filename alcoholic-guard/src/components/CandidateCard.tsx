import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AvoidanceCandidate } from '../models/types';

interface CandidateCardProps {
  candidate: AvoidanceCandidate;
  onPress: (candidate: AvoidanceCandidate) => void;
}

export function CandidateCard({ candidate, onPress }: CandidateCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(candidate)}
      activeOpacity={0.7}
    >
      <Text style={styles.label} numberOfLines={2}>
        {candidate.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
