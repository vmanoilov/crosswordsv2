package com.bulgarianwordgrid.engine

import com.bulgarianwordgrid.model.*
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

private val GRID_SIZES = mapOf(
    GridSize.SMALL to 9,
    GridSize.MEDIUM to 13,
    GridSize.LARGE to 15
)

private data class Slot(
    val startRow: Int,
    val startCol: Int,
    val length: Int,
    val direction: Direction,
    val cells: List<CellPosition>
)

private class GridState(
    val cells: Array<Array<String?>>,
    val blocked: Array<BooleanArray>,
    val size: Int
)

private fun createEmptyGridState(size: Int): GridState {
    val cells = Array(size) { arrayOfNulls<String>(size) }
    val blocked = Array(size) { BooleanArray(size) }
    return GridState(cells, blocked, size)
}

private fun createSymmetricPattern(size: Int, density: Double = 0.15): Array<BooleanArray> {
    val blocked = Array(size) { BooleanArray(size) }
    val patterns = getGoodPatterns(size)
    val selectedPattern = patterns[Random.nextInt(patterns.size)]
    for ((row, col) in selectedPattern) {
        if (row < size && col < size) {
            blocked[row][col] = true
            blocked[size - 1 - row][size - 1 - col] = true
        }
    }
    return blocked
}

private fun getGoodPatterns(size: Int): List<List<Pair<Int, Int>>> = when (size) {
    9 -> listOf(
        listOf(0 to 4, 1 to 4, 4 to 0, 4 to 1, 4 to 7, 4 to 8, 7 to 4, 8 to 4),
        listOf(0 to 3, 0 to 5, 3 to 0, 3 to 8, 5 to 0, 5 to 8, 8 to 3, 8 to 5),
        listOf(1 to 1, 1 to 7, 4 to 4, 7 to 1, 7 to 7),
    )
    13 -> listOf(
        listOf(0 to 4, 0 to 8, 1 to 4, 1 to 8, 4 to 0, 4 to 1, 4 to 11, 4 to 12,
            6 to 6, 8 to 0, 8 to 1, 8 to 11, 8 to 12, 11 to 4, 11 to 8, 12 to 4, 12 to 8),
        listOf(0 to 5, 0 to 7, 2 to 3, 2 to 9, 3 to 2, 3 to 10, 5 to 0, 5 to 12,
            6 to 6, 7 to 0, 7 to 12, 9 to 2, 9 to 10, 10 to 3, 10 to 9, 12 to 5, 12 to 7),
    )
    else -> listOf(
        listOf(0 to 4, 0 to 10, 1 to 4, 1 to 10, 3 to 6, 3 to 8, 4 to 0, 4 to 1, 4 to 13, 4 to 14,
            6 to 3, 6 to 11, 7 to 7, 8 to 3, 8 to 11, 10 to 0, 10 to 1, 10 to 13, 10 to 14,
            11 to 6, 11 to 8, 13 to 4, 13 to 10, 14 to 4, 14 to 10),
        listOf(0 to 5, 0 to 9, 2 to 5, 2 to 9, 4 to 3, 4 to 7, 4 to 11, 5 to 0, 5 to 2, 5 to 12, 5 to 14,
            7 to 7, 9 to 0, 9 to 2, 9 to 12, 9 to 14, 10 to 3, 10 to 7, 10 to 11,
            12 to 5, 12 to 9, 14 to 5, 14 to 9),
    )
}

private fun findSlots(blocked: Array<BooleanArray>, size: Int): List<Slot> {
    val slots = mutableListOf<Slot>()
    for (row in 0 until size) {
        var startCol = 0
        while (startCol < size) {
            while (startCol < size && blocked[row][startCol]) {
                startCol++
            }
            if (startCol >= size) break
            var endCol = startCol
            val cells = mutableListOf<CellPosition>()
            while (endCol < size && !blocked[row][endCol]) {
                cells.add(CellPosition(row, endCol))
                endCol++
            }
            val length = endCol - startCol
            if (length >= 3) {
                slots.add(Slot(row, startCol, length, Direction.ACROSS, cells))
            }
            startCol = endCol + 1
        }
    }
    for (col in 0 until size) {
        var startRow = 0
        while (startRow < size) {
            while (startRow < size && blocked[startRow][col]) {
                startRow++
            }
            if (startRow >= size) break
            var endRow = startRow
            val cells = mutableListOf<CellPosition>()
            while (endRow < size && !blocked[endRow][col]) {
                cells.add(CellPosition(endRow, col))
                endRow++
            }
            val length = endRow - startRow
            if (length >= 3) {
                slots.add(Slot(startRow, col, length, Direction.DOWN, cells))
            }
            startRow = endRow + 1
        }
    }
    return slots
}

private fun canPlaceWord(word: String, slot: Slot, gridState: GridState): Boolean {
    if (word.length != slot.length) return false
    for (i in word.indices) {
        val (row, col) = slot.cells[i]
        val existing = gridState.cells[row][col]
        if (existing != null && existing != word[i].toString()) return false
    }
    return true
}

