// Scoring System Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings } from '../types';

const SCORES_KEY = '@crossword_scores';
const HIGH_SCORES_KEY = '@crossword_high_scores';

// Scoring multipliers based on difficulty
const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

// Scoring multipliers based on grid size
const SIZE_MULTIPLIERS = {
  small: 1.0,    // 9x9
  medium: 1.25,  // 13x13
  large: 1.5,    // 15x15
};

// Base points
const BASE_POINTS = {
  WORD_COMPLETE: 100,        // Points for completing a word
  LETTER_CORRECT: 10,        // Points per correct letter
  NO_HINTS_BONUS: 500,       // Bonus for not using hints
  SPEED_BONUS_THRESHOLD: 300, // Seconds threshold for speed bonus
  SPEED_BONUS_MAX: 1000,     // Maximum speed bonus points
  PERFECT_SCORE_BONUS: 2000, // Bonus for completing without errors
};

export interface ScoreBreakdown {
  baseScore: number;
  difficultyBonus: number;
  sizeBonus: number;
  speedBonus: number;
  noHintsBonus: number;
  perfectBonus: number;
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  stars: number;
}

export interface GameScore {
  id: string;
  score: number;
  breakdown: ScoreBreakdown;
  settings: GameSettings;
  timeSeconds: number;
  wordsFound: number;
  totalWords: number;
  hintsUsed: number;
  errorsCount: number;
  completedAt: number;
}

export interface HighScore {
  score: number;
  timeSeconds: number;
  completedAt: number;
}

export interface HighScores {
  easy: { small: HighScore | null; medium: HighScore | null; large: HighScore | null };
  medium: { small: HighScore | null; medium: HighScore | null; large: HighScore | null };
  hard: { small: HighScore | null; medium: HighScore | null; large: HighScore | null };
}

// Calculate score based on game performance
export function calculateScore(
  settings: GameSettings,
  timeSeconds: number,
  wordsFound: number,
  totalWords: number,
  hintsUsed: number,
  errorsCount: number
): ScoreBreakdown {
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[settings.difficulty];
  const sizeMultiplier = SIZE_MULTIPLIERS[settings.size];
  
  // Base score from words found
  const baseScore = wordsFound * BASE_POINTS.WORD_COMPLETE;
  
  // Difficulty bonus
  const difficultyBonus = Math.floor(baseScore * (diffMultiplier - 1));
  
  // Size bonus
  const sizeBonus = Math.floor(baseScore * (sizeMultiplier - 1));
  
  // Speed bonus (more points for faster completion)
  let speedBonus = 0;
  if (wordsFound === totalWords && timeSeconds < BASE_POINTS.SPEED_BONUS_THRESHOLD) {
    const speedFactor = 1 - (timeSeconds / BASE_POINTS.SPEED_BONUS_THRESHOLD);
    speedBonus = Math.floor(BASE_POINTS.SPEED_BONUS_MAX * speedFactor * diffMultiplier);
  }
  
  // No hints bonus
  const noHintsBonus = hintsUsed === 0 ? Math.floor(BASE_POINTS.NO_HINTS_BONUS * diffMultiplier) : 0;
  
  // Perfect score bonus (no errors, all words found)
  const perfectBonus = (errorsCount === 0 && wordsFound === totalWords) 
    ? Math.floor(BASE_POINTS.PERFECT_SCORE_BONUS * diffMultiplier) 
    : 0;
  
  // Calculate total
  const totalScore = baseScore + difficultyBonus + sizeBonus + speedBonus + noHintsBonus + perfectBonus;
  
  // Calculate grade and stars
  const completionRate = wordsFound / totalWords;
  const { grade, stars } = calculateGrade(totalScore, completionRate, settings);
  
  return {
    baseScore,
    difficultyBonus,
    sizeBonus,
    speedBonus,
    noHintsBonus,
    perfectBonus,
    totalScore,
    grade,
    stars,
  };
}

