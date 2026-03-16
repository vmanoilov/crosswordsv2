// Sound Effects Service using expo-av
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = '@crossword_sound_enabled';

// Sound frequencies for different effects (using oscillator-like tones)
type SoundType = 'tap' | 'type' | 'correct' | 'incorrect' | 'complete' | 'select' | 'navigate';

class SoundService {
  private soundEnabled: boolean = true;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load sound preference
      const enabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      this.soundEnabled = enabled !== 'false';
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      this.initialized = true;
    } catch (error) {
      console.log('Sound init error:', error);
    }
  }

  async setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Generate a simple beep sound using expo-av
  private async playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.soundEnabled) return;

    try {
      // Create a simple audio context tone using oscillator
      // Since expo-av doesn't have direct oscillator, we'll use haptics as fallback
      // and rely on the visual feedback for sound-like effects
      
      // For now, we'll use a placeholder that can be enhanced with actual audio files
      // In production, you'd load actual .wav or .mp3 files
      
    } catch (error) {
      // Silently fail for sound effects
    }
  }

  // Play different sound effects
  async play(type: SoundType) {
    if (!this.soundEnabled) return;

    // Sound configurations (frequency, duration, volume)
    const sounds: Record<SoundType, [number, number, number]> = {
      tap: [800, 50, 0.2],
      type: [600, 30, 0.15],
      correct: [880, 150, 0.3],
      incorrect: [200, 200, 0.25],
      complete: [1000, 300, 0.4],
      select: [700, 40, 0.2],
      navigate: [500, 60, 0.15],
    };

    const [freq, dur, vol] = sounds[type];
    await this.playTone(freq, dur, vol);
  }
}

export const soundService = new SoundService();

// Haptic feedback as sound alternative (works on mobile)
import * as Haptics from 'expo-haptics';

export const playHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Haptics not available on web
  }
};

// Combined sound + haptic feedback
export const playFeedback = async (type: SoundType) => {
  await soundService.play(type);
  
  // Map sound types to haptic types
  const hapticMap: Record<SoundType, 'light' | 'medium' | 'heavy' | 'success' | 'error'> = {
    tap: 'light',
    type: 'light',
    correct: 'success',
    incorrect: 'error',
    complete: 'heavy',
    select: 'medium',
    navigate: 'light',
  };
  
  await playHaptic(hapticMap[type]);
};
