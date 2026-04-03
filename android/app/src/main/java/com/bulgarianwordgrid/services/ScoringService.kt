package com.bulgarianwordgrid.services

import android.content.Context
import androidx.datastore.preferences.core.*
import com.bulgarianwordgrid.model.*
import kotlinx.coroutines.flow.first
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object ScoringService {
    private val SCORES_KEY = stringPreferencesKey("scores")
    private val HIGH_SCORES_KEY = stringPreferencesKey("high_scores")

    private val json = Json { ignoreUnknownKeys = true }

    private val difficultyMultipliers = mapOf(
        Difficulty.EASY to 1.0,
        Difficulty.MEDIUM to 1.5,
        Difficulty.HARD to 2.0
    )

    private val sizeMultipliers = mapOf(
        GridSize.SMALL to 1.0,
        GridSize.MEDIUM to 1.25,
        GridSize.LARGE to 1.5
    )

    fun calculateScore(
        settings: GameSettings,
        timeSeconds: Int,
        wordsFound: Int,
        totalWords: Int,
        hintsUsed: Int,
        errorsCount: Int
    ): ScoreBreakdown {
        val diffMultiplier = difficultyMultipliers[settings.difficulty] ?: 1.0
        val sizeMultiplier = sizeMultipliers[settings.size] ?: 1.0

        val baseScore = wordsFound * 100
        val difficultyBonus = (baseScore * (diffMultiplier - 1)).toInt()
        val sizeBonus = (baseScore * (sizeMultiplier - 1)).toInt()

        val speedBonus = if (wordsFound == totalWords && timeSeconds < 300) {
            val speedFactor = 1.0 - (timeSeconds.toDouble() / 300.0)
            (1000 * speedFactor * diffMultiplier).toInt()
        } else 0

        val noHintsBonus = if (hintsUsed == 0) (500 * diffMultiplier).toInt() else 0
        val perfectBonus = if (errorsCount == 0 && wordsFound == totalWords) (2000 * diffMultiplier).toInt() else 0

        val totalScore = baseScore + difficultyBonus + sizeBonus + speedBonus + noHintsBonus + perfectBonus
        val completionRate = if (totalWords > 0) wordsFound.toDouble() / totalWords else 0.0
        val (grade, stars) = calculateGrade(totalScore, completionRate, settings)

        return ScoreBreakdown(
            baseScore = baseScore,
            difficultyBonus = difficultyBonus,
            sizeBonus = sizeBonus,
            speedBonus = speedBonus,
            noHintsBonus = noHintsBonus,
            perfectBonus = perfectBonus,
            totalScore = totalScore,
            grade = grade,
            stars = stars
        )
    }

    private fun calculateGrade(score: Int, completionRate: Double, settings: GameSettings): Pair<String, Int> {
        val diffMultiplier = difficultyMultipliers[settings.difficulty] ?: 1.0
        val sizeMultiplier = sizeMultipliers[settings.size] ?: 1.0
        val thresholdMultiplier = diffMultiplier * sizeMultiplier

        return when {
            score >= 3000 * thresholdMultiplier && completionRate == 1.0 -> "S" to 5
            score >= 2000 * thresholdMultiplier && completionRate >= 0.9 -> "A" to 4
            score >= 1200 * thresholdMultiplier && completionRate >= 0.7 -> "B" to 3
            score >= 600 * thresholdMultiplier && completionRate >= 0.5 -> "C" to 2
            else -> "D" to 1
        }
    }

    suspend fun saveGameScore(context: Context, gameScore: GameScore) {
        try {
            val scores = getRecentScores(context, 100).toMutableList()
            scores.add(0, gameScore)
            val trimmed = scores.take(50)
            context.gameDataStore.edit { prefs ->
                prefs[SCORES_KEY] = json.encodeToString(trimmed)
            }
            updateHighScore(context, gameScore)
        } catch (e: Exception) {
            android.util.Log.e("ScoringService", "Error saving score", e)
        }
    }

    private suspend fun updateHighScore(context: Context, gameScore: GameScore): Boolean {
        return try {
            val highScores = getHighScores(context)
            val currentHigh = highScores[gameScore.settings.size.name.lowercase()]
            if (currentHigh == null || gameScore.score > currentHigh.score) {
                val updatedMap = highScores.toMutableMap()
                updatedMap[gameScore.settings.size.name.lowercase()] = HighScore(
                    score = gameScore.score,
                    timeSeconds = gameScore.timeSeconds,
                    completedAt = gameScore.completedAt
                )
                context.gameDataStore.edit { prefs ->
                    prefs[HIGH_SCORES_KEY] = json.encodeToString(updatedMap)
                }
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getHighScores(context: Context): Map<String, HighScore?> {
        return try {
            val prefs = context.gameDataStore.data.first()
            val str = prefs[HIGH_SCORES_KEY]
            if (str != null) json.decodeFromString(str) else emptyMap()
        } catch (e: Exception) {
            emptyMap()
        }
    }

    suspend fun getRecentScores(context: Context, limit: Int = 10): List<GameScore> {
        return try {
            val prefs = context.gameDataStore.data.first()
            val str = prefs[SCORES_KEY]
            if (str != null) {
                val scores: List<GameScore> = json.decodeFromString(str)
                scores.take(limit)
            } else emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun getTotalStats(context: Context): Triple<Int, Int, String> {
        return try {
            val scores = getRecentScores(context, 100)
            val totalScore = scores.sumOf { it.score }
            val avgScore = if (scores.isNotEmpty()) totalScore / scores.size else 0
            val gradeOrder = listOf("S", "A", "B", "C", "D")
            val bestGrade = scores.minByOrNull { gradeOrder.indexOf(it.breakdown.grade).let { i -> if (i < 0) 4 else i } }?.breakdown.grade ?: "-"
            Triple(totalScore, avgScore, bestGrade)
        } catch (e: Exception) {
            Triple(0, 0, "-")
        }
    }

    fun formatScore(score: Int): String = "%,d".format(score)

    fun getGradeColor(grade: String): Long = when (grade) {
        "S" -> 0xFFFFD700
        "A" -> 0xFF22D3EE
        "B" -> 0xFFA855F7
        "C" -> 0xFF3B82F6
        else -> 0xFF6B7280
    }

    fun getStarsDisplay(stars: Int): String = "★".repeat(stars) + "☆".repeat(5 - stars)
}
