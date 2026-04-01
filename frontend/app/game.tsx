// Игра Кръстословица - Game Screen с Sound Effects и Scoring System
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
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CrosswordGrid } from '../src/components/CrosswordGrid';
import { ClueList } from '../src/components/ClueList';
import { ScoreModal } from '../src/components/ScoreModal';
import { generateCrossword, checkSolution, getWordCells } from '../src/engine/crosswordEngine';
import { CrosswordPuzzle, PlacedWord, GameSettings } from '../src/types';
import {
  saveGame,
  loadSavedGame,
  deleteSavedGame,
  updateGameStats,
  formatTime,
} from '../src/services/gameStorage';
import {
  calculateScore,
  saveGameScore,
  ScoreBreakdown,
  GameScore,
  getHighScores,
} from '../src/services/scoringService';

const playHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
  try {
    switch (type) {
      case 'light': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'heavy': await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'error': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
      case 'warning': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
    }
  } catch (error) {}
};

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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    size: 'medium',
    difficulty: 'medium',
  });
  
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const appState = useRef(AppState.currentState);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const initGame = async () => {
      const gameSettings: GameSettings = {
        size: (params.size as 'small' | 'medium' | 'large') || 'medium',
        difficulty: (params.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      };
      setSettings(gameSettings);

      if (params.resume === 'true') {
        const savedGame = await loadSavedGame();
        if (savedGame) {
          setPuzzle(savedGame.puzzle);
          setElapsedTime(savedGame.elapsedTime);
          playHaptic('light');
          return;
        }
      }

      const newPuzzle = generateCrossword(gameSettings);
      setPuzzle(newPuzzle);
      await deleteSavedGame();
      playHaptic('medium');
    };

    initGame();
  }, [params.size, params.difficulty, params.resume]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [puzzle, elapsedTime, settings, isComplete]);

  useEffect(() => {
    const kbShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const kbHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      kbShow.remove();
      kbHide.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      if (puzzle && !isComplete) await saveGame(puzzle, settings, elapsedTime);
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    if (isComplete || !puzzle) return;
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isComplete, puzzle]);

  useEffect(() => {
    if (!puzzle || isComplete) return;
    const autoSave = setInterval(async () => await saveGame(puzzle, settings, elapsedTime), 30000);
    return () => clearInterval(autoSave);
  }, [puzzle, settings, elapsedTime, isComplete]);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid.cells[row][col].isBlocked) return;

    playHaptic('light');

    let newDirection = selectedDirection;
    if (selectedCell?.row === row && selectedCell?.col === col) {
      newDirection = selectedDirection === 'across' ? 'down' : 'across';
      setSelectedDirection(newDirection);
    } else {
      setSelectedCell({ row, col });
    }
    
    const cells = getWordCells(puzzle, row, col, newDirection);
    setHighlightedCells(cells);
    
    const clue = puzzle.placedWords.find(w => {
      if (w.direction !== newDirection) return false;
      const wordCells = getWordCells(puzzle, w.startRow, w.startCol, w.direction);
      return wordCells.some(c => c.row === row && c.col === col);
    });
    setSelectedClue(clue || null);

    // Auto-scroll slightly to keep grid centered
    if (isKeyboardVisible) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [puzzle, selectedCell, selectedDirection, isKeyboardVisible]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    if (!puzzle) return;

    playHaptic('light');

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
      return { ...prev, grid: { ...prev.grid, cells: newCells } };
    });

    if (value && selectedCell) {
      const cells = highlightedCells;
      const currentIndex = cells.findIndex(c => c.row === row && c.col === col);
      if (currentIndex < cells.length - 1) {
        setSelectedCell(cells[currentIndex + 1]);
      }
    }
  }, [puzzle, selectedCell, highlightedCells]);

  const handleBackspace = useCallback(() => {
    if (!puzzle || !selectedCell) return;
    
    setPuzzle(prev => {
      if (!prev) return prev;
      const newCells = prev.grid.cells.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === selectedCell.row && ci === selectedCell.col) {
            return { ...c, userInput: '', isCorrect: null };
          }
          return c;
        })
      );
      return { ...prev, grid: { ...prev.grid, cells: newCells } };
    });

    const cells = highlightedCells;
    const currentIndex = cells.findIndex(c => c.row === selectedCell.row && c.col === selectedCell.col);
    if (currentIndex > 0) {
      setSelectedCell(cells[currentIndex - 1]);
    }
  }, [puzzle, selectedCell, highlightedCells]);

  const handleCluePress = useCallback((clue: PlacedWord) => {
    if (!puzzle) return;
    playHaptic('medium');
    setSelectedClue(clue);
    setSelectedDirection(clue.direction);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
    const cells = getWordCells(puzzle, clue.startRow, clue.startCol, clue.direction);
    setHighlightedCells(cells);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [puzzle]);

  const countWordsFound = useCallback((): number => {
    if (!puzzle) return 0;
    let found = 0;
    for (const word of puzzle.placedWords) {
      const cells = getWordCells(puzzle, word.startRow, word.startCol, word.direction);
      const isWordComplete = cells.every(({ row, col }) => {
        const cell = puzzle.grid.cells[row][col];
        return cell.userInput.toUpperCase() === cell.letter?.toUpperCase();
      });
      if (isWordComplete) found++;
    }
    return found;
  }, [puzzle]);

  const handleCheckSolution = useCallback(async () => {
    if (!puzzle) return;

    let hasErrors = false;

    setPuzzle(prev => {
      if (!prev) return prev;
      const newCells = prev.grid.cells.map((row) =>
        row.map((cell) => {
          if (cell.isBlocked || !cell.letter) return cell;
          const isCorrect = cell.userInput.toUpperCase() === cell.letter.toUpperCase();
          if (!isCorrect && cell.userInput) hasErrors = true;
          return { ...cell, isCorrect };
        })
      );
      return { ...prev, grid: { ...prev.grid, cells: newCells } };
    });

    if (hasErrors) setErrorsCount(prev => prev + 1);

    const complete = checkSolution(puzzle);
    if (complete) {
      playHaptic('success');
      setIsComplete(true);
      await deleteSavedGame();
      await updateGameStats(true, elapsedTime);
      
      const wordsFound = puzzle.placedWords.length;
      const totalWords = puzzle.placedWords.length;
      const breakdown = calculateScore(settings, elapsedTime, wordsFound, totalWords, hintsUsed, errorsCount);
      
      setScoreBreakdown(breakdown);
      
      const highScores = await getHighScores();
      const currentHigh = highScores[settings.difficulty][settings.size];
      const isHighScore = !currentHigh || breakdown.totalScore > currentHigh.score;
      setIsNewHighScore(isHighScore);
      
      const gameScore: GameScore = {
        id: Date.now().toString(),
        score: breakdown.totalScore,
        breakdown,
        settings,
        timeSeconds: elapsedTime,
        wordsFound,
        totalWords,
        hintsUsed,
        errorsCount,
        completedAt: Date.now(),
      };
      await saveGameScore(gameScore);
      setShowScoreModal(true);
    } else {
      playHaptic('error');
      Alert.alert('Не съвсем...', 'Има грешни отговори. Опитайте отново!', [{ text: 'Добре' }]);
    }
  }, [puzzle, elapsedTime, settings, hintsUsed, errorsCount]);

  const handleRevealSolution = useCallback(() => {
    playHaptic('warning');
    Alert.alert(
      'Покажи решението?',
      'Това ще намали резултата ви. Сигурни ли сте?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Покажи',
          style: 'destructive',
          onPress: async () => {
            if (!puzzle) return;
            setHintsUsed(prev => prev + 1);
            setPuzzle(prev => {
              if (!prev) return prev;
              const newCells = prev.grid.cells.map((row) =>
                row.map((cell) => {
                  if (cell.isBlocked) return cell;
                  return { ...cell, userInput: cell.letter || '' };
                })
              );
              return { ...prev, grid: { ...prev.grid, cells: newCells } };
            });
            playHaptic('heavy');
            setIsComplete(true);
            await deleteSavedGame();
            await updateGameStats(false, elapsedTime);
            
            const wordsFound = puzzle.placedWords.length;
            const breakdown = calculateScore(settings, elapsedTime, wordsFound, wordsFound, hintsUsed + 1, errorsCount);
            setScoreBreakdown(breakdown);
            setIsNewHighScore(false);
            
            const gameScore: GameScore = {
              id: Date.now().toString(),
              score: breakdown.totalScore,
              breakdown,
              settings,
              timeSeconds: elapsedTime,
              wordsFound,
              totalWords: wordsFound,
              hintsUsed: hintsUsed + 1,
              errorsCount,
              completedAt: Date.now(),
            };
            await saveGameScore(gameScore);
            setShowScoreModal(true);
          },
        },
      ]
    );
  }, [puzzle, elapsedTime, settings, hintsUsed, errorsCount]);

  const handleHintWord = useCallback(() => {
    if (!puzzle || !selectedClue || highlightedCells.length === 0) {
      Alert.alert('Изберете дума', 'Първо изберете дума от кръстословицата.');
      return;
    }
    playHaptic('medium');
    setHintsUsed(prev => prev + 1);
    setPuzzle(prev => {
      if (!prev) return prev;
      const newCells = prev.grid.cells.map((row, ri) =>
        row.map((cell, ci) => {
          const isInWord = highlightedCells.some(c => c.row === ri && c.col === ci);
          if (isInWord && !cell.isBlocked) {
            return { ...cell, userInput: cell.letter || '' };
          }
          return cell;
        })
      );
      return { ...prev, grid: { ...prev.grid, cells: newCells } };
    });
  }, [puzzle, selectedClue, highlightedCells]);

  const handleBack = async () => {
    playHaptic('light');
    if (puzzle && !isComplete) await saveGame(puzzle, settings, elapsedTime);
    router.back();
  };

  const handleClearWord = useCallback(() => {
    if (!puzzle || highlightedCells.length === 0) return;
    playHaptic('medium');
    setPuzzle(prev => {
      if (!prev) return prev;
      const newCells = prev.grid.cells.map((row, ri) =>
        row.map((cell, ci) => {
          const isInWord = highlightedCells.some(c => c.row === ri && c.col === ci);
          if (isInWord) return { ...cell, userInput: '', isCorrect: null };
          return cell;
        })
      );
      return { ...prev, grid: { ...prev.grid, cells: newCells } };
    });
  }, [puzzle, highlightedCells]);

  if (!puzzle) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']} style={styles.background} />
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
      <LinearGradient colors={['#0a0a1a', '#1a1a3a', '#0f0f2a', '#151530']} style={styles.background} />
      
      <View style={styles.orb1}>
        <LinearGradient colors={['rgba(99, 102, 241, 0.25)', 'rgba(139, 92, 246, 0.1)']} style={styles.orbGradient} />
      </View>
      <View style={styles.orb2}>
        <LinearGradient colors={['rgba(236, 72, 153, 0.2)', 'rgba(244, 114, 182, 0.08)']} style={styles.orbGradient} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.timerContainer}>
                <BlurView intensity={30} tint="dark" style={styles.timerBlur}>
                  <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']} style={styles.timerGradient}>
                    <Ionicons name="time-outline" size={16} color="rgba(34, 211, 238, 0.9)" />
                    <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                  </LinearGradient>
                </BlurView>
              </View>
              <View style={styles.scoreIndicator}>
                <BlurView intensity={25} tint="dark" style={styles.scoreBlur}>
                  <Ionicons name="star" size={14} color="rgba(255, 215, 0, 0.8)" />
                  <Text style={styles.scoreIndicatorText}>{countWordsFound()}/{puzzle.placedWords.length}</Text>
                </BlurView>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowClues(!showClues)} style={styles.headerButton}>
              <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                <Ionicons name={showClues ? "list" : "grid"} size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CrosswordGrid
              puzzle={puzzle}
              selectedCell={selectedCell}
              highlightedCells={highlightedCells}
              onCellPress={handleCellPress}
              onCellChange={handleCellChange}
              onBackspace={handleBackspace}
            />

            {showClues && !isKeyboardVisible && (
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

          {/* Always show the selected clue anchored right above the keyboard or bottom screen */}
          {selectedClue && (
            <View style={styles.selectedClueContainer}>
              <BlurView intensity={35} tint="dark" style={styles.selectedClueBlur}>
                <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.selectedClueGradient}>
                  <View style={styles.selectedClueHeader}>
                    <View style={styles.clueNumberBadge}>
                      <Text style={styles.clueNumberText}>{selectedClue.number}</Text>
                    </View>
                    <Text style={styles.selectedClueDirection}>
                      {selectedClue.direction === 'across' ? 'Хоризонтално' : 'Вертикално'}
                    </Text>
                    <TouchableOpacity onPress={handleHintWord} style={styles.hintButton}>
                      <Ionicons name="bulb-outline" size={18} color="rgba(255, 215, 0, 0.8)" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.selectedClueText}>{selectedClue.clue}</Text>
                </LinearGradient>
              </BlurView>
            </View>
          )}

          {/* Hide action buttons when typing to save space */}
          {!isKeyboardVisible && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleClearWord}>
                <BlurView intensity={25} tint="dark" style={styles.actionBlur}>
                  <View style={styles.actionContent}>
                    <Ionicons name="backspace-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.actionText}>Изчисти</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.checkButton]} onPress={handleCheckSolution}>
                <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
                  <LinearGradient colors={['rgba(34, 211, 238, 0.3)', 'rgba(56, 189, 248, 0.15)']} style={styles.actionGradient}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.checkText}>Провери</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleRevealSolution}>
                <BlurView intensity={25} tint="dark" style={styles.actionBlur}>
                  <View style={styles.actionContent}>
                    <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.actionText}>Решение</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ScoreModal
        visible={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        onNewGame={() => { setShowScoreModal(false); router.back(); }}
        scoreBreakdown={scoreBreakdown}
        settings={settings}
        timeSeconds={elapsedTime}
        wordsFound={countWordsFound()}
        totalWords={puzzle.placedWords.length}
        isNewHighScore={isNewHighScore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingCard: { padding: 32, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loadingText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 16 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -50, right: -50, overflow: 'hidden' },
  orb2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, bottom: 100, left: -40, overflow: 'hidden' },
  orbGradient: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerButton: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerButtonBlur: { padding: 12 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timerBlur: { flex: 1 },
  timerGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, gap: 6 },
  timerText: { color: '#fff', fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  scoreIndicator: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
  scoreBlur: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, gap: 4 },
  scoreIndicatorText: { color: 'rgba(255, 215, 0, 0.9)', fontSize: 13, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 0, paddingBottom: 20 },
  clueSection: { marginTop: 20, paddingHorizontal: 16 },
  selectedClueContainer: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  selectedClueBlur: { flex: 1 },
  selectedClueGradient: { padding: 14 },
  selectedClueHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  clueNumberBadge: { backgroundColor: 'rgba(139, 92, 246, 0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  clueNumberText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  selectedClueDirection: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, flex: 1 },
  hintButton: { padding: 6, backgroundColor: 'rgba(255, 215, 0, 0.15)', borderRadius: 8 },
  selectedClueText: { color: '#fff', fontSize: 16, lineHeight: 22, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  actionButton: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  checkButton: { borderColor: 'rgba(34, 211, 238, 0.3)' },
  actionBlur: { flex: 1 },
  actionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  actionText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  checkText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
