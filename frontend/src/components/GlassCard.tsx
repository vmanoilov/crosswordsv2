// Enhanced Glassmorphism Card Component
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'default' | 'accent' | 'subtle';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style,
  intensity = 25,
  variant = 'default',
}) => {
  const gradientColors = {
    default: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)'] as const,
    accent: ['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.05)'] as const,
    subtle: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] as const,
  };

  const borderColors = {
    default: 'rgba(255,255,255,0.12)',
    accent: 'rgba(139, 92, 246, 0.25)',
    subtle: 'rgba(255,255,255,0.08)',
  };

  return (
    <View style={[styles.container, { borderColor: borderColors[variant] }, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={gradientColors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
