// Enhanced Clue List Component - Списък с подсказки
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PlacedWord } from '../types';

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
        <View style={[styles.clueNumber, isSelected && styles.selectedClueNumber]}>
          <Text style={styles.clueNumberText}>{clue.number}</Text>
        </View>
        <Text style={[styles.clueText, isSelected && styles.selectedClueText]} numberOfLines={2}>
          {clue.clue}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={25} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          style={styles.gradient}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Хоризонтално = Across */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="arrow-forward" size={14} color="rgba(34, 211, 238, 0.9)" />
                <Text style={styles.sectionTitle}>ХОРИЗОНТАЛНО</Text>
              </View>
              {acrossClues.map(renderClue)}
            </View>

            {/* Вертикално = Down */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="arrow-down" size={14} color="rgba(236, 72, 153, 0.9)" />
                <Text style={styles.sectionTitle}>ВЕРТИКАЛНО</Text>
              </View>
              {downClues.map(renderClue)}
            </View>
          </ScrollView>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 320,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blur: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  clueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  selectedClue: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  clueNumber: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  selectedClueNumber: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
  },
  clueNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  clueText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  selectedClueText: {
    color: '#fff',
  },
});