// Calculate grade based on score and completion
function calculateGrade(
  score: number,
  completionRate: number,
  settings: GameSettings
): { grade: 'S' | 'A' | 'B' | 'C' | 'D'; stars: number } {
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[settings.difficulty];
  const sizeMultiplier = SIZE_MULTIPLIERS[settings.size];
  
  // Threshold multiplier based on difficulty and size
  const thresholdMultiplier = diffMultiplier * sizeMultiplier;
  
  // Base thresholds (adjusted by multiplier)
  const thresholds = {
    S: 3000 * thresholdMultiplier,
    A: 2000 * thresholdMultiplier,
    B: 1200 * thresholdMultiplier,
    C: 600 * thresholdMultiplier,
  };
  
  let grade: 'S' | 'A' | 'B' | 'C' | 'D';
  let stars: number;
  
  if (score >= thresholds.S && completionRate === 1) {
    grade = 'S';
    stars = 5;
  } else if (score >= thresholds.A && completionRate >= 0.9) {
    grade = 'A';
    stars = 4;
  } else if (score >= thresholds.B && completionRate >= 0.7) {
    grade = 'B';
    stars = 3;
  } else if (score >= thresholds.C && completionRate >= 0.5) {
    grade = 'C';
    stars = 2;
  } else {
    grade = 'D';
    stars = 1;
  }
  
  return { grade, stars };
}

// Save a game score
export async function saveGameScore(gameScore: GameScore): Promise<void> {
  try {
    // Get existing scores
    const scoresStr = await AsyncStorage.getItem(SCORES_KEY);
    const scores: GameScore[] = scoresStr ? JSON.parse(scoresStr) : [];
    
    // Add new score
    scores.unshift(gameScore);
    
    // Keep only last 50 scores
    const trimmedScores = scores.slice(0, 50);
    
    await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(trimmedScores));
    
    // Update high scores
    await updateHighScore(gameScore);
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

// Update high score if applicable
async function updateHighScore(gameScore: GameScore): Promise<boolean> {
  try {
    const highScores = await getHighScores();
    const { difficulty, size } = gameScore.settings;
    
    const currentHigh = highScores[difficulty][size];
    
    if (!currentHigh || gameScore.score > currentHigh.score) {
      highScores[difficulty][size] = {
        score: gameScore.score,
        timeSeconds: gameScore.timeSeconds,
        completedAt: gameScore.completedAt,
      };
      
      await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating high score:', error);
    return false;
  }
}

// Get high scores
export async function getHighScores(): Promise<HighScores> {
  try {
    const highScoresStr = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    if (highScoresStr) {
      return JSON.parse(highScoresStr);
    }
  } catch (error) {
    console.error('Error loading high scores:', error);
  }
  
  // Return default structure
  return {
    easy: { small: null, medium: null, large: null },
    medium: { small: null, medium: null, large: null },
    hard: { small: null, medium: null, large: null },
  };
}

// Get recent scores
export async function getRecentScores(limit: number = 10): Promise<GameScore[]> {
  try {
    const scoresStr = await AsyncStorage.getItem(SCORES_KEY);
    if (scoresStr) {
      const scores: GameScore[] = JSON.parse(scoresStr);
      return scores.slice(0, limit);
    }
  } catch (error) {
    console.error('Error loading scores:', error);
  }
  return [];
}

// Get total stats
export async function getTotalStats(): Promise<{
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestGrade: string;
}> {
  try {
    const scoresStr = await AsyncStorage.getItem(SCORES_KEY);
    if (scoresStr) {
      const scores: GameScore[] = JSON.parse(scoresStr);
      const totalGames = scores.length;
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      const averageScore = totalGames > 0 ? Math.floor(totalScore / totalGames) : 0;
      
      // Find best grade
      const gradeOrder = ['S', 'A', 'B', 'C', 'D'];
      let bestGrade = 'D';
      for (const score of scores) {
        if (gradeOrder.indexOf(score.breakdown.grade) < gradeOrder.indexOf(bestGrade)) {
          bestGrade = score.breakdown.grade;
        }
      }
      
      return { totalGames, totalScore, averageScore, bestGrade };
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
  
  return { totalGames: 0, totalScore: 0, averageScore: 0, bestGrade: '-' };
}

// Format score with commas
export function formatScore(score: number): string {
  return score.toLocaleString('bg-BG');
}

// Get grade color
export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'S': '#ffd700', // Gold
    'A': '#22d3ee', // Cyan
    'B': '#a855f7', // Purple
    'C': '#3b82f6', // Blue
    'D': '#6b7280', // Gray
  };
  return colors[grade] || colors['D'];
}

// Get star display
export function getStarsDisplay(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
