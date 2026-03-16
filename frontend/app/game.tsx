// Игра Кръстословица - Game Screen с Save/Resume и Glassmorphism
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  AppState,
  AppStateStatus,
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
import {
  saveGame,
  loadSavedGame,
  deleteSavedGame,
  updateGameStats,
  formatTime,
} from '../src/services/gameStorage';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ size: string; difficulty: string; resume: string }>();
  
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [highlightedCells, setHighlightedCells] = useState<{ row: number; col: number }[]>([]);
  const [selectedClue, setSelectedClue] = useState<PlacedWord | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showClues, setShowClues] = useState(true);
  const [settings, setSettings] = useState<GameSettings>({
    size: 'medium',
    difficulty: 'medium',
  });
  
  const appState = useRef(AppState.currentState);

  // Load or generate puzzle on mount
  useEffect(() => {
    const initGame = async () => {
      const gameSettings: GameSettings = {
        size: (params.size as 'small' | 'medium' | 'large') || 'medium',
        difficulty: (params.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      };
      setSettings(gameSettings);

      // Check if resuming
      if (params.resume === 'true') {
        const savedGame = await loadSavedGame();
        if (savedGame) {
          setPuzzle(savedGame.puzzle);
          setElapsedTime(savedGame.elapsedTime);
          return;
        }
      }

      // Generate new puzzle
      const newPuzzle = generateCrossword(gameSettings);
      setPuzzle(newPuzzle);
      
      // Delete any old saved game when starting new
      await deleteSavedGame();
    };

    initGame();
  }, [params.size, params.difficulty, params.resume]);

  // Auto-save when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [puzzle, elapsedTime, settings]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App is going to background - save game
      if (puzzle && !isComplete) {
        await saveGame(puzzle, settings, elapsedTime);
      }
    }
    appState.current = nextAppState;
  };

  // Timer
  useEffect(() => {
    if (isComplete || !puzzle) return;
    
    const timer = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, puzzle]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!puzzle || isComplete) return;

    const autoSave = setInterval(async () => {
      await saveGame(puzzle, settings, elapsedTime);
    }, 30000);

    return () => clearInterval(autoSave);
  }, [puzzle, settings, elapsedTime, isComplete]);

  // Handle cell press
  const handleCellPress = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid.cells[row][col].isBlocked) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      const newDirection = selectedDirection === 'across' ? 'down' : 'across';
      setSelectedDirection(newDirection);
      const cells = getWordCells(puzzle, row, col, newDirection);
      setHighlightedCells(cells);
      
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
            return { ...c, userInput: value, isCorrect: null };
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

    // Auto-advance to next cell
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
  const handleCheckSolution = useCallback(async () => {
    if (!puzzle) return;

    setPuzzle(prev => {
      if (!prev) return prev;
      
      const newCells = prev.grid.cells.map((row) =>
        row.map((cell) => {
          if (cell.isBlocked || !cell.letter) return cell;
          const isCorrect = cell.userInput.toUpperCase() === cell.letter.toUpperCase();
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
      await deleteSavedGame();
      await updateGameStats(true, elapsedTime);
      
      Alert.alert(
        '🎉 Поздравления!',
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
          onPress: async () => {
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
            await deleteSavedGame();
            await updateGameStats(false, elapsedTime);
          },
        },
      ]
    );
  }, [puzzle, elapsedTime]);

  // Save and go back
  const handleBack = async () => {
    if (puzzle && !isComplete) {
      await saveGame(puzzle, settings, elapsedTime);
    }
    router.back();
  };

  // Clear current word
  const handleClearWord = useCallback(() => {
    if (!puzzle || highlightedCells.length === 0) return;

    setPuzzle(prev => {
      if (!prev) return prev;
      
      const newCells = prev.grid.cells.map((row, ri) =>
        row.map((cell, ci) => {
          const isInWord = highlightedCells.some(c => c.row === ri && c.col === ci);
          if (isInWord) {
            return { ...cell, userInput: '', isCorrect: null };
          }
          return cell;
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
  }, [puzzle, highlightedCells]);

  if (!puzzle) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']}
          style={styles.background}
        />
        <BlurView intensity={30} tint="dark" style={styles.loadingCard}>
          <Ionicons name="grid" size={40} color="rgba(139, 92, 246, 0.9)" />
          <Text style={styles.loadingText}>Генериране на кръстословица...</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <LinearGradient
        colors={['#0a0a1a', '#1a1a3a', '#0f0f2a', '#151530']}
        style={styles.background}
      />
      
      {/* Decorative orbs */}
      <View style={styles.orb1}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.25)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.orbGradient}
        />
      </View>
      <View style={styles.orb2}>
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.2)', 'rgba(244, 114, 182, 0.08)']}
          style={styles.orbGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.timerContainer}>
              <BlurView intensity={30} tint="dark" style={styles.timerBlur}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']}
                  style={styles.timerGradient}
                >
                  <Ionicons name="time-outline" size={16} color="rgba(34, 211, 238, 0.9)" />
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </LinearGradient>
              </BlurView>
            </View>
            
            <TouchableOpacity onPress={() => setShowClues(!showClues)} style={styles.headerButton}>
              <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                <Ionicons 
                  name={showClues ? "list" : "grid"} 
                  size={22} 
                  color="#fff" 
                />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Selected Clue Display */}
          {selectedClue && (
            <View style={styles.selectedClueContainer}>
              <BlurView intensity={25} tint="dark" style={styles.selectedClueBlur}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                  style={styles.selectedClueGradient}
                >
                  <View style={styles.selectedClueHeader}>
                    <View style={styles.clueNumberBadge}>
                      <Text style={styles.clueNumberText}>{selectedClue.number}</Text>
                    </View>
                    <Text style={styles.selectedClueDirection}>
                      {selectedClue.direction === 'across' ? 'Хоризонтално' : 'Вертикално'}
                    </Text>
                  </View>
                  <Text style={styles.selectedClueText}>{selectedClue.clue}</Text>
                </LinearGradient>
              </BlurView>
            </View>
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
            <TouchableOpacity style={styles.actionButton} onPress={handleClearWord}>
              <BlurView intensity={25} tint="dark" style={styles.actionBlur}>
                <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.actionText}>Изчисти</Text>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.checkButton]} onPress={handleCheckSolution}>
              <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                <LinearGradient
                  colors={['rgba(34, 211, 238, 0.3)', 'rgba(56, 189, 248, 0.15)']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.checkText}>Провери</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleRevealSolution}>
              <BlurView intensity={25} tint="dark" style={styles.actionBlur}>
                <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.actionText}>Решение</Text>
              </BlurView>
            </TouchableOpacity>
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
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 100,
    left: -40,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
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
    paddingVertical: 10,
  },
  headerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerButtonBlur: {
    padding: 12,
  },
  timerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerBlur: {
    flex: 1,
  },
  timerGradient: {
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
  selectedClueContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedClueBlur: {
    flex: 1,
  },
  selectedClueGradient: {
    padding: 14,
  },
  selectedClueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  clueNumberBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clueNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedClueDirection: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
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
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  checkButton: {
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  actionBlur: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
