// Enhanced Crossword Cell Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cell } from '../types';

interface CrosswordCellProps {
  cell: Cell;
  size: number;
  onPress: () => void;
  onChangeText: (text: string) => void;
  inputRef?: React.RefObject<TextInput>;
}

export const CrosswordCell: React.FC<CrosswordCellProps> = ({
  cell,
  size,
  onPress,
  onChangeText,
  inputRef,
}) => {
  if (cell.isBlocked) {
    return (
      <View style={[styles.blockedCell, { width: size, height: size }]}>
        <LinearGradient
          colors={['rgba(15, 15, 30, 0.95)', 'rgba(10, 10, 25, 0.98)']}
          style={styles.blockedGradient}
        />
      </View>
    );
  }

  const isCorrect = cell.isCorrect;
  
  let cellColors: [string, string] = ['rgba(255,255,255,0.95)', 'rgba(245,245,250,0.9)'];
  let borderColor = 'rgba(0,0,0,0.15)';
  
  if (cell.isSelected) {
    cellColors = ['rgba(139, 92, 246, 0.35)', 'rgba(99, 102, 241, 0.25)'];
    borderColor = 'rgba(139, 92, 246, 0.5)';
  } else if (cell.isHighlighted) {
    cellColors = ['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)'];
    borderColor = 'rgba(139, 92, 246, 0.3)';
  }
  
  if (isCorrect === true) {
    cellColors = ['rgba(34, 197, 94, 0.3)', 'rgba(22, 163, 74, 0.2)'];
    borderColor = 'rgba(34, 197, 94, 0.5)';
  } else if (isCorrect === false) {
    cellColors = ['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.2)'];
    borderColor = 'rgba(239, 68, 68, 0.5)';
  }

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { 
          width: size, 
          height: size,
          borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={cellColors}
        style={styles.cellGradient}
      >
        {cell.number && (
          <Text style={[styles.number, { fontSize: Math.max(8, size * 0.2) }]}>
            {cell.number}
          </Text>
        )}
        <TextInput
          ref={inputRef}
          style={[
            styles.letter,
            { fontSize: Math.max(12, size * 0.45) },
            (cell.isSelected || cell.isHighlighted) && styles.highlightedLetter,
          ]}
          value={cell.userInput}
          onChangeText={(text) => onChangeText(text.toUpperCase().slice(-1))}
          maxLength={1}
          autoCapitalize="characters"
          onFocus={onPress}
          selectTextOnFocus
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cellGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedCell: {
    overflow: 'hidden',
  },
  blockedGradient: {
    flex: 1,
  },
  number: {
    position: 'absolute',
    top: 1,
    left: 2,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '700',
  },
  letter: {
    color: '#1a1a2e',
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
  },
  highlightedLetter: {
    color: '#fff',
  },
});
