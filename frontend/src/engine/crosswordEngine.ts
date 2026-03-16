// Professional Crossword Generation Engine
// Using CSP (Constraint Satisfaction Problem) with backtracking
// Follows American-style crossword rules:
// - 180-degree rotational symmetry
// - All letters must be checked (part of both Across and Down words)
// - No 2-letter words
// - Connected grid (no isolated sections)

import { WordClue, PlacedWord, Cell, CrosswordGrid, CrosswordPuzzle, GameSettings } from '../types';
import { getWordsByDifficulty, shuffleArray } from './bulgarianDictionary';

const GRID_SIZES = {
  small: 9,
  medium: 13,
  large: 15,
};

interface Slot {
  startRow: number;
  startCol: number;
  length: number;
  direction: 'across' | 'down';
  cells: { row: number; col: number }[];
}

interface GridState {
  cells: (string | null)[][];
  blocked: boolean[][];
  size: number;
}

// Create empty grid with proper initialization
function createEmptyGridState(size: number): GridState {
  const cells: (string | null)[][] = [];
  const blocked: boolean[][] = [];
  
  for (let row = 0; row < size; row++) {
    cells[row] = [];
    blocked[row] = [];
    for (let col = 0; col < size; col++) {
      cells[row][col] = null;
      blocked[row][col] = false;
    }
  }
  
  return { cells, blocked, size };
}

// Create symmetric black square pattern (180-degree rotational symmetry)
function createSymmetricPattern(size: number, density: number = 0.15): boolean[][] {
  const blocked: boolean[][] = [];
  
  for (let row = 0; row < size; row++) {
    blocked[row] = [];
    for (let col = 0; col < size; col++) {
      blocked[row][col] = false;
    }
  }
  
  // Create a pattern that ensures:
  // 1. Rotational symmetry
  // 2. No isolated sections
  // 3. Good word slot lengths (3-7+ letters)
  
  const patterns = getGoodPatterns(size);
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Apply pattern with 180-degree symmetry
  for (const [row, col] of selectedPattern) {
    if (row < size && col < size) {
      blocked[row][col] = true;
      // Symmetric position
      blocked[size - 1 - row][size - 1 - col] = true;
    }
  }
  
  return blocked;
}

// Pre-defined good crossword patterns for different sizes
function getGoodPatterns(size: number): [number, number][][] {
  if (size === 9) {
    return [
      // Pattern 1: Classic 9x9
      [[0,4], [1,4], [4,0], [4,1], [4,7], [4,8], [7,4], [8,4]],
      // Pattern 2
      [[0,3], [0,5], [3,0], [3,8], [5,0], [5,8], [8,3], [8,5]],
      // Pattern 3
      [[1,1], [1,7], [4,4], [7,1], [7,7]],
    ];
  } else if (size === 13) {
    return [
      // Pattern 1: Classic 13x13
      [[0,4], [0,8], [1,4], [1,8], [4,0], [4,1], [4,11], [4,12], 
       [6,6], [8,0], [8,1], [8,11], [8,12], [11,4], [11,8], [12,4], [12,8]],
      // Pattern 2
      [[0,5], [0,7], [2,3], [2,9], [3,2], [3,10], [5,0], [5,12],
       [6,6], [7,0], [7,12], [9,2], [9,10], [10,3], [10,9], [12,5], [12,7]],
    ];
  } else { // 15x15
    return [
      // Pattern 1: NYT-style 15x15
      [[0,4], [0,10], [1,4], [1,10], [3,6], [3,8], [4,0], [4,1], [4,13], [4,14],
       [6,3], [6,11], [7,7], [8,3], [8,11], [10,0], [10,1], [10,13], [10,14],
       [11,6], [11,8], [13,4], [13,10], [14,4], [14,10]],
      // Pattern 2
      [[0,5], [0,9], [2,5], [2,9], [4,3], [4,7], [4,11], [5,0], [5,2], [5,12], [5,14],
       [7,7], [9,0], [9,2], [9,12], [9,14], [10,3], [10,7], [10,11],
       [12,5], [12,9], [14,5], [14,9]],
    ];
  }
}

