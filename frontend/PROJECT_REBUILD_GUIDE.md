# PROJECT_REBUILD_GUIDE.md

## 1. Objective

The objective is to reconstruct the **Bulgarian Crossword Game** (`bulgarian-word-grid`), a mobile crossword puzzle application built with React Native and Expo. The reconstruction must achieve full parity in:
- **Functionality**: Game logic, puzzle generation, scoring, saving/loading.
- **UI/UX**: Exact Glassmorphism design, animations, and haptic feedback.
- **Data**: Compatibility with the existing `AsyncStorage` schema.
- **Architecture**: Strict adherence to the original file structure and TypeScript types.

## 2. Source Project Analysis

### Architecture
- **Framework**: Expo (React Native) with Expo Router for navigation.
- **Language**: TypeScript.
- **State Management**: React `useState`/`useEffect` for local state; `AsyncStorage` for persistence.
- **Styling**: `StyleSheet` combined with `expo-blur` and `expo-linear-gradient` for the Glassmorphism aesthetic.
- **Navigation**: File-based routing via `app/` directory (`app/index.tsx`, `app/game.tsx`).

### Core Modules
1.  **Engine (`src/engine/`)**:
    -   `crosswordEngine.ts`: Implements a Constraint Satisfaction Problem (CSP) solver with backtracking to generate valid crossword grids on the fly.
    -   `bulgarianDictionary.ts`: Contains the word list categorized by difficulty.
2.  **Services (`src/services/`)**:
    -   `gameStorage.ts`: Handles saving/loading game state and statistics to `AsyncStorage`.
    -   `scoringService.ts`: Calculates scores based on time, difficulty, and hints.
    -   `soundService.ts`: Manages sound effects (simulated via haptics/tones) using `expo-av`.
3.  **Components (`src/components/`)**:
    -   High-quality UI components like `GlassCard`, `GlassButton`, and the interactive `CrosswordGrid`.

## 3. Platform Mapping

| Original Component | Role | Equivalent / Strategy | Notes |
|---|---|---|---|
| `expo-router` | Navigation | `expo-router` | Use file-based routing in `app/`. |
| `expo-blur` | UI/Visuals | `expo-blur` | Essential for Glassmorphism. |
| `expo-linear-gradient` | UI/Visuals | `expo-linear-gradient` | Essential for backgrounds and buttons. |
| `AsyncStorage` | Persistence | `@react-native-async-storage/async-storage` | Use exact keys (`@crossword_saved_game`, etc.). |
| `expo-haptics` | UX | `expo-haptics` | Critical for game feel. |
| `expo-av` | Audio | `expo-av` | Used for sound effects. |

## 4. Exact Reconstruction Plan

### Phase 1: Bootstrap & Configuration
1.  **Initialize Project**: Create a new Expo project with TypeScript and Router.
2.  **Install Dependencies**:
    ```bash
    npx expo install expo-router expo-blur expo-linear-gradient expo-haptics expo-av expo-status-bar expo-system-ui @react-native-async-storage/async-storage @expo/vector-icons react-native-safe-area-context react-native-screens react-native-reanimated
    ```
3.  **Configure Configs**: Update `app.json` (orientation, plugins) and `metro.config.js`.

### Phase 2: Core Logic (Engine & Services)
1.  **Types**: Create `src/types/index.ts` first to define `CrosswordPuzzle`, `Cell`, etc.
2.  **Dictionary**: Implement `src/engine/bulgarianDictionary.ts`.
3.  **Engine**: Implement `src/engine/crosswordEngine.ts`. **Critical**: Ensure the CSP solver logic is exact to reproduce the generation quality.
4.  **Storage**: Implement `src/services/gameStorage.ts`.
5.  **Scoring**: Implement `src/services/scoringService.ts`.
6.  **Sound**: Implement `src/services/soundService.ts`.

### Phase 3: UI Components
1.  **Base Components**: `GlassCard.tsx`, `GlassButton.tsx` (these define the look).
2.  **Game Components**: `CrosswordCell.tsx`, `CrosswordGrid.tsx`, `ClueList.tsx`.
3.  **Modals**: `ScoreModal.tsx`.

