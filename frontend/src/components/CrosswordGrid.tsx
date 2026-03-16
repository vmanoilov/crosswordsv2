// Enhanced Crossword Grid Component
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TextInput, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CrosswordPuzzle, Cell } from '../types';
import { CrosswordCell } from './CrosswordCell';

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
  const gridPadding = 24;
  const gridSize = puzzle.grid.width;
  const maxGridWidth = screenWidth - gridPadding * 2 - 32;
  const cellSize = Math.floor(maxGridWidth / gridSize);

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
        <View style={styles.gridWrapper}>
          <BlurView intensity={20} tint="dark" style={styles.gridBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
              style={styles.gridGradient}
            >
              <View style={styles.grid}>
                {puzzle.grid.cells.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
                  </View>
                ))}
              </View>
            </LinearGradient>
          </BlurView>
        </View>
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
  gridWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gridBlur: {
    flex: 1,
  },
  gridGradient: {
    padding: 8,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