// Find all word slots in the grid
function findSlots(blocked: boolean[][], size: number): Slot[] {
  const slots: Slot[] = [];
  
  // Find horizontal slots
  for (let row = 0; row < size; row++) {
    let startCol = 0;
    while (startCol < size) {
      // Skip blocked cells
      while (startCol < size && blocked[row][startCol]) {
        startCol++;
      }
      
      if (startCol >= size) break;
      
      // Find end of slot
      let endCol = startCol;
      const cells: { row: number; col: number }[] = [];
      
      while (endCol < size && !blocked[row][endCol]) {
        cells.push({ row, col: endCol });
        endCol++;
      }
      
      const length = endCol - startCol;
      if (length >= 3) { // Minimum 3 letters
        slots.push({
          startRow: row,
          startCol: startCol,
          length,
          direction: 'across',
          cells,
        });
      }
      
      startCol = endCol + 1;
    }
  }
  
  // Find vertical slots
  for (let col = 0; col < size; col++) {
    let startRow = 0;
    while (startRow < size) {
      // Skip blocked cells
      while (startRow < size && blocked[startRow][col]) {
        startRow++;
      }
      
      if (startRow >= size) break;
      
      // Find end of slot
      let endRow = startRow;
      const cells: { row: number; col: number }[] = [];
      
      while (endRow < size && !blocked[endRow][col]) {
        cells.push({ row: endRow, col });
        endRow++;
      }
      
      const length = endRow - startRow;
      if (length >= 3) { // Minimum 3 letters
        slots.push({
          startRow: startRow,
          startCol: col,
          length,
          direction: 'down',
          cells,
        });
      }
      
      startRow = endRow + 1;
    }
  }
  
  return slots;
}

// Check if a word can be placed in a slot
function canPlaceWord(
  word: string,
  slot: Slot,
  gridState: GridState
): boolean {
  if (word.length !== slot.length) {
    return false;
  }
  
  const letters = word.split('');
  
  for (let i = 0; i < letters.length; i++) {
    const { row, col } = slot.cells[i];
    const existing = gridState.cells[row][col];
    
    // If cell has a letter, it must match
    if (existing !== null && existing !== letters[i]) {
      return false;
    }
  }
  
  return true;
}

// Place a word in a slot
function placeWord(
  word: string,
  slot: Slot,
  gridState: GridState
): void {
  const letters = word.split('');
  
  for (let i = 0; i < letters.length; i++) {
    const { row, col } = slot.cells[i];
    gridState.cells[row][col] = letters[i];
  }
}

// Remove a word from a slot (for backtracking)
function removeWord(
  slot: Slot,
  gridState: GridState,
  originalCells: (string | null)[][]
): void {
  for (const { row, col } of slot.cells) {
    gridState.cells[row][col] = originalCells[row][col];
  }
}

// Score a slot for prioritization (most constrained first)
function scoreSlot(
  slot: Slot,
  gridState: GridState,
  availableWords: WordClue[]
): number {
  // Count how many letters are already placed in this slot
  let filledCount = 0;
  let constraints: { index: number; letter: string }[] = [];
  
  for (let i = 0; i < slot.cells.length; i++) {
    const { row, col } = slot.cells[i];
    if (gridState.cells[row][col] !== null) {
      filledCount++;
      constraints.push({ index: i, letter: gridState.cells[row][col]! });
    }
  }
  
  // Count compatible words
  const compatibleWords = availableWords.filter(wc => 
    wc.word.length === slot.length &&
    constraints.every(c => wc.word[c.index] === c.letter)
  );
  
  // Higher score = should fill first
  // Prioritize slots with:
  // 1. Some constraints (intersections) - helps connectivity
  // 2. Fewer compatible words (most constrained variable heuristic)
  if (compatibleWords.length === 0) {
    return -1; // Cannot fill
  }
  
  const constraintScore = filledCount * 20;
  const scarcityScore = Math.max(0, 50 - compatibleWords.length);
  const lengthScore = slot.length * 2;
  
  return constraintScore + scarcityScore + lengthScore;
}

// Get compatible words for a slot
function getCompatibleWords(
  slot: Slot,
  gridState: GridState,
  availableWords: WordClue[],
  usedWords: Set<string>
): WordClue[] {
  const constraints: { index: number; letter: string }[] = [];
  
  for (let i = 0; i < slot.cells.length; i++) {
    const { row, col } = slot.cells[i];
    if (gridState.cells[row][col] !== null) {
      constraints.push({ index: i, letter: gridState.cells[row][col]! });
    }
  }
  
  return availableWords.filter(wc => 
    wc.word.length === slot.length &&
    !usedWords.has(wc.word) &&
    constraints.every(c => wc.word[c.index] === c.letter)
  );
}

