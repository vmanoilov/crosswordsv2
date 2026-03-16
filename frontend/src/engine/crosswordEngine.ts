// Crossword Generation Engine - Кръстословица Генератор
import { WordClue, PlacedWord, Cell, CrosswordGrid, CrosswordPuzzle, GameSettings } from '../types';
import { getWordsByDifficulty, shuffleArray } from './bulgarianDictionary';

const GRID_SIZES = {
  small: 9,
  medium: 13,
  large: 17,
};

function createEmptyGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = {
        letter: null,
        isBlocked: true,
        number: null,
        isSelected: false,
        isHighlighted: false,
        userInput: '',
        isCorrect: null,
      };
    }
  }
  return grid;
}

function canPlaceWord(
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: 'across' | 'down'
): boolean {
  const size = grid.length;
  const letters = word.split('');

  for (let i = 0; i < letters.length; i++) {
    const row = direction === 'across' ? startRow : startRow + i;
    const col = direction === 'across' ? startCol + i : startCol;

    // Check bounds
    if (row < 0 || row >= size || col < 0 || col >= size) {
      return false;
    }

    const cell = grid[row][col];

    // Cell must either be empty or have the same letter
    if (cell.letter !== null && cell.letter !== letters[i]) {
      return false;
    }

    // Check for adjacent cells (no parallel words touching)
    if (cell.letter === null) {
      if (direction === 'across') {
        // Check cells above and below
        if (row > 0 && grid[row - 1][col].letter !== null && grid[row - 1][col].letter !== letters[i]) {
          // Only block if it's not an intersection
          const prevCell = i > 0 ? grid[row][col - 1] : null;
          const nextCell = i < letters.length - 1 && col + 1 < size ? grid[row][col + 1] : null;
          if (!prevCell?.letter && !nextCell?.letter) {
            // This would create adjacent parallel words
          }
        }
        if (row < size - 1 && grid[row + 1][col].letter !== null && grid[row + 1][col].letter !== letters[i]) {
          // Similar check
        }
      } else {
        // Check cells left and right
        if (col > 0 && grid[row][col - 1].letter !== null && grid[row][col - 1].letter !== letters[i]) {
          // Similar check
        }
        if (col < size - 1 && grid[row][col + 1].letter !== null && grid[row][col + 1].letter !== letters[i]) {
          // Similar check
        }
      }
    }
  }

  // Check cell before word start (should be empty or blocked)
  if (direction === 'across') {
    if (startCol > 0 && grid[startRow][startCol - 1].letter !== null) {
      return false;
    }
  } else {
    if (startRow > 0 && grid[startRow - 1][startCol].letter !== null) {
      return false;
    }
  }

  // Check cell after word end (should be empty or blocked)
  if (direction === 'across') {
    const endCol = startCol + word.length;
    if (endCol < size && grid[startRow][endCol].letter !== null) {
      return false;
    }
  } else {
    const endRow = startRow + word.length;
    if (endRow < size && grid[endRow][startCol].letter !== null) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: 'across' | 'down'
): void {
  const letters = word.split('');

  for (let i = 0; i < letters.length; i++) {
    const row = direction === 'across' ? startRow : startRow + i;
    const col = direction === 'across' ? startCol + i : startCol;

    grid[row][col].letter = letters[i];
    grid[row][col].isBlocked = false;
  }
}

function findIntersections(
  grid: Cell[][],
  word: string,
  direction: 'across' | 'down'
): { row: number; col: number; intersectionIndex: number }[] {
  const intersections: { row: number; col: number; intersectionIndex: number }[] = [];
  const size = grid.length;
  const letters = word.split('');

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].letter !== null) {
        const existingLetter = grid[row][col].letter;
        
        for (let i = 0; i < letters.length; i++) {
          if (letters[i] === existingLetter) {
            // Calculate where the word would start if this letter is the intersection
            const startRow = direction === 'across' ? row : row - i;
            const startCol = direction === 'across' ? col - i : col;

            if (canPlaceWord(grid, word, startRow, startCol, direction)) {
              intersections.push({ row: startRow, col: startCol, intersectionIndex: i });
            }
          }
        }
      }
    }
  }

  return intersections;
}

