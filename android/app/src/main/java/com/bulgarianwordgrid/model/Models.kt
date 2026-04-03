package com.bulgarianwordgrid.model

import kotlinx.serialization.Serializable

enum class Difficulty { EASY, MEDIUM, HARD }
enum class GridSize { SMALL, MEDIUM, LARGE }
enum class Direction { ACROSS, DOWN }

@Serializable
data class WordClue(
    val word: String,
    val clue: String,
    val difficulty: Difficulty
)

@Serializable
data class PlacedWord(
    val word: String,
    val clue: String,
    val startRow: Int,
    val startCol: Int,
    val direction: Direction,
    val number: Int
)

@Serializable
data class Cell(
    val letter: String?,
    val isBlocked: Boolean,
    val number: Int?,
    val isSelected: Boolean,
    val isHighlighted: Boolean,
    val userInput: String,
    val isCorrect: Boolean?
)

@Serializable
data class CrosswordGrid(
    val cells: List<List<Cell>>,
    val width: Int,
    val height: Int
)

@Serializable
data class CrosswordPuzzle(
    val grid: CrosswordGrid,
    val placedWords: List<PlacedWord>,
    val acrossClues: List<PlacedWord>,
    val downClues: List<PlacedWord>
)

@Serializable
data class GameSettings(
    val size: GridSize = GridSize.MEDIUM,
    val difficulty: Difficulty = Difficulty.MEDIUM
)

data class CellPosition(
    val row: Int,
    val col: Int
)

@Serializable
data class ScoreBreakdown(
    val baseScore: Int,
    val difficultyBonus: Int,
    val sizeBonus: Int,
    val speedBonus: Int,
    val noHintsBonus: Int,
    val perfectBonus: Int,
    val totalScore: Int,
    val grade: String,
    val stars: Int
)

@Serializable
data class GameScore(
    val id: String,
    val score: Int,
    val breakdown: ScoreBreakdown,
    val settings: GameSettings,
    val timeSeconds: Int,
    val wordsFound: Int,
    val totalWords: Int,
    val hintsUsed: Int,
    val errorsCount: Int,
    val completedAt: Long
)

@Serializable
data class HighScore(
    val score: Int,
    val timeSeconds: Int,
    val completedAt: Long
)

@Serializable
data class HighScores(
    val easy: Map<String, HighScore?>,
    val medium: Map<String, HighScore?>,
    val hard: Map<String, HighScore?>
)

@Serializable
data class SavedGame(
    val puzzle: CrosswordPuzzle,
    val settings: GameSettings,
    val elapsedTime: Int,
    val savedAt: Long
)

@Serializable
data class GameStats(
    val gamesPlayed: Int = 0,
    val gamesCompleted: Int = 0,
    val totalTime: Int = 0,
    val bestTime: Int? = null,
    val lastPlayed: Long? = null
)
