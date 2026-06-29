import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'light' ? 'light' : 'dark';

  return Colors[theme];
}
