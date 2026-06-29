import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const AmbientBackground: React.FC = () => {
  // Shared values for drifting background auroras
  const glow1X = useSharedValue(-80);
  const glow1Y = useSharedValue(-80);
  
  const glow2X = useSharedValue(windowWidth - 100);
  const glow2Y = useSharedValue(windowHeight / 2);

  useEffect(() => {
    glow1X.value = withRepeat(
      withSequence(
        withTiming(windowWidth * 0.25, { duration: 25000 }),
        withTiming(-100, { duration: 30000 }),
        withTiming(windowWidth * 0.05, { duration: 22000 })
      ),
      -1,
      true
    );

    glow1Y.value = withRepeat(
      withSequence(
        withTiming(windowHeight * 0.3, { duration: 28000 }),
        withTiming(-80, { duration: 24000 }),
        withTiming(windowHeight * 0.45, { duration: 32000 })
      ),
      -1,
      true
    );

    glow2X.value = withRepeat(
      withSequence(
        withTiming(windowWidth * 0.4, { duration: 32000 }),
        withTiming(windowWidth - 60, { duration: 26000 }),
        withTiming(windowWidth * 0.15, { duration: 29000 })
      ),
      -1,
      true
    );

    glow2Y.value = withRepeat(
      withSequence(
        withTiming(windowHeight * 0.65, { duration: 27000 }),
        withTiming(windowHeight / 4, { duration: 35000 }),
        withTiming(windowHeight * 0.75, { duration: 26000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedGlow1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: glow1X.value },
        { translateY: glow1Y.value }
      ],
    };
  });

  const animatedGlow2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: glow2X.value },
        { translateY: glow2Y.value }
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Jet Black Base */}
      <View style={styles.darkBase} />

      {/* Deep Royal Purple Glow */}
      <Animated.View style={[styles.glowBlob, styles.glowPurple, animatedGlow1Style]} />

      {/* Deep Emerald Forest Glow */}
      <Animated.View style={[styles.glowBlob, styles.glowTeal, animatedGlow2Style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  darkBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 250,
    width: 380,
    height: 380,
    opacity: 0.08, // Very dim, ultra-subtle luxury ambient lighting
  },
  glowPurple: {
    backgroundColor: '#312E81', // Deep indigo purple
  },
  glowTeal: {
    backgroundColor: '#064E3B', // Deep forest/teal green
  },
});
