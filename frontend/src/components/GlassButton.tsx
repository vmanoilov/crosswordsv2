// Enhanced Glassmorphism Button Component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  title, 
  onPress, 
  style,
  textStyle,
  selected = false,
  disabled = false,
  icon,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.container, 
        selected && styles.selected, 
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <BlurView intensity={selected ? 40 : 25} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={
            selected 
              ? ['rgba(139, 92, 246, 0.35)', 'rgba(99, 102, 241, 0.2)'] 
              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text, 
            selected && styles.selectedText,
            disabled && styles.disabledText,
            textStyle
          ]}>
            {title}
          </Text>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 48,
  },
  selected: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  disabled: {
    opacity: 0.5,
  },
  blur: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledText: {
    color: 'rgba(255,255,255,0.4)',
  },
});
