// Главно меню - Кръстословица
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { GlassButton } from '../src/components/GlassButton';
import { GlassCard } from '../src/components/GlassCard';
import { GameSettings } from '../src/types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings>({
    size: 'medium',
    difficulty: 'medium',
  });

  const startGame = () => {
    router.push({
      pathname: '/game',
      params: {
        size: settings.size,
        difficulty: settings.difficulty,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <BlurView intensity={40} tint="dark" style={styles.titleBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                style={styles.titleGradient}
              >
                <Text style={styles.title}>КРЪСТОСЛОВИЦА</Text>
                <Text style={styles.subtitle}>Българска Пъзел Игра</Text>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Settings Card */}
          <GlassCard style={styles.settingsCard}>
            {/* Size Selection */}
            <Text style={styles.sectionLabel}>РАЗМЕР</Text>
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

            {/* Difficulty Selection */}
            <Text style={styles.sectionLabel}>ТРУДНОСТ</Text>
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
          </GlassCard>

          {/* Start Button */}
          <GlassButton
            title="НОВА ИГРА"
            onPress={startGame}
            style={styles.startButton}
            textStyle={styles.startButtonText}
          />

          {/* Info text */}
          <Text style={styles.infoText}>
            Изберете размер и трудност, след това натиснете Нова игра
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
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(100, 200, 255, 0.15)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(200, 100, 255, 0.1)',
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(100, 255, 200, 0.1)',
    bottom: -50,
    right: 50,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  titleBlur: {
    padding: 0,
  },
  titleGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    letterSpacing: 1,
  },
  settingsCard: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  optionButton: {
    flex: 1,
  },
  startButton: {
    marginBottom: 16,
    minHeight: 60,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  infoText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
});
