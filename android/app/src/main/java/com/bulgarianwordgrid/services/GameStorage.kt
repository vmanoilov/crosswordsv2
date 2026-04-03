package com.bulgarianwordgrid.services

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.bulgarianwordgrid.model.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

internal val Context.gameDataStore: DataStore<Preferences> by preferencesDataStore(name = "crossword_prefs")

object GameStorage {
    private val SAVED_GAME_KEY = stringPreferencesKey("saved_game")
    private val GAME_STATS_KEY = stringPreferencesKey("game_stats")

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun saveGame(context: Context, puzzle: CrosswordPuzzle, settings: GameSettings, elapsedTime: Int) {
        try {
            val savedGame = SavedGame(
                puzzle = puzzle,
                settings = settings,
                elapsedTime = elapsedTime,
                savedAt = System.currentTimeMillis()
            )
            context.gameDataStore.edit { prefs ->
                prefs[SAVED_GAME_KEY] = json.encodeToString(savedGame)
            }
        } catch (e: Exception) {
            android.util.Log.e("GameStorage", "Error saving game", e)
        }
    }

    suspend fun loadSavedGame(context: Context): SavedGame? {
        return try {
            val prefs = context.gameDataStore.data.first()
            val savedGameStr = prefs[SAVED_GAME_KEY]
            if (savedGameStr != null) json.decodeFromString<SavedGame>(savedGameStr) else null
        } catch (e: Exception) {
            android.util.Log.e("GameStorage", "Error loading saved game", e)
            null
        }
    }

    suspend fun deleteSavedGame(context: Context) {
        try {
            context.gameDataStore.edit { it.remove(SAVED_GAME_KEY) }
        } catch (e: Exception) {
            android.util.Log.e("GameStorage", "Error deleting saved game", e)
        }
    }

    suspend fun hasSavedGame(context: Context): Boolean {
        return try {
            val prefs = context.gameDataStore.data.first()
            prefs[SAVED_GAME_KEY] != null
        } catch (e: Exception) {
            false
        }
    }

    suspend fun loadGameStats(context: Context): GameStats {
        return try {
            val prefs = context.gameDataStore.data.first()
            val statsStr = prefs[GAME_STATS_KEY]
            if (statsStr != null) json.decodeFromString<GameStats>(statsStr) else GameStats()
        } catch (e: Exception) {
            android.util.Log.e("GameStorage", "Error loading game stats", e)
            GameStats()
        }
    }

    suspend fun updateGameStats(context: Context, completed: Boolean, time: Int) {
        try {
            val stats = loadGameStats(context)
            val updated = stats.copy(
                gamesPlayed = stats.gamesPlayed + 1,
                totalTime = stats.totalTime + time,
                lastPlayed = System.currentTimeMillis(),
                gamesCompleted = if (completed) stats.gamesCompleted + 1 else stats.gamesCompleted,
                bestTime = if (completed) {
                    if (stats.bestTime == null || time < stats.bestTime) time else stats.bestTime
                } else stats.bestTime
            )
            context.gameDataStore.edit { prefs ->
                prefs[GAME_STATS_KEY] = json.encodeToString(updated)
            }
        } catch (e: Exception) {
            android.util.Log.e("GameStorage", "Error updating game stats", e)
        }
    }

    fun formatTime(seconds: Int): String {
        val mins = seconds / 60
        val secs = seconds % 60
        return "%02d:%02d".format(mins, secs)
    }

    fun formatDate(timestamp: Long): String {
        val cal = java.util.Calendar.getInstance()
        cal.timeInMillis = timestamp
        val day = "%02d".format(cal.get(java.util.Calendar.DAY_OF_MONTH))
        val month = "%02d".format(cal.get(java.util.Calendar.MONTH) + 1)
        val hours = "%02d".format(cal.get(java.util.Calendar.HOUR_OF_DAY))
        val minutes = "%02d".format(cal.get(java.util.Calendar.MINUTE))
        return "$day.$month $hours:$minutes"
    }
}
