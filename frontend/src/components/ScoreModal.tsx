// Score Result Modal Component - Резултат
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScoreBreakdown, formatScore, getGradeColor, getStarsDisplay } from '../services/scoringService';
import { GameSettings } from '../types';

const { width } = Dimensions.get('window');

interface ScoreModalProps {
  visible: boolean;
  onClose: () => void;
  onNewGame: () => void;
  scoreBreakdown: ScoreBreakdown | null;
  settings: GameSettings;
  timeSeconds: number;
  wordsFound: number;
  totalWords: number;
  isNewHighScore: boolean;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  visible,
  onClose,
  onNewGame,
  scoreBreakdown,
  settings,
  timeSeconds,
  wordsFound,
  totalWords,
  isNewHighScore,
}) => {
  if (!scoreBreakdown) return null;

  const gradeColor = getGradeColor(scoreBreakdown.grade);
  const stars = getStarsDisplay(scoreBreakdown.stars);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Лесно';
      case 'medium': return 'Средно';
      case 'hard': return 'Трудно';
      default: return '';
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '9×9';
      case 'medium': return '13×13';
      case 'large': return '15×15';
      default: return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={styles.blurOverlay}>
          <View style={styles.modalContainer}>
            <BlurView intensity={30} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
                style={styles.modalGradient}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>РЕЗУЛТАТ</Text>
                  {isNewHighScore && (
                    <View style={styles.highScoreBadge}>
                      <Ionicons name="trophy" size={14} color="#ffd700" />
                      <Text style={styles.highScoreText}>НОВ РЕКОРД!</Text>
                    </View>
                  )}
                </View>

                {/* Grade Display */}
                <View style={styles.gradeContainer}>
                  <View style={[styles.gradeBadge, { borderColor: gradeColor }]}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>
                      {scoreBreakdown.grade}
                    </Text>
                  </View>
                  <Text style={[styles.starsText, { color: gradeColor }]}>{stars}</Text>
                </View>

                {/* Total Score */}
                <View style={styles.totalScoreContainer}>
                  <Text style={styles.totalScoreLabel}>ОБЩ РЕЗУЛТАТ</Text>
                  <Text style={styles.totalScoreValue}>
                    {formatScore(scoreBreakdown.totalScore)}
                  </Text>
                </View>

                {/* Game Info */}
                <View style={styles.gameInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={18} color="rgba(34, 211, 238, 0.9)" />
                    <Text style={styles.infoValue}>{formatTime(timeSeconds)}</Text>
                    <Text style={styles.infoLabel}>Време</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={18} color="rgba(34, 197, 94, 0.9)" />
                    <Text style={styles.infoValue}>{wordsFound}/{totalWords}</Text>
                    <Text style={styles.infoLabel}>Думи</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="speedometer" size={18} color="rgba(236, 72, 153, 0.9)" />
                    <Text style={styles.infoValue}>{getDifficultyLabel(settings.difficulty)}</Text>
                    <Text style={styles.infoLabel}>{getSizeLabel(settings.size)}</Text>
                  </View>
                </View>

                {/* Score Breakdown */}
                <View style={styles.breakdown}>
                  <Text style={styles.breakdownTitle}>РАЗБИВКА НА ТОЧКИТЕ</Text>
                  
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Базови точки</Text>
                    <Text style={styles.breakdownValue}>+{formatScore(scoreBreakdown.baseScore)}</Text>
                  </View>
                  
                  {scoreBreakdown.difficultyBonus > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Бонус трудност</Text>
                      <Text style={[styles.breakdownValue, styles.bonusValue]}>
                        +{formatScore(scoreBreakdown.difficultyBonus)}
                      </Text>
                    </View>
                  )}
                  
                  {scoreBreakdown.sizeBonus > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Бонус размер</Text>
                      <Text style={[styles.breakdownValue, styles.bonusValue]}>
                        +{formatScore(scoreBreakdown.sizeBonus)}
                      </Text>
                    </View>
                  )}
                  
                  {scoreBreakdown.speedBonus > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Бонус скорост</Text>
                      <Text style={[styles.breakdownValue, styles.bonusValue]}>
                        +{formatScore(scoreBreakdown.speedBonus)}
                      </Text>
                    </View>
                  )}
                  
                  {scoreBreakdown.noHintsBonus > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Без подсказки</Text>
                      <Text style={[styles.breakdownValue, styles.bonusValue]}>
                        +{formatScore(scoreBreakdown.noHintsBonus)}
                      </Text>
                    </View>
                  )}
                  
                  {scoreBreakdown.perfectBonus > 0 && (
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Перфектна игра!</Text>
                      <Text style={[styles.breakdownValue, styles.perfectValue]}>
                        +{formatScore(scoreBreakdown.perfectBonus)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.newGameButton} onPress={onNewGame}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.4)', 'rgba(99, 102, 241, 0.25)']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="add-circle" size={20} color="#fff" />
                      <Text style={styles.newGameText}>НОВА ИГРА</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>ЗАТВОРИ</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalBlur: {
    flex: 1,
  },
  modalGradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 3,
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  highScoreText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '700',
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeText: {
    fontSize: 48,
    fontWeight: '900',
  },
  starsText: {
    fontSize: 24,
    marginTop: 10,
    letterSpacing: 4,
  },
  totalScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  totalScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  totalScoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  breakdown: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  breakdownLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bonusValue: {
    color: 'rgba(34, 211, 238, 0.9)',
  },
  perfectValue: {
    color: '#ffd700',
  },
  buttons: {
    gap: 12,
  },
  newGameButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  newGameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
});
