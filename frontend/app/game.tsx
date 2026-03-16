// Игра Кръстословица - Game Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CrosswordGrid } from '../src/components/CrosswordGrid';
import { ClueList } from '../src/components/ClueList';
import { GlassButton } from '../src/components/GlassButton';
import { GlassCard } from '../src/components/GlassCard';
import { generateCrossword, checkSolution, getWordCells } from '../src/engine/crosswordEngine';
import { CrosswordPuzzle, PlacedWord, GameSettings } from '../src/types';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ size: string; difficulty: string }>();
  
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [highlightedCells, setHighlightedCells] = useState<{ row: number; col: number }[]>([]);
  const [selectedClue, setSelectedClue] = useState<PlacedWord | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showClues, setShowClues] = useState(true);

  // Generate puzzle on mount
  useEffect(() => {
    const settings: GameSettings = {
      size: (params.size as 'small' | 'medium' | 'large') || 'medium',
      difficulty: (params.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
    };
    const newPuzzle = generateCrossword(settings);
    setPuzzle(newPuzzle);
  }, [params.size, params.difficulty]);

  // Timer
  useEffect(() => {
    if (isComplete) return;
    
    const timer = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle cell press
  const handleCellPress = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid.cells[row][col].isBlocked) return;

    // If same cell, toggle direction
    if (selectedCell?.row === row && selectedCell?.col === col) {
      const newDirection = selectedDirection === 'across' ? 'down' : 'across';
      setSelectedDirection(newDirection);
      const cells = getWordCells(puzzle, row, col, newDirection);
      setHighlightedCells(cells);
      
      // Find the clue for this word
      const clue = puzzle.placedWords.find(w => {
        if (w.direction !== newDirection) return false;
        const wordCells = getWordCells(puzzle, w.startRow, w.startCol, w.direction);
        return wordCells.some(c => c.row === row && c.col === col);
      });
      setSelectedClue(clue || null);
    } else {
      setSelectedCell({ row, col });
      const cells = getWordCells(puzzle, row, col, selectedDirection);
      setHighlightedCells(cells);
      
      // Find the clue for this word
      const clue = puzzle.placedWords.find(w => {
        if (w.direction !== selectedDirection) return false;
        const wordCells = getWordCells(puzzle, w.startRow, w.startCol, w.direction);
        return wordCells.some(c => c.row === row && c.col === col);
      });
      setSelectedClue(clue || null);
    }
  }, [puzzle, selectedCell, selectedDirection]);

  // Handle cell change
  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    if (!puzzle) return;

    setPuzzle(prev => {
      if (!prev) return prev;
      
      const newCells = prev.grid.cells.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return { ...c, userInput: value };
          }
          return c;
        })
      );

      return {
        ...prev,
        grid: {
          ...prev.grid,
          cells: newCells,
        },
      };
    });

    // Auto-advance to next cell if value entered
    if (value && selectedCell) {
      const cells = highlightedCells;
      const currentIndex = cells.findIndex(c => c.row === row && c.col === col);
      if (currentIndex < cells.length - 1) {
        const nextCell = cells[currentIndex + 1];
        setSelectedCell(nextCell);
      }
    }
  }, [puzzle, selectedCell, highlightedCells]);

  // Handle clue press
  const handleCluePress = useCallback((clue: PlacedWord) => {
    if (!puzzle) return;
    
    setSelectedClue(clue);
    setSelectedDirection(clue.direction);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
    
    const cells = getWordCells(puzzle, clue.startRow, clue.startCol, clue.direction);
    setHighlightedCells(cells);
  }, [puzzle]);

  // Check solution
  const handleCheckSolution = useCallback(() => {
    if (!puzzle) return;

    // Update cells with correct/incorrect status
    setPuzzle(prev => {
      if (!prev) return prev;
      
      const newCells = prev.grid.cells.map((row) =>
        row.map((cell) => {
          if (cell.isBlocked) return cell;
          const isCorrect = cell.userInput.toUpperCase() === cell.letter;
          return { ...cell, isCorrect };
        })
      );

      return {
        ...prev,
        grid: {
          ...prev.grid,
          cells: newCells,
        },
      };
    });

    const complete = checkSolution(puzzle);
    if (complete) {
      setIsComplete(true);
      Alert.alert(
        'Поздравления!',
        `Решихте кръстословицата за ${formatTime(elapsedTime)}!`,
        [{ text: 'Благодаря', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Не съвсем...',
        'Има грешни отговори. Опитайте отново!',
        [{ text: 'Добре', style: 'default' }]
      );
    }
  }, [puzzle, elapsedTime]);

  // Reveal solution
  const handleRevealSolution = useCallback(() => {
    Alert.alert(
      'Покажи решението?',
      'Сигурни ли сте, че искате да видите отговорите?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Покажи',
          style: 'destructive',
          onPress: () => {
            if (!puzzle) return;
            
            setPuzzle(prev => {
              if (!prev) return prev;
              
              const newCells = prev.grid.cells.map((row) =>
                row.map((cell) => {
                  if (cell.isBlocked) return cell;
                  return { ...cell, userInput: cell.letter || '' };
                })
              );

              return {
                ...prev,
                grid: {
                  ...prev.grid,
                  cells: newCells,
                },
              };
            });
            
            setIsComplete(true);
          },
        },
      ]
    );
  }, [puzzle]);

  // Go back
  const handleBack = () => {
    router.back();
  };

  if (!puzzle) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0f0c29', '#302b63', '#24243e']}
          style={styles.background}
        />
        <Text style={styles.loadingText}>Генериране на кръстословица...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.background}
      />
      
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <GlassCard style={styles.timerCard}>
              <Ionicons name="time-outline" size={18} color="rgba(100,200,255,0.9)" />
              <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            </GlassCard>
            
            <TouchableOpacity onPress={() => setShowClues(!showClues)} style={styles.toggleButton}>
              <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                <Ionicons 
                  name={showClues ? "list" : "grid"} 
                  size={24} 
                  color="#fff" 
                />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Selected Clue Display */}
          {selectedClue && (
            <GlassCard style={styles.selectedClueCard}>
              <Text style={styles.selectedClueNumber}>
                {selectedClue.number}. {selectedClue.direction === 'across' ? 'Хоризонтално' : 'Вертикално'}
              </Text>
              <Text style={styles.selectedClueText}>{selectedClue.clue}</Text>
            </GlassCard>
          )}

          {/* Main Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Crossword Grid */}
            <CrosswordGrid
              puzzle={puzzle}
              selectedCell={selectedCell}
              highlightedCells={highlightedCells}
              onCellPress={handleCellPress}
              onCellChange={handleCellChange}
            />

            {/* Clue List */}
            {showClues && (
              <View style={styles.clueSection}>
                <ClueList
                  acrossClues={puzzle.acrossClues}
                  downClues={puzzle.downClues}
                  selectedClue={selectedClue}
                  onCluePress={handleCluePress}
                />
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassButton
              title="Провери"
              onPress={handleCheckSolution}
              style={styles.actionButton}
            />
            <GlassButton
              title="Решение"
              onPress={handleRevealSolution}
              style={styles.actionButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(200, 100, 255, 0.08)',
    bottom: 100,
    left: -30,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  backBlur: {
    padding: 10,
  },
  toggleButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  selectedClueCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
  },
  selectedClueNumber: {
    color: 'rgba(100,200,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedClueText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  clueSection: {
    marginTop: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
