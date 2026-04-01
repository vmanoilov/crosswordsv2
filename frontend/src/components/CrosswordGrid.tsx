import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Keyboard, Platform, ScrollView } from 'react-native';
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
  onBackspace: () => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  puzzle,
  selectedCell,
  highlightedCells,
  onCellPress,
  onCellChange,
  onBackspace,
}) => {
  const hiddenInputRef = useRef<TextInput>(null);
  
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 24;
  const gridSize = puzzle.grid.width;
  
  // Calculate cell size so it fits the screen, but give it a minimum size so it doesn't get too small
  const minCellSize = 32; 
  const calculatedCellSize = Math.floor((screenWidth - gridPadding * 2) / gridSize);
  const cellSize = Math.max(calculatedCellSize, minCellSize);

  // Automatically focus the hidden input when a cell is selected
  useEffect(() => {
    if (selectedCell) {
      hiddenInputRef.current?.focus();
    } else {
      Keyboard.dismiss();
    }
  }, [selectedCell]);

  const handleCellPress = (row: number, col: number) => {
    onCellPress(row, col);
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace') {
      onBackspace();
    }
  };

  const handleChangeText = (text: string) => {
    if (selectedCell && text.length > 0) {
      // Pass only the last character in case of rapid typing
      onCellChange(selectedCell.row, selectedCell.col, text.slice(-1));
    }
  };

  // Determine current value to reset input text to allow repeated characters and backspace handling
  const currentValue = selectedCell ? puzzle.grid.cells[selectedCell.row][selectedCell.col].userInput : '';

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainerHorizontal}
        bounces={false}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainerVertical}
          bounces={false}
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
                      {row.map((cell, colIndex) => (
                        <CrosswordCell
                          key={`${rowIndex}-${colIndex}`}
                          cell={{
                            ...cell,
                            isSelected: selectedCell?.row === rowIndex && selectedCell?.col === colIndex,
                            isHighlighted: highlightedCells.some(c => c.row === rowIndex && c.col === colIndex),
                          }}
                          size={cellSize}
                          onPress={() => handleCellPress(rowIndex, colIndex)}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Hidden Global TextInput for the Grid */}
      <TextInput
        ref={hiddenInputRef}
        style={styles.hiddenInput}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        value={currentValue}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        caretHidden={true}
        showSoftInputOnFocus={true}
        maxLength={2} // Allow space for the next typed char before it gets reset
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainerHorizontal: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  scrollContainerVertical: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
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
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: -1000,
  },
});