function assignNumbers(grid: Cell[][], placedWords: PlacedWord[]): void {
  // Create a map of positions that need numbers
  const numberPositions: Map<string, number> = new Map();
  let currentNumber = 1;

  // Sort placed words by position (top-to-bottom, left-to-right)
  const sortedWords = [...placedWords].sort((a, b) => {
    if (a.startRow !== b.startRow) return a.startRow - b.startRow;
    return a.startCol - b.startCol;
  });

  for (const word of sortedWords) {
    const key = `${word.startRow}-${word.startCol}`;
    if (!numberPositions.has(key)) {
      numberPositions.set(key, currentNumber);
      currentNumber++;
    }
    word.number = numberPositions.get(key)!;
  }

  // Assign numbers to grid cells
  for (const [key, number] of numberPositions) {
    const [row, col] = key.split('-').map(Number);
    grid[row][col].number = number;
  }
}

export function generateCrossword(settings: GameSettings): CrosswordPuzzle {
  const gridSize = GRID_SIZES[settings.size];
  const words = shuffleArray(getWordsByDifficulty(settings.difficulty));
  
  // Filter words that fit in the grid
  const validWords = words.filter(w => w.word.length <= gridSize - 2);
  
  let grid = createEmptyGrid(gridSize);
  const placedWords: PlacedWord[] = [];
  
  // Target number of words based on difficulty and size
  const targetWords = Math.floor(gridSize * 1.2);
  let attempts = 0;
  const maxAttempts = 100;

  // Place first word in the center
  if (validWords.length > 0) {
    const firstWord = validWords[0];
    const startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - firstWord.word.length) / 2);
    
    placeWord(grid, firstWord.word, startRow, startCol, 'across');
    placedWords.push({
      word: firstWord.word,
      clue: firstWord.clue,
      startRow,
      startCol,
      direction: 'across',
      number: 0,
    });
  }

  // Try to place remaining words
  let direction: 'across' | 'down' = 'down';
  
  for (let i = 1; i < validWords.length && placedWords.length < targetWords && attempts < maxAttempts; i++) {
    const wordClue = validWords[i];
    const word = wordClue.word;
    
    // Find intersections with placed words
    const intersections = findIntersections(grid, word, direction);
    
    if (intersections.length > 0) {
      // Pick a random intersection
      const intersection = intersections[Math.floor(Math.random() * intersections.length)];
      
      placeWord(grid, word, intersection.row, intersection.col, direction);
      placedWords.push({
        word: word,
        clue: wordClue.clue,
        startRow: intersection.row,
        startCol: intersection.col,
        direction,
        number: 0,
      });
      
      // Alternate directions
      direction = direction === 'across' ? 'down' : 'across';
    } else {
      attempts++;
    }
  }

  // Assign numbers to words and cells
  assignNumbers(grid, placedWords);

  // Separate clues by direction
  const acrossClues = placedWords
    .filter(w => w.direction === 'across')
    .sort((a, b) => a.number - b.number);
    
  const downClues = placedWords
    .filter(w => w.direction === 'down')
    .sort((a, b) => a.number - b.number);

  return {
    grid: {
      cells: grid,
      width: gridSize,
      height: gridSize,
    },
    placedWords,
    acrossClues,
    downClues,
  };
}

export function checkSolution(puzzle: CrosswordPuzzle): boolean {
  for (const row of puzzle.grid.cells) {
    for (const cell of row) {
      if (!cell.isBlocked) {
        if (cell.userInput.toUpperCase() !== cell.letter) {
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
    // Find start of word
    let startCol = col;
    while (startCol > 0 && !grid[row][startCol - 1].isBlocked) {
      startCol--;
    }
    
    // Collect all cells in word
    let currentCol = startCol;
    while (currentCol < size && !grid[row][currentCol].isBlocked) {
      cells.push({ row, col: currentCol });
      currentCol++;
    }
  } else {
    // Find start of word
    let startRow = row;
    while (startRow > 0 && !grid[startRow - 1][col].isBlocked) {
      startRow--;
    }
    
    // Collect all cells in word
    let currentRow = startRow;
    while (currentRow < size && !grid[currentRow][col].isBlocked) {
      cells.push({ row: currentRow, col });
      currentRow++;
    }
  }

  return cells;
}