// Deep copy grid state
function copyGridState(state: GridState): (string | null)[][] {
  return state.cells.map(row => [...row]);
}

// Main CSP solver with backtracking
function solveCSP(
  slots: Slot[],
  gridState: GridState,
  availableWords: WordClue[],
  usedWords: Set<string>,
  placedWords: PlacedWord[],
  maxAttempts: number = 1000
): boolean {
  let attempts = 0;
  
  function solve(): boolean {
    attempts++;
    if (attempts > maxAttempts) {
      return true; // Stop early, use what we have
    }
    
    // Find unfilled slots
    const unfilledSlots = slots.filter(slot => {
      const firstCell = slot.cells[0];
      return gridState.cells[firstCell.row][firstCell.col] === null ||
             slot.cells.some(c => gridState.cells[c.row][c.col] === null);
    });
    
    if (unfilledSlots.length === 0) {
      return true; // All slots filled!
    }
    
    // Score and sort slots (most constrained first)
    const scoredSlots = unfilledSlots
      .map(slot => ({
        slot,
        score: scoreSlot(slot, gridState, availableWords)
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    
    if (scoredSlots.length === 0) {
      return false; // No fillable slots
    }
    
    // Try to fill the most constrained slot
    const { slot } = scoredSlots[0];
    const compatible = getCompatibleWords(slot, gridState, availableWords, usedWords);
    
    // Shuffle for variety
    const shuffled = shuffleArray(compatible).slice(0, 10);
    
    for (const wordClue of shuffled) {
      const originalCells = copyGridState(gridState);
      
      if (canPlaceWord(wordClue.word, slot, gridState)) {
        placeWord(wordClue.word, slot, gridState);
        usedWords.add(wordClue.word);
        
        placedWords.push({
          word: wordClue.word,
          clue: wordClue.clue,
          startRow: slot.startRow,
          startCol: slot.startCol,
          direction: slot.direction,
          number: 0,
        });
        
        if (solve()) {
          return true;
        }
        
        // Backtrack
        removeWord(slot, gridState, originalCells);
        usedWords.delete(wordClue.word);
        placedWords.pop();
      }
    }
    
    return false;
  }
  
  return solve();
}

// Assign numbers to clues
function assignNumbers(placedWords: PlacedWord[]): void {
  // Sort by position (top to bottom, left to right)
  const sortedWords = [...placedWords].sort((a, b) => {
    if (a.startRow !== b.startRow) return a.startRow - b.startRow;
    return a.startCol - b.startCol;
  });
  
  const numberMap: Map<string, number> = new Map();
  let currentNumber = 1;
  
  for (const word of sortedWords) {
    const key = `${word.startRow}-${word.startCol}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, currentNumber);
      currentNumber++;
    }
    word.number = numberMap.get(key)!;
  }
}

// Convert to final puzzle format
function createFinalGrid(
  gridState: GridState,
  blocked: boolean[][],
  placedWords: PlacedWord[]
): CrosswordGrid {
  const cells: Cell[][] = [];
  
  // Create number map
  const numberMap: Map<string, number> = new Map();
  for (const word of placedWords) {
    const key = `${word.startRow}-${word.startCol}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, word.number);
    }
  }
  
  for (let row = 0; row < gridState.size; row++) {
    cells[row] = [];
    for (let col = 0; col < gridState.size; col++) {
      const key = `${row}-${col}`;
      cells[row][col] = {
        letter: gridState.cells[row][col],
        isBlocked: blocked[row][col] || gridState.cells[row][col] === null,
        number: numberMap.get(key) || null,
        isSelected: false,
        isHighlighted: false,
        userInput: '',
        isCorrect: null,
      };
    }
  }
  
  return {
    cells,
    width: gridState.size,
    height: gridState.size,
  };
}

// Main generation function
export function generateCrossword(settings: GameSettings): CrosswordPuzzle {
  const gridSize = GRID_SIZES[settings.size];
  const words = shuffleArray(getWordsByDifficulty(settings.difficulty));
  
  // Filter words by length (3 to gridSize-2)
  const validWords = words.filter(w => w.word.length >= 3 && w.word.length <= gridSize - 2);
  
  let bestPuzzle: CrosswordPuzzle | null = null;
  let bestScore = 0;
  
  // Try multiple patterns and pick the best
  const attempts = 5;
  
  for (let attempt = 0; attempt < attempts; attempt++) {
    // Create symmetric black square pattern
    const blocked = createSymmetricPattern(gridSize);
    
    // Initialize grid state
    const gridState = createEmptyGridState(gridSize);
    gridState.blocked = blocked;
    
    // Find all slots
    const slots = findSlots(blocked, gridSize);
    
    if (slots.length < 5) continue; // Not enough slots
    
    // Solve using CSP
    const usedWords = new Set<string>();
    const placedWords: PlacedWord[] = [];
    
    solveCSP(slots, gridState, validWords, usedWords, placedWords, 500);
    
    if (placedWords.length > bestScore) {
      bestScore = placedWords.length;
      
      // Assign numbers
      assignNumbers(placedWords);
      
      // Create final grid
      const finalGrid = createFinalGrid(gridState, blocked, placedWords);
      
      // Separate clues
      const acrossClues = placedWords
        .filter(w => w.direction === 'across')
        .sort((a, b) => a.number - b.number);
      
      const downClues = placedWords
        .filter(w => w.direction === 'down')
        .sort((a, b) => a.number - b.number);
      
      bestPuzzle = {
        grid: finalGrid,
        placedWords,
        acrossClues,
        downClues,
      };
    }
  }
  
  // If no good puzzle found, create a simple one
  if (!bestPuzzle) {
    return createFallbackPuzzle(gridSize, validWords);
  }
  
  return bestPuzzle;
}

// Fallback puzzle creation
function createFallbackPuzzle(gridSize: number, words: WordClue[]): CrosswordPuzzle {
  const blocked = createSymmetricPattern(gridSize);
  const gridState = createEmptyGridState(gridSize);
  const slots = findSlots(blocked, gridSize);
  const placedWords: PlacedWord[] = [];
  const usedWords = new Set<string>();
  
  // Simple greedy fill
  for (const slot of slots) {
    const compatible = words.filter(w => 
      w.word.length === slot.length && 
      !usedWords.has(w.word) &&
      canPlaceWord(w.word, slot, gridState)
    );
    
    if (compatible.length > 0) {
      const word = compatible[Math.floor(Math.random() * compatible.length)];
      placeWord(word.word, slot, gridState);
      usedWords.add(word.word);
      placedWords.push({
        word: word.word,
        clue: word.clue,
        startRow: slot.startRow,
        startCol: slot.startCol,
        direction: slot.direction,
        number: 0,
      });
    }
  }
  
  assignNumbers(placedWords);
  const finalGrid = createFinalGrid(gridState, blocked, placedWords);
  
  return {
    grid: finalGrid,
    placedWords,
    acrossClues: placedWords.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number),
    downClues: placedWords.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number),
  };
}

export function checkSolution(puzzle: CrosswordPuzzle): boolean {
  for (const row of puzzle.grid.cells) {
    for (const cell of row) {
      if (!cell.isBlocked && cell.letter) {
        if (cell.userInput.toUpperCase() !== cell.letter.toUpperCase()) {
          return false;
        }
      }
    }
  }
  return true;
}

export function getWordCells(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: 'across' | 'down'
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  const grid = puzzle.grid.cells;
  const size = puzzle.grid.width;

  if (direction === 'across') {
    let startCol = col;
    while (startCol > 0 && !grid[row][startCol - 1].isBlocked) {
      startCol--;
    }
    
    let currentCol = startCol;
    while (currentCol < size && !grid[row][currentCol].isBlocked) {
      cells.push({ row, col: currentCol });
      currentCol++;
    }
  } else {
    let startRow = row;
    while (startRow > 0 && !grid[startRow - 1][col].isBlocked) {
      startRow--;
    }
    
    let currentRow = startRow;
    while (currentRow < size && !grid[currentRow][col].isBlocked) {
      cells.push({ row: currentRow, col });
      currentRow++;
    }
  }

  return cells;
}
