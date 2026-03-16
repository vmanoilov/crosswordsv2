// Clue List Component - Списък с подсказки
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PlacedWord } from '../types';
import { GlassCard } from './GlassCard';

interface ClueListProps {
  acrossClues: PlacedWord[];
  downClues: PlacedWord[];
  selectedClue: PlacedWord | null;
  onCluePress: (clue: PlacedWord) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  acrossClues,
  downClues,
  selectedClue,
  onCluePress,
}) => {
  const renderClue = (clue: PlacedWord) => {
    const isSelected = selectedClue?.number === clue.number && selectedClue?.direction === clue.direction;
    
    return (
      <TouchableOpacity
        key={`${clue.direction}-${clue.number}`}
        style={[styles.clueItem, isSelected && styles.selectedClue]}
        onPress={() => onCluePress(clue)}
        activeOpacity={0.7}
      >
        <Text style={styles.clueNumber}>{clue.number}.</Text>
        <Text style={[styles.clueText, isSelected && styles.selectedClueText]}>
          {clue.clue}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <GlassCard style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Хоризонтално = Across */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ХОРИЗОНТАЛНО</Text>
          {acrossClues.map(renderClue)}
        </View>

        {/* Вертикално = Down */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ВЕРТИКАЛНО</Text>
          {downClues.map(renderClue)}
        </View>
      </ScrollView>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  clueItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selectedClue: {
    backgroundColor: 'rgba(100,200,255,0.2)',
  },
  clueNumber: {
    color: 'rgba(100,200,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    minWidth: 24,
  },
  clueText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  selectedClueText: {
    color: '#fff',
  },
});
