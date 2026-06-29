import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useHaptics = () => {
  const triggerHaptic = async (action: () => Promise<void>) => {
    if (Platform.OS === 'web') return;
    try {
      await action();
    } catch (e) {
      // Degrade gracefully on simulators or unsupporting devices
    }
  };

  const light = () => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  const medium = () => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  const heavy = () => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  const selection = () => triggerHaptic(() => Haptics.selectionAsync());
  
  const success = () => triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  const warning = () => triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  const error = () => triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
  };
};