### Phase 4: Screens & Routing
1.  **Layout**: Implement `app/_layout.tsx` (Stack navigator).
2.  **Home Screen**: Implement `app/index.tsx` (Menu, animations).
3.  **Game Screen**: Implement `app/game.tsx` (Main game loop, interactions).

## 5. File-by-File Recreation Specification

### `src/types/index.ts`
- **Purpose**: Central type definitions.
- **Key Types**: `CrosswordPuzzle`, `Cell`, `PlacedWord`, `GameSettings`.

### `src/engine/crosswordEngine.ts`
- **Logic**:
    -   `generateCrossword(settings)`: Main entry point.
    -   `solveCSP(...)`: Recursive backtracking solver.
    -   `createSymmetricPattern(...)`: Generates 180-degree symmetric black squares.
- **Note**: This is the most complex file. Copy logic exactly.

### `src/components/GlassCard.tsx`
- **Visuals**: Uses `BlurView` with `tint="dark"` and `intensity=25` (default).
- **Structure**: `View` -> `BlurView` -> `LinearGradient`.

### `src/services/gameStorage.ts`
- **Keys**:
    -   `@crossword_saved_game`
    -   `@crossword_game_stats`
    -   `@crossword_scores`
- **Behavior**: Auto-saves on app backgrounding (handled in `game.tsx` but uses this service).

## 6. Implementation Instructions for Another Coding Model

When asking an AI to rebuild this:
1.  **Feed the Snapshot**: Provide the `PROJECT_FULL_SNAPSHOT.md` first.
2.  **Instruction**: "Rebuild this project file by file. Start with `src/types`, then the engine, then services, then components, and finally the app screens."
3.  **Constraint**: "Do not simplify the CSP solver in `crosswordEngine.ts`. It must be the exact backtracking implementation."

## 7. Environment and Dependency Translation

- **Node Version**: 18+ recommended.
- **Expo SDK**: 52 (or latest stable).
- **Environment Variables**: None required for the core game.

## 8. UI/UX Parity Rules

1.  **Glassmorphism**: All cards and buttons MUST use `BlurView` + `LinearGradient`. No solid backgrounds for containers.
2.  **Animations**: Floating orbs in the background (`Animated.loop`).
3.  **Colors**:
    -   Background: Deep blue/purple gradients (`#0a0a1a`, `#1a1a3a`).
    -   Accents: Cyan (`#22d3ee`), Purple (`#8b5cf6`), Pink (`#ec4899`).
4.  **Haptics**: Trigger on every keypress (`light`), completion (`success`), and error (`error`).

## 9. API and Data Parity Rules

- **Storage Schema**:
    -   `SavedGame`: `{ puzzle: ..., settings: ..., elapsedTime: number, savedAt: number }`
    -   `GameScore`: `{ id: string, score: number, breakdown: ScoreBreakdown, ... }`
-   **Validation**: Ensure `CrosswordPuzzle` structure matches exactly so saved games can be loaded.

## 10. Testing and Verification Matrix

| Feature | Check |
|---|---|
| **Generation** | Does `generateCrossword` produce a valid, connected grid? |
| **Symmetry** | Are black squares rotationally symmetric? |
| **Persistence** | Does the game resume exactly where left off after restarting the app? |
| **Scoring** | Is the score calculated correctly based on time and difficulty? |
| **Visuals** | Do the background orbs animate smoothly? |

## 11. Final Reconstruction Prompt

```text
You are an expert React Native developer. I need you to reconstruct the "Bulgarian Crossword Game" project exactly as described in the provided PROJECT_FULL_SNAPSHOT.md.

1. Initialize a new Expo project with TypeScript.
2. Install the required dependencies (expo-blur, expo-linear-gradient, etc.).
3. Recreate the file structure exactly:
   - src/types/
   - src/engine/
   - src/services/
   - src/components/
   - app/
4. Implement the files in this order:
   a. Types
   b. Engine (Copy the CSP solver exactly)
   c. Services
   d. Components (Glassmorphism UI)
   e. App Screens
5. Ensure all styling matches the Glassmorphism aesthetic defined in the snapshot.
6. Verify that game saving/loading works.
```
