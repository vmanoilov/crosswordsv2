// Crossword Cell Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
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
      <View style={[styles.blockedCell, { width: size, height: size }]} />
    );
  }

  const isCorrect = cell.isCorrect;
  const cellBackground = cell.isSelected
    ? 'rgba(100,200,255,0.5)'
    : cell.isHighlighted
    ? 'rgba(100,200,255,0.25)'
    : 'rgba(255,255,255,0.9)';

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { 
          width: size, 
          height: size,
          backgroundColor: cellBackground,
        },
        isCorrect === true && styles.correctCell,
        isCorrect === false && styles.incorrectCell,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {cell.number && (
        <Text style={[styles.number, { fontSize: size * 0.22 }]}>
          {cell.number}
        </Text>
      )}
      <TextInput
        ref={inputRef}
        style={[
          styles.letter,
          { fontSize: size * 0.5 },
        ]}
        value={cell.userInput}
        onChangeText={(text) => onChangeText(text.toUpperCase().slice(-1))}
        maxLength={1}
        autoCapitalize="characters"
        onFocus={onPress}
        selectTextOnFocus
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blockedCell: {
    backgroundColor: '#1a1a2e',
  },
  number: {
    position: 'absolute',
    top: 1,
    left: 2,
    color: '#333',
    fontWeight: '600',
  },
  letter: {
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
  },
  correctCell: {
    backgroundColor: 'rgba(100,255,100,0.3)',
  },
  incorrectCell: {
    backgroundColor: 'rgba(255,100,100,0.3)',
  },
});
