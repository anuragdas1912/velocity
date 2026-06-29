import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface TargetTorusProps {
  progress: number;
  color?: string;
}

export const TargetTorus: React.FC<TargetTorusProps> = ({ progress, color = '#FFFFFF' }) => {
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Shared value for animated stroke dashoffset
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 90,
    });
  }, [progress]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        {/* Background Track Circle */}
        <Circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress Circle */}
        <AnimatedCircle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          transform="rotate(-90 80 80)" // Rotates to start progress from the top center
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