private fun placeWord(word: String, slot: Slot, gridState: GridState) {
    for (i in word.indices) {
        val (row, col) = slot.cells[i]
        gridState.cells[row][col] = word[i].toString()
    }
}

private fun removeWord(slot: Slot, gridState: GridState, originalCells: Array<Array<String?>>) {
    for ((row, col) in slot.cells) {
        gridState.cells[row][col] = originalCells[row][col]
    }
}

private fun scoreSlot(slot: Slot, gridState: GridState, availableWords: List<WordClue>): Int {
    var filledCount = 0
    val constraints = mutableListOf<Pair<Int, String>>()
    for (i in slot.cells.indices) {
        val (row, col) = slot.cells[i]
        val existing = gridState.cells[row][col]
        if (existing != null) {
            filledCount++
            constraints.add(i to existing)
        }
    }
    val compatibleWords = availableWords.filter { wc ->
        wc.word.length == slot.length &&
            constraints.all { (index, letter) -> wc.word[index].toString() == letter }
    }
    if (compatibleWords.isEmpty()) return -1
    val constraintScore = filledCount * 20
    val scarcityScore = max(0, 50 - compatibleWords.size)
    val lengthScore = slot.length * 2
    return constraintScore + scarcityScore + lengthScore
}

private fun getCompatibleWords(
    slot: Slot,
    gridState: GridState,
    availableWords: List<WordClue>,
    usedWords: MutableSet<String>
): List<WordClue> {
    val constraints = mutableListOf<Pair<Int, String>>()
    for (i in slot.cells.indices) {
        val (row, col) = slot.cells[i]
        val existing = gridState.cells[row][col]
        if (existing != null) {
            constraints.add(i to existing)
        }
    }
    return availableWords.filter { wc ->
        wc.word.length == slot.length &&
            wc.word !in usedWords &&
            constraints.all { (index, letter) -> wc.word[index].toString() == letter }
    }
}

private fun copyGridState(state: GridState): Array<Array<String?>> {
    return state.cells.map { it.copyOf() }.toTypedArray()
}

private fun solveCSP(
    slots: List<Slot>,
    gridState: GridState,
    availableWords: List<WordClue>,
    usedWords: MutableSet<String>,
    placedWords: MutableList<PlacedWord>,
    maxAttempts: Int = 1000
): Boolean {
    var attempts = 0

    fun solve(): Boolean {
        attempts++
        if (attempts > maxAttempts) return true

        val unfilledSlots = slots.filter { slot ->
            slot.cells.any { (row, col) -> gridState.cells[row][col] == null }
        }
        if (unfilledSlots.isEmpty()) return true

        val scoredSlots = unfilledSlots
            .map { slot -> slot to scoreSlot(slot, gridState, availableWords) }
            .filter { (_, score) -> score > 0 }
            .sortedByDescending { (_, score) -> score }

        if (scoredSlots.isEmpty()) return false

        val slot = scoredSlots.first().first
        val compatible = getCompatibleWords(slot, gridState, availableWords, usedWords)
        val shuffled = compatible.shuffled().take(10)

        for (wordClue in shuffled) {
            val originalCells = copyGridState(gridState)
            if (canPlaceWord(wordClue.word, slot, gridState)) {
                placeWord(wordClue.word, slot, gridState)
                usedWords.add(wordClue.word)
                placedWords.add(
                    PlacedWord(
                        word = wordClue.word,
                        clue = wordClue.clue,
                        startRow = slot.startRow,
                        startCol = slot.startCol,
                        direction = slot.direction,
                        number = 0
                    )
                )
                if (solve()) return true
                removeWord(slot, gridState, originalCells)
                usedWords.remove(wordClue.word)
                placedWords.removeAt(placedWords.lastIndex)
            }
        }
        return false
    }

    return solve()
}

private fun assignNumbers(placedWords: MutableList<PlacedWord>) {
    val sortedIndices = placedWords.indices.sortedWith { a, b ->
        val wa = placedWords[a]
        val wb = placedWords[b]
        if (wa.startRow != wb.startRow) wa.startRow - wb.startRow
        else wa.startCol - wb.startCol
    }
    val numberMap = mutableMapOf<String, Int>()
    var currentNumber = 1
    for (idx in sortedIndices) {
        val word = placedWords[idx]
        val key = "${word.startRow}-${word.startCol}"
        if (key !in numberMap) {
            numberMap[key] = currentNumber++
        }
        placedWords[idx] = word.copy(number = numberMap[key]!!)
    }
}

