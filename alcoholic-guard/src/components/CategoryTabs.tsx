import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CategoryId } from '../models/types';
import { CATEGORIES } from '../constants/presets';

type FilterCategory = CategoryId | 'all';

interface CategoryTabsProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.tab, selected === 'all' && styles.tabActive]}
        onPress={() => onSelect('all')}
      >
        <Text style={[styles.tabText, selected === 'all' && styles.tabTextActive]}>
          すべて
        </Text>
      </TouchableOpacity>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.tab, selected === cat.id && styles.tabActive]}
          onPress={() => onSelect(cat.id)}
        >
          <Text style={[styles.tabText, selected === cat.id && styles.tabTextActive]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a4a',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    color: '#8888aa',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
