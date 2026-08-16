import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { AvoidanceCandidate } from '../models/types';
import { CandidateCard } from './CandidateCard';

interface CandidateGridProps {
  candidates: AvoidanceCandidate[];
  onCandidatePress: (candidate: AvoidanceCandidate) => void;
}

export function CandidateGrid({ candidates, onCandidatePress }: CandidateGridProps) {
  return (
    <FlatList
      data={candidates}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <CandidateCard candidate={item} onPress={onCandidatePress} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
});
