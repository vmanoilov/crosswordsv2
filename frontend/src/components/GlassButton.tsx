// Glassmorphism Button Component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  selected?: boolean;
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  title, 
  onPress, 
  style,
  textStyle,
  selected = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.container, selected && styles.selected, style]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <BlurView intensity={selected ? 50 : 30} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={
            selected 
              ? ['rgba(100,200,255,0.3)', 'rgba(100,150,255,0.15)'] 
              : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, selected && styles.selectedText, textStyle]}>
            {title}
          </Text>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 50,
  },
  selected: {
    borderColor: 'rgba(100,200,255,0.5)',
  },
  blur: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  text: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
  },
});
