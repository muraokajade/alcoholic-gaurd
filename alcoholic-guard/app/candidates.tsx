import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryTabs } from '../src/components/CategoryTabs';
import { CandidateGrid } from '../src/components/CandidateGrid';
import { PRESET_CANDIDATES } from '../src/constants/presets';
import { AvoidanceCandidate, CategoryId } from '../src/models/types';

type FilterCategory = CategoryId | 'all';

export default function CandidatesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  const filteredCandidates = useMemo(() => {
    if (selectedCategory === 'all') {
      return PRESET_CANDIDATES;
    }
    return PRESET_CANDIDATES.filter((c) =>
      c.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  const handleCandidatePress = (candidate: AvoidanceCandidate) => {
    Alert.alert(
      'これをやる',
      `「${candidate.label}」を選択しました`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CategoryTabs
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>
      <CandidateGrid
        candidates={filteredCandidates}
        onCandidatePress={handleCandidatePress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
});
