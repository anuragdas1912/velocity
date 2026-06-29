import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

const ORB_SIZE = 170;

export interface MatrixSphereProps {
  proximityToTarget?: number;
}

export const MatrixSphere: React.FC<MatrixSphereProps> = ({
  proximityToTarget = 0.5,
}) => {
  const scale = useSharedValue(1);
  const borderMorph1 = useSharedValue(60);
  const borderMorph2 = useSharedValue(40);
  const borderMorph3 = useSharedValue(50);
  const borderMorph4 = useSharedValue(45);

  const duration = proximityToTarget > 0.8 ? 1000 : 2500;

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: duration }),
      -1,
      true
    );

    borderMorph1.value = withRepeat(
      withSequence(
        withTiming(45, { duration: 3000 }),
        withTiming(65, { duration: 3000 }),
        withTiming(55, { duration: 3000 })
      ),
      -1,
      true
    );

    borderMorph2.value = withRepeat(
      withSequence(
        withTiming(65, { duration: 3200 }),
        withTiming(45, { duration: 2800 }),
        withTiming(50, { duration: 3000 })
      ),
      -1,
      true
    );

    borderMorph3.value = withRepeat(
      withSequence(
        withTiming(55, { duration: 2900 }),
        withTiming(50, { duration: 3100 }),
        withTiming(60, { duration: 3000 })
      ),
      -1,
      true
    );

    borderMorph4.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 3100 }),
        withTiming(60, { duration: 2900 }),
        withTiming(45, { duration: 3000 })
      ),
      -1,
      true
    );
  }, [proximityToTarget]);

  const animatedOrbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: '15deg' } // Static tilt for 3D depth orientation
      ],
      borderTopLeftRadius: borderMorph1.value * 2,
      borderTopRightRadius: borderMorph2.value * 2,
      borderBottomLeftRadius: borderMorph3.value * 2,
      borderBottomRightRadius: borderMorph4.value * 2,
    };
  });

  const glowColor = proximityToTarget > 0.8 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
  const coreBg = proximityToTarget > 0.8 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)';

  return (
    <View style={styles.container}>
      {/* 3D Perspective Rotation Container */}
      <View style={styles.perspectiveWrapper}>
        {/* Outer Halo rings tilted in 3D */}
        <View style={[styles.haloRing, { borderColor: glowColor, transform: [{ scale: 1.25 }] }]} />
        <View style={[styles.haloRing, { borderColor: glowColor, transform: [{ scale: 1.55 }], opacity: 0.3 }]} />

        {/* Morphing glassmorphic blob */}
        <Animated.View style={[styles.orb, animatedOrbStyle, { backgroundColor: coreBg, borderColor: glowColor }]}>
          <GlassCard intensity={45} tint="dark" style={styles.glassFill}>
            <View style={[styles.innerCore, { 
              backgroundColor: proximityToTarget > 0.8 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            }]} />
          </GlassCard>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perspectiveWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { perspective: 800 },
      { rotateX: '20deg' },  // Tilt back
      { rotateY: '-15deg' }  // Tilt side
    ],
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ORB_SIZE / 2,
  },
  innerCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  haloRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
});
