// Главно меню - Кръстословица с модерен Glassmorphism дизайн
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassButton } from '../src/components/GlassButton';
import { GlassCard } from '../src/components/GlassCard';
import { GameSettings } from '../src/types';
import { 
  hasSavedGame, 
  loadSavedGame, 
  deleteSavedGame,
  loadGameStats,
  formatTime,
  formatDate,
  GameStats,
  SavedGame,
} from '../src/services/gameStorage';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings>({
    size: 'medium',
    difficulty: 'medium',
  });
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Animated values for floating orbs
  const orb1Anim = React.useRef(new Animated.Value(0)).current;
  const orb2Anim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check for saved game and load stats
    checkSavedGame();
    loadStats();

    // Animate floating orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const checkSavedGame = async () => {
    const saved = await loadSavedGame();
    setSavedGame(saved);
  };

  const loadStats = async () => {
    const stats = await loadGameStats();
    setGameStats(stats);
  };

  const startNewGame = () => {
    router.push({
      pathname: '/game',
      params: {
        size: settings.size,
        difficulty: settings.difficulty,
        resume: 'false',
      },
    });
  };

  const resumeGame = () => {
    if (savedGame) {
      router.push({
        pathname: '/game',
        params: {
          size: savedGame.settings.size,
          difficulty: savedGame.settings.difficulty,
          resume: 'true',
        },
      });
    }
  };

  const handleDeleteSavedGame = async () => {
    await deleteSavedGame();
    setSavedGame(null);
  };

  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Малък (9×9)';
      case 'medium': return 'Среден (13×13)';
      case 'large': return 'Голям (15×15)';
      default: return '';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Лесно';
      case 'medium': return 'Средно';
      case 'hard': return 'Трудно';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0a0a1a', '#1a1a3a', '#0f0f2a', '#151530']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Animated Floating Orbs */}
      <Animated.View 
        style={[
          styles.orb1, 
          { transform: [{ translateY: orb1TranslateY }] }
        ]} 
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.2)']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.orb2, 
          { transform: [{ translateY: orb2TranslateY }] }
        ]} 
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.3)', 'rgba(244, 114, 182, 0.15)']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.orb3, 
          { transform: [{ translateY: orb1TranslateY }] }
        ]} 
      >
        <LinearGradient
          colors={['rgba(34, 211, 238, 0.25)', 'rgba(56, 189, 248, 0.1)']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Stats Button */}
          <TouchableOpacity 
            style={styles.statsButton}
            onPress={() => setShowStats(!showStats)}
          >
            <BlurView intensity={40} tint="dark" style={styles.statsButtonBlur}>
              <Ionicons 
                name={showStats ? "close" : "stats-chart"} 
                size={22} 
                color="rgba(255,255,255,0.9)" 
              />
            </BlurView>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <BlurView intensity={25} tint="dark" style={styles.titleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
                style={styles.titleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.titleIconRow}>
                  <Ionicons name="grid" size={28} color="rgba(139, 92, 246, 0.9)" />
                </View>
                <Text style={styles.title}>КРЪСТОСЛОВИЦА</Text>
                <Text style={styles.subtitle}>Българска Пъзел Игра</Text>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Stats Panel */}
          {showStats && gameStats && (
            <GlassCard style={styles.statsCard}>
              <Text style={styles.statsTitle}>СТАТИСТИКА</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="game-controller" size={20} color="rgba(139, 92, 246, 0.9)" />
                  <Text style={styles.statValue}>{gameStats.gamesPlayed}</Text>
                  <Text style={styles.statLabel}>Игри</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={20} color="rgba(34, 211, 238, 0.9)" />
                  <Text style={styles.statValue}>{gameStats.gamesCompleted}</Text>
                  <Text style={styles.statLabel}>Завършени</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={20} color="rgba(236, 72, 153, 0.9)" />
                  <Text style={styles.statValue}>
                    {gameStats.bestTime ? formatTime(gameStats.bestTime) : '--:--'}
                  </Text>
                  <Text style={styles.statLabel}>Най-добро</Text>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Saved Game Card */}
          {savedGame && !showStats && (
            <GlassCard style={styles.savedGameCard}>
              <View style={styles.savedGameHeader}>
                <Ionicons name="bookmark" size={20} color="rgba(34, 211, 238, 0.9)" />
                <Text style={styles.savedGameTitle}>ЗАПАЗЕНА ИГРА</Text>
              </View>
              <View style={styles.savedGameInfo}>
                <Text style={styles.savedGameText}>
                  {getSizeLabel(savedGame.settings.size)} • {getDifficultyLabel(savedGame.settings.difficulty)}
                </Text>
                <Text style={styles.savedGameTime}>
                  Време: {formatTime(savedGame.elapsedTime)} • {formatDate(savedGame.savedAt)}
                </Text>
              </View>
              <View style={styles.savedGameButtons}>
                <TouchableOpacity style={styles.resumeButton} onPress={resumeGame}>
                  <LinearGradient
                    colors={['rgba(34, 211, 238, 0.3)', 'rgba(56, 189, 248, 0.15)']}
                    style={styles.resumeGradient}
                  >
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.resumeButtonText}>ПРОДЪЛЖИ</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSavedGame}>
                  <Ionicons name="trash-outline" size={18} color="rgba(255,100,100,0.8)" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Settings Card */}
          {!showStats && (
            <GlassCard style={styles.settingsCard}>
              {/* Size Selection */}
              <View style={styles.settingSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="resize" size={16} color="rgba(139, 92, 246, 0.9)" />
                  <Text style={styles.sectionLabel}>РАЗМЕР</Text>
                </View>
                <View style={styles.buttonRow}>
                  <GlassButton
                    title="Малък"
                    onPress={() => setSettings(s => ({ ...s, size: 'small' }))}
                    selected={settings.size === 'small'}
                    style={styles.optionButton}
                  />
                  <GlassButton
                    title="Среден"
                    onPress={() => setSettings(s => ({ ...s, size: 'medium' }))}
                    selected={settings.size === 'medium'}
                    style={styles.optionButton}
                  />
                  <GlassButton
                    title="Голям"
                    onPress={() => setSettings(s => ({ ...s, size: 'large' }))}
                    selected={settings.size === 'large'}
                    style={styles.optionButton}
                  />
                </View>
              </View>

              {/* Difficulty Selection */}
              <View style={styles.settingSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="speedometer" size={16} color="rgba(236, 72, 153, 0.9)" />
                  <Text style={styles.sectionLabel}>ТРУДНОСТ</Text>
                </View>
                <View style={styles.buttonRow}>
                  <GlassButton
                    title="Лесно"
                    onPress={() => setSettings(s => ({ ...s, difficulty: 'easy' }))}
                    selected={settings.difficulty === 'easy'}
                    style={styles.optionButton}
                  />
                  <GlassButton
                    title="Средно"
                    onPress={() => setSettings(s => ({ ...s, difficulty: 'medium' }))}
                    selected={settings.difficulty === 'medium'}
                    style={styles.optionButton}
                  />
                  <GlassButton
                    title="Трудно"
                    onPress={() => setSettings(s => ({ ...s, difficulty: 'hard' }))}
                    selected={settings.difficulty === 'hard'}
                    style={styles.optionButton}
                  />
                </View>
              </View>
            </GlassCard>
          )}

          {/* Start Button */}
          {!showStats && (
            <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
              <BlurView intensity={30} tint="dark" style={styles.startBlur}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.25)']}
                  style={styles.startGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" style={styles.startIcon} />
                  <Text style={styles.startButtonText}>НОВА ИГРА</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <Text style={styles.footerText}>
            {showStats 
              ? 'Натисни × за да затвориш статистиката'
              : 'Изберете размер и трудност за нова игра'
            }
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  orb1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -80,
    right: -80,
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 150,
    left: -60,
    overflow: 'hidden',
  },
  orb3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -40,
    right: 40,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  statsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statsButtonBlur: {
    padding: 12,
  },
  titleContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleBlur: {
    padding: 0,
  },
  titleGradient: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  titleIconRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    letterSpacing: 2,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  savedGameCard: {
    marginBottom: 16,
  },
  savedGameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  savedGameTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  savedGameInfo: {
    marginBottom: 16,
  },
  savedGameText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  savedGameTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  savedGameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  resumeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,100,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.2)',
  },
  settingsCard: {
    marginBottom: 20,
  },
  settingSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
  },
  startButton: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  startBlur: {
    flex: 1,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  startIcon: {
    marginRight: 10,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
