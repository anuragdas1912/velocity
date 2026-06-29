import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  intensity = 50,
  tint = 'dark',
  children,
  style,
  ...props
}) => {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webContainer,
          {
            backgroundColor: tint === 'dark' ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: tint === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        styles.container,
        {
          borderColor: tint === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  webContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    // Fallback blur for web, casted to avoid React Native TypeScript compiler warnings
    ...({
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    } as any),
  },
});
