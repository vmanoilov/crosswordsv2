// Crossword Grid Component
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TextInput, ScrollView } from 'react-native';
import { CrosswordPuzzle, Cell } from '../types';
import { CrosswordCell } from './CrosswordCell';
import { GlassCard } from './GlassCard';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  highlightedCells: { row: number; col: number }[];
  onCellPress: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: string) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  puzzle,
  selectedCell,
  highlightedCells,
  onCellPress,
  onCellChange,
}) => {
  const inputRefs = useRef<Map<string, React.RefObject<TextInput>>>(new Map());
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 20;
  const gridSize = puzzle.grid.width;
  const cellSize = Math.floor((screenWidth - gridPadding * 2 - 40) / gridSize);

  const getInputRef = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    if (!inputRefs.current.has(key)) {
      inputRefs.current.set(key, React.createRef<TextInput>());
    }
    return inputRefs.current.get(key)!;
  }, []);

  const isHighlighted = useCallback((row: number, col: number) => {
    return highlightedCells.some(c => c.row === row && c.col === col);
  }, [highlightedCells]);

  const isSelected = useCallback((row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  }, [selectedCell]);

  const renderCell = useCallback((cell: Cell, row: number, col: number) => {
    const cellWithState = {
      ...cell,
      isSelected: isSelected(row, col),
      isHighlighted: isHighlighted(row, col),
    };

    return (
      <CrosswordCell
        key={`${row}-${col}`}
        cell={cellWithState}
        size={cellSize}
        onPress={() => onCellPress(row, col)}
        onChangeText={(text) => onCellChange(row, col, text)}
        inputRef={getInputRef(row, col)}
      />
    );
  }, [cellSize, isSelected, isHighlighted, onCellPress, onCellChange, getInputRef]);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <GlassCard style={styles.gridContainer}>
          <View style={styles.grid}>
            {puzzle.grid.cells.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
              </View>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 8,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
