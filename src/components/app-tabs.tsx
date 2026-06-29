import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { GlassCard } from './GlassCard';
import { useHaptics } from '../hooks/useHaptics';
import { Compass, Cpu, Target } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

// Calculate width of the tab bar
const { width: windowWidth } = Dimensions.get('window');
const TAB_BAR_MAX_WIDTH = 480;
const TAB_BAR_WIDTH = Math.min(windowWidth - 40, TAB_BAR_MAX_WIDTH);
const TAB_PADDING = 6;
const TAB_WIDTH = (TAB_BAR_WIDTH - (TAB_PADDING * 2)) / 3;

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const haptics = useHaptics();
  const activeIndex = state.index;
  const indicatorTranslateX = useSharedValue(0);

  // Animate indicator whenever activeIndex changes
  useEffect(() => {
    indicatorTranslateX.value = withSpring(activeIndex * TAB_WIDTH, {
      damping: 18,
      stiffness: 150,
    });
  }, [activeIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorTranslateX.value }],
    };
  });

  const getIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? '#FFFFFF' : '#71717A';
    switch (routeName) {
      case 'index':
        return <Cpu size={18} color={color} />;
      case 'quantum':
        return <Compass size={18} color={color} />;
      case 'target':
        return <Target size={18} color={color} />;
      default:
        return <Cpu size={18} color={color} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'MATRIX';
      case 'quantum':
        return 'QUANTUM';
      case 'target':
        return 'TARGET';
      default:
        return routeName.toUpperCase();
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <GlassCard intensity={65} tint="dark" style={[styles.tabBar, { width: TAB_BAR_WIDTH }]}>
        {/* Sliding Pill Indicator */}
        <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = getLabel(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              haptics.selection();
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
            >
              {getIcon(route.name, isFocused)}
              <Text style={[styles.tabLabel, { color: isFocused ? '#FFFFFF' : '#71717A' }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </GlassCard>
    </View>
  );
};

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matrix',
        }}
      />
      <Tabs.Screen
        name="quantum"
        options={{
          title: 'Quantum Flow',
        }}
      />
      <Tabs.Screen
        name="target"
        options={{
          title: 'Target Core',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  tabBar: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TAB_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 20,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  activeIndicator: {
    position: 'absolute',
    left: TAB_PADDING,
    width: TAB_WIDTH,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 10,
  },
});