private fun createFinalGrid(
    gridState: GridState,
    blocked: Array<BooleanArray>,
    placedWords: List<PlacedWord>
): CrosswordGrid {
    val numberMap = mutableMapOf<String, Int>()
    for (word in placedWords) {
        val key = "${word.startRow}-${word.startCol}"
        if (key !in numberMap) {
            numberMap[key] = word.number
        }
    }
    val cells = mutableListOf<MutableList<Cell>>()
    for (row in 0 until gridState.size) {
        val rowCells = mutableListOf<Cell>()
        for (col in 0 until gridState.size) {
            val key = "$row-$col"
            rowCells.add(
                Cell(
                    letter = gridState.cells[row][col],
                    isBlocked = blocked[row][col] || gridState.cells[row][col] == null,
                    number = numberMap[key],
                    isSelected = false,
                    isHighlighted = false,
                    userInput = "",
                    isCorrect = null
                )
            )
        }
        cells.add(rowCells)
    }
    return CrosswordGrid(
        cells = cells,
        width = gridState.size,
        height = gridState.size
    )
}

private fun createFallbackPuzzle(gridSize: Int, words: List<WordClue>): CrosswordPuzzle {
    val blocked = createSymmetricPattern(gridSize)
    val gridState = createEmptyGridState(gridSize)
    val slots = findSlots(blocked, gridSize)
    val placedWords = mutableListOf<PlacedWord>()
    val usedWords = mutableSetOf<String>()
    for (slot in slots) {
        val compatible = words.filter { wc ->
            wc.word.length == slot.length &&
                wc.word !in usedWords &&
                canPlaceWord(wc.word, slot, gridState)
        }
        if (compatible.isNotEmpty()) {
            val word = compatible[Random.nextInt(compatible.size)]
            placeWord(word.word, slot, gridState)
            usedWords.add(word.word)
            placedWords.add(
                PlacedWord(
                    word = word.word,
                    clue = word.clue,
                    startRow = slot.startRow,
                    startCol = slot.startCol,
                    direction = slot.direction,
                    number = 0
                )
            )
        }
    }
    assignNumbers(placedWords)
    val finalGrid = createFinalGrid(gridState, blocked, placedWords)
    return CrosswordPuzzle(
        grid = finalGrid,
        placedWords = placedWords,
        acrossClues = placedWords.filter { it.direction == Direction.ACROSS }.sortedBy { it.number },
        downClues = placedWords.filter { it.direction == Direction.DOWN }.sortedBy { it.number }
    )
}

fun generateCrossword(settings: GameSettings): CrosswordPuzzle {
    val gridSize = GRID_SIZES[settings.size]!!
    val words = shuffleList(getWordsByDifficulty(settings.difficulty))
    val validWords = words.filter { it.word.length in 3..(gridSize - 2) }
    var bestPuzzle: CrosswordPuzzle? = null
    var bestScore = 0
    val attempts = 5
    for (attempt in 0 until attempts) {
        val blocked = createSymmetricPattern(gridSize)
        val gridState = createEmptyGridState(gridSize)
        for (row in 0 until gridSize) {
            for (col in 0 until gridSize) {
                gridState.blocked[row][col] = blocked[row][col]
            }
        }
        val slots = findSlots(blocked, gridSize)
        if (slots.size < 5) continue
        val usedWords = mutableSetOf<String>()
        val placedWords = mutableListOf<PlacedWord>()
        solveCSP(slots, gridState, validWords, usedWords, placedWords, 500)
        if (placedWords.size > bestScore) {
            bestScore = placedWords.size
            assignNumbers(placedWords)
            val finalGrid = createFinalGrid(gridState, blocked, placedWords)
            val acrossClues = placedWords.filter { it.direction == Direction.ACROSS }.sortedBy { it.number }
            val downClues = placedWords.filter { it.direction == Direction.DOWN }.sortedBy { it.number }
            bestPuzzle = CrosswordPuzzle(
                grid = finalGrid,
                placedWords = placedWords,
                acrossClues = acrossClues,
                downClues = downClues
            )
        }
    }
    return bestPuzzle ?: createFallbackPuzzle(gridSize, validWords)
}

fun checkSolution(puzzle: CrosswordPuzzle): Boolean {
    for (row in puzzle.grid.cells) {
        for (cell in row) {
            if (!cell.isBlocked && cell.letter != null) {
                if (cell.userInput.uppercase() != cell.letter.uppercase()) return false
            }
        }
    }
    return true
}

fun getWordCells(
    puzzle: CrosswordPuzzle,
    row: Int,
    col: Int,
    direction: Direction
): List<CellPosition> {
    val cells = mutableListOf<CellPosition>()
    val grid = puzzle.grid.cells
    val size = puzzle.grid.width
    if (direction == Direction.ACROSS) {
        var startCol = col
        while (startCol > 0 && !grid[row][startCol - 1].isBlocked) {
            startCol--
        }
        var currentCol = startCol
        while (currentCol < size && !grid[row][currentCol].isBlocked) {
            cells.add(CellPosition(row, currentCol))
            currentCol++
        }
    } else {
        var startRow = row
        while (startRow > 0 && !grid[startRow - 1][col].isBlocked) {
            startRow--
        }
        var currentRow = startRow
        while (currentRow < size && !grid[currentRow][col].isBlocked) {
            cells.add(CellPosition(currentRow, col))
            currentRow++
        }
    }
    return cells
}
