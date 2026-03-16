// Crossword Types

export interface WordClue {
  word: string;
  clue: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlacedWord {
  word: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  number: number;
}

export interface Cell {
  letter: string | null;
  isBlocked: boolean;
  number: number | null;
  isSelected: boolean;
  isHighlighted: boolean;
  userInput: string;
  isCorrect: boolean | null;
}

export interface CrosswordGrid {
  cells: Cell[][];
  width: number;
  height: number;
}

export interface CrosswordPuzzle {
  grid: CrosswordGrid;
  placedWords: PlacedWord[];
  acrossClues: PlacedWord[];
  downClues: PlacedWord[];
}

export interface GameSettings {
  size: 'small' | 'medium' | 'large';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  puzzle: CrosswordPuzzle;
  settings: GameSettings;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  isComplete: boolean;
  startTime: number;
  elapsedTime: number;
}
