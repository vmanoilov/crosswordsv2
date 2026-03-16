// Game Storage Service - Save/Resume functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrosswordPuzzle, GameSettings } from '../types';

const STORAGE_KEYS = {
  SAVED_GAME: '@crossword_saved_game',
  GAME_STATS: '@crossword_game_stats',
};

export interface SavedGame {
  puzzle: CrosswordPuzzle;
  settings: GameSettings;
  elapsedTime: number;
  savedAt: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalTime: number;
  bestTime: number | null;
  lastPlayed: number | null;
}

// Save current game
export async function saveGame(
  puzzle: CrosswordPuzzle,
  settings: GameSettings,
  elapsedTime: number
): Promise<void> {
  try {
    const savedGame: SavedGame = {
      puzzle,
      settings,
      elapsedTime,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(savedGame));
  } catch (error) {
    console.error('Error saving game:', error);
  }
}

// Load saved game
export async function loadSavedGame(): Promise<SavedGame | null> {
  try {
    const savedGameStr = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_GAME);
    if (savedGameStr) {
      return JSON.parse(savedGameStr) as SavedGame;
    }
    return null;
  } catch (error) {
    console.error('Error loading saved game:', error);
    return null;
  }
}

// Delete saved game
export async function deleteSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
  } catch (error) {
    console.error('Error deleting saved game:', error);
  }
}

// Check if there's a saved game
export async function hasSavedGame(): Promise<boolean> {
  try {
    const savedGameStr = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_GAME);
    return savedGameStr !== null;
  } catch (error) {
    console.error('Error checking saved game:', error);
    return false;
  }
}

// Load game stats
export async function loadGameStats(): Promise<GameStats> {
  try {
    const statsStr = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (statsStr) {
      return JSON.parse(statsStr) as GameStats;
    }
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalTime: 0,
      bestTime: null,
      lastPlayed: null,
    };
  } catch (error) {
    console.error('Error loading game stats:', error);
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalTime: 0,
      bestTime: null,
      lastPlayed: null,
    };
  }
}

// Update game stats
export async function updateGameStats(
  completed: boolean,
  time: number
): Promise<void> {
  try {
    const stats = await loadGameStats();
    
    stats.gamesPlayed++;
    stats.totalTime += time;
    stats.lastPlayed = Date.now();
    
    if (completed) {
      stats.gamesCompleted++;
      if (stats.bestTime === null || time < stats.bestTime) {
        stats.bestTime = time;
      }
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating game stats:', error);
  }
}

// Format time for display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format date for display
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month} ${hours}:${minutes}`;
}
